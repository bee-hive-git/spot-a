"use client";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";

type Orient = "none" | "flipY" | "flipX" | "rotate180";
type Fit = "cover" | "contain";

type CacheEntry = { tex: THREE.Texture; bmp?: ImageBitmap; img?: HTMLImageElement };

type Props = {
  count: number;
  fps?: number;
  dir: string;
  base: string;
  pad?: number;
  ext?: "webp" | "png" | "jpg"; // primary extension (default)
  extCandidates?: ("webp" | "png" | "jpg")[]; // optional fallback chain
  start?: number;
  progress?: number;      // 0..1 (scrub)
  // Quando presente, multiplica o range de scroll por "loops" e faz wrap (p*loops % 1)
  loops?: number;         // default 1 = sem repetição; 2+ = repete durante o scroll
  visible?: boolean;
  active?: boolean;       // loop
  renderOrder?: number;
  size?: [number, number]; // base do plano (ex.: [16,9])
  maxCache?: number;      // LRU
  orient?: Orient;        // orientação do frame
  fit?: Fit;              // cover = preenche, contain = mostra tudo
  yPct?: number;      // ← NOVO (default 0). + sobe, – desce. Em % da altura da viewport do Canvas
  zoom?: number;      // ← NOVO (default 1). 1.06 = 6% maior
};

export default function ImagenSequenceLite({
  count,
  fps = 60,
  dir,
  base,
  pad = 3,
  ext = "webp",
  extCandidates,
  start = 1,
  progress,
  loops = 1,
  visible = true,
  active = true,
  renderOrder = 0,
  size: planeSize = [16, 9],
  maxCache = 3,
  orient = "none",
  fit = "cover",
  yPct = 0,
  zoom = 1,
}: Props) {
  const { invalidate, camera, size: viewport } = useThree();
  const meshRef = useRef<THREE.Mesh>(null!);
  const matRef = useRef<THREE.MeshBasicMaterial>(null!);
  const timeRef = useRef(0);
  const cacheRef = useRef<Map<number, CacheEntry>>(new Map());
  const aliveRef = useRef(true);
  const inflightRef = useRef<Map<number, AbortController>>(new Map());

  // URLs dos frames
  const urls = useMemo(
    () =>
      Array.from({ length: count }, (_, i) =>
        `${dir}/${base}${String(start + i).padStart(pad, "0")}`
      ),
    [count, dir, base, pad, start]
  );

  useEffect(() => {
    return () => {
      aliveRef.current = false;
      cacheRef.current.forEach((e) => {
        e.tex.dispose();
        try { 
          if (e.bmp && 'close' in e.bmp && typeof e.bmp.close === 'function') {
            e.bmp.close();
          }
        } catch {}
      });
      cacheRef.current.clear();
      inflightRef.current.forEach((c) => { try { c.abort(); } catch {} });
      inflightRef.current.clear();
    };
  }, []);

  // ====== Auto-resize: escala o plano conforme a viewport do Canvas ======
  useEffect(() => {
    if (!meshRef.current) return;
    const cam = camera as THREE.PerspectiveCamera;

    // altura/largura visíveis na cena (em unidades 3D)
    const dist = Math.abs(cam.position.z - 0);            // plano em z=0
    const vFov = THREE.MathUtils.degToRad(cam.fov);
    const viewH = 2 * Math.tan(vFov / 2) * dist;
    const viewW = viewH * cam.aspect;

    const [baseW, baseH] = planeSize;                     // ex.: 16x9
    const sCover   = Math.max(viewW / baseW, viewH / baseH);
    const sContain = Math.min(viewW / baseW, viewH / baseH);
    const s = (fit === "cover" ? sCover : sContain) * zoom;

    // aplica escala
    meshRef.current.scale.set(s, s, 1);

    // dimensões do plano já escalado
    const planeH = baseH * s;

    // margem vertical máxima sem “vazar”; se o plano for maior que a viewport, zera
    const maxYOffset = Math.max(0, (viewH - planeH) / 2);

    // deslocamento solicitado (yPct é % da meia-altura visível)
    const desiredY = (yPct / 100) * (viewH / 2);

    // clamp para não cortar no topo/fundo
    const y = THREE.MathUtils.clamp(desiredY, -maxYOffset, maxYOffset);
    meshRef.current.position.set(0, y, 0);

    invalidate(); // útil caso esteja com frameloop="demand"
  }, [
    camera,
    viewport.width,
    viewport.height,
    fit,
    planeSize[0],
    planeSize[1],
    yPct,
    zoom,
    invalidate,
  ]);


  // ====== Loader LRU ======
  // detecta qualidade da conexão para ajustar janela de prefetch
  function getPrefetchWindow(): number {
    const conn = (navigator as any).connection?.effectiveType as string | undefined;
    if (!conn) return 1; // default conservador
    if (conn.includes("2g")) return 1;
    if (conn.includes("3g")) return 1;
    return 2; // 4g ou melhor
  }

  async function loadTexture(idx: number, isPrefetch: boolean = false): Promise<THREE.Texture | null> {
    if (!aliveRef.current) return null;
    const c = cacheRef.current;
    const hit = c.get(idx);
    if (hit) { c.delete(idx); c.set(idx, hit); return hit.tex; }
    const name = urls[idx];
    const candidates = (extCandidates && extCandidates.length > 0) ? extCandidates : [ext];
    let tex: THREE.Texture | null = null;
    // limita concorrência durante prefetch para evitar excesso de requisições
    const PREFETCH_CONCURRENCY_LIMIT = 1;
    if (isPrefetch && inflightRef.current.size >= PREFETCH_CONCURRENCY_LIMIT) {
      return null;
    }
    const ac = new AbortController();
    inflightRef.current.set(idx, ac);
    try {
      // tenta nas extensões em ordem
      for (const ex of candidates) {
        const url = `${name}.${ex}`;
        try {
          if ("createImageBitmap" in window) {
            const res = await fetch(url, { cache: "force-cache", signal: ac.signal });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const blob = await res.blob();
            const bmp = await createImageBitmap(blob);
            tex = new THREE.Texture(bmp);
            (tex as THREE.Texture & { __bmp?: ImageBitmap }).__bmp = bmp;
          } else {
            const img = await new Promise<HTMLImageElement>((ok, err) => {
              const im = new Image(); im.onload = () => ok(im); im.onerror = err; im.src = url;
            });
            tex = new THREE.Texture(img);
            (tex as THREE.Texture & { __img?: HTMLImageElement }).__img = img;
          }
          // sucesso nesta extensão
          break;
        } catch (e) {
          tex = null; // tenta próxima extensão
          continue;
        }
      }

      if (!tex) return null;

      tex.colorSpace = THREE.SRGBColorSpace;
      tex.flipY = false; // controlamos flip via orient
      tex.magFilter = THREE.LinearFilter;
      tex.minFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      tex.needsUpdate = true;

      c.set(idx, { tex });
      if (c.size > maxCache) {
        const oldest = c.keys().next().value;
        if (oldest !== undefined) {
          c.get(oldest)?.tex.dispose();
          c.delete(oldest);
        }
      }
      return tex;
    } catch {
      return null;
    }
    }

  // ====== Aplica frame + orientação ======
  async function showFrame(idx: number) {
    const tex = await loadTexture(idx);
    if (!tex || !matRef.current) return;

    if (matRef.current.map !== tex) {
      matRef.current.map = tex;

      const map = matRef.current.map!;
      map.wrapS = THREE.RepeatWrapping;
      map.wrapT = THREE.RepeatWrapping;

      // zera transformações anteriores
      map.center.set(0.5, 0.5);
      map.rotation = 0;
      map.repeat.set(1, 1);
      map.offset.set(0, 0);

      // orientação solicitada
      if (orient === "flipY") {
        map.repeat.y = -1;
        map.offset.y = 1;
      } else if (orient === "flipX") {
        map.repeat.x = -1;
        map.offset.x = 1;
      } else if (orient === "rotate180") {
        map.rotation = Math.PI;
      }
      map.needsUpdate = true;

      matRef.current.needsUpdate = true;
      invalidate();
    }
  }

  // prefetch inteligente com janela adaptativa
  function prefetchWindowFrom(idx: number) {
    const win = getPrefetchWindow();
    for (let k = 1; k <= win; k++) {
      const n = Math.min(count - 1, idx + k);
      if (!cacheRef.current.has(n) && !inflightRef.current.has(n)) void loadTexture(n, true);
    }
  }

  // ====== Scrub (scroll) ======
  useEffect(() => {
    if (typeof progress !== "number") return;
    // Quando loops == 1, NÃO faz wrap — usa o último frame no final do scroll.
    const totalLoops = Math.max(1, Math.floor(loops));
    const pClamped = Math.min(1, Math.max(0, progress));
    const pEff = totalLoops > 1
      ? ((pClamped * totalLoops) % 1) // wrap apenas se loops>1
      : pClamped;                      // sem wrap: 0..1 inteiro
    const idx = Math.min(count - 1, Math.max(0, Math.floor(pEff * (count - 1) + 0.00001)));
    showFrame(idx);
    prefetchWindowFrom(idx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, loops, count]);

  // ====== Loop com timer (frameloop="demand") ======
  useEffect(() => {
    if (typeof progress === "number") return; // se tem scrub, não loopeia
    if (!active) return;

    const intervalMs = Math.max(1000 / fps, 16);
    let id: ReturnType<typeof setInterval> | null = null;

    const tick = () => {
      if (!aliveRef.current) return;
      if (document.hidden) return;
      // avança 1 frame por tick
      const next = (Math.floor(timeRef.current) + 1) % count;
      timeRef.current = next;
      showFrame(next);
      prefetchWindowFrom(next);
    };

    id = setInterval(tick, intervalMs);
    return () => { if (id) clearInterval(id); };
  }, [progress, active, fps, count]);

  // mantém montado (evita flicker); controla só visibility
  return (
    <mesh ref={meshRef} visible={visible} renderOrder={renderOrder}>
      <planeGeometry args={planeSize} />
      <meshBasicMaterial
        ref={matRef}
        transparent
        alphaTest={0.01}
        depthWrite={false}
        depthTest={false}
        toneMapped={false}
      />
    </mesh>
  );
}

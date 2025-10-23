"use client";
import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";
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
  ext?: "webp" | "png" | "jpg";
  start?: number;
  progress?: number;      // 0..1 (scrub)
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
  start = 1,
  progress,
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

  // URLs dos frames
  const urls = useMemo(
    () =>
      Array.from({ length: count }, (_, i) =>
        `${dir}/${base}${String(start + i).padStart(pad, "0")}.${ext}`
      ),
    [count, dir, base, pad, ext, start]
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
  async function loadTexture(idx: number): Promise<THREE.Texture | null> {
    if (!aliveRef.current) return null;
    const c = cacheRef.current;
    const hit = c.get(idx);
    if (hit) { c.delete(idx); c.set(idx, hit); return hit.tex; }

    const url = urls[idx];
    try {
      let tex: THREE.Texture;
      if ("createImageBitmap" in window) {
        const res = await fetch(url, { cache: "force-cache" });
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

  function prefetch(idx: number) {
    const n = Math.min(count - 1, idx + 1);
    if (!cacheRef.current.has(n)) void loadTexture(n);
  }

  // ====== Scrub (scroll) ======
  useEffect(() => {
    if (typeof progress !== "number") return;
    const p = progress;
    const idx = Math.min(count - 1, Math.max(0, Math.floor(p * (count - 1))));
    showFrame(idx);
    prefetch(idx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, count]);

  // ====== Loop ======
  useFrame((_, dt) => {
    if (typeof progress === "number") return; // se tem scrub, não loopeia
    if (!active) return;
    timeRef.current = (timeRef.current + fps * dt) % count;
    const idx = Math.floor(timeRef.current);
    showFrame(idx);
    prefetch(idx);
  });

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

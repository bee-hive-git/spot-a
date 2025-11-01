"use client";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef } from "react";

type Orient = "none" | "flipY" | "flipX" | "rotate180";
type Fit = "cover" | "contain";

type CacheEntry = { tex: THREE.Texture; bmp?: ImageBitmap; img?: HTMLImageElement };

type Props = {
  count: number;
  fps?: number;
  dir: string;
  base: string;
  pad?: number;
  ext?: "webp" | "png" | "jpg" | "avif";
  extCandidates?: ("webp" | "png" | "jpg" | "avif")[];
  sources?: string[]; // optional list of absolute frame URLs; if provided, use sources[index] with fallback
  start?: number;
  progress?: number; // 0..1
  loops?: number;
  visible?: boolean;
  active?: boolean;
  renderOrder?: number;
  size?: [number, number];
  maxCache?: number;
  // Ajustes de performance
  netProfileOverride?: { MAX_INFLIGHT?: number; WINDOW?: number };
  prefetchWindow?: number;
  orient?: Orient;
  fit?: Fit;
  yPct?: number;
  zoom?: number;
};

export default function ImagenSequenceLite({
  count,
  fps = 60,
  dir,
  base,
  pad = 3,
  ext = "webp",
  extCandidates,
  sources,
  start = 1,
  progress,
  loops = 1,
  visible = true,
  active = true,
  renderOrder = 0,
  size: planeSize = [16, 9],
  maxCache = 3,
  netProfileOverride,
  prefetchWindow,
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

  // Build URL base respecting absolute or relative dir, trimming trailing slash
  const isAbs = useMemo(() => dir.startsWith("http://") || dir.startsWith("https://"), [dir]);
  const prefix = useMemo(() => (isAbs ? dir.replace(/\/$/, "") : `${dir}`.replace(/\/$/, "")), [dir, isAbs]);
  const baseNameFor = useCallback(
    (i: number) => `${prefix}/${base}${String(i).padStart(pad, "0")}`,
    [prefix, base, pad]
  );

  // Precomputed base names (without extension) for each frame index
  const urls = useMemo(
    () => Array.from({ length: count }, (_, i) => baseNameFor(start + i)),
    [count, baseNameFor, start]
  );

  // cleanup seguro (captura refs)
  useEffect(() => {
    const cache = cacheRef.current;
    const inflight = inflightRef.current;

    return () => {
      aliveRef.current = false;
      cache.forEach((e) => {
        e.tex.dispose();
        try {
          if (e.bmp && "close" in e.bmp && typeof (e.bmp as ImageBitmap).close === "function") {
            (e.bmp as ImageBitmap).close();
          }
        } catch {
          /* noop */
        }
      });
      cache.clear();
      inflight.forEach((c) => {
        try {
          c.abort();
        } catch {
          /* noop */
        }
      });
      inflight.clear();
    };
  }, []);

  // resize
  const planeW = planeSize[0];
  const planeH = planeSize[1];

  useEffect(() => {
    if (!meshRef.current) return;
    const cam = camera as THREE.PerspectiveCamera;

    const dist = Math.abs(cam.position.z - 0);
    const vFov = THREE.MathUtils.degToRad(cam.fov);
    const viewH = 2 * Math.tan(vFov / 2) * dist;
    const viewW = viewH * cam.aspect;

    const sCover = Math.max(viewW / planeW, viewH / planeH);
    const sContain = Math.min(viewW / planeW, viewH / planeH);
    const s = (fit === "cover" ? sCover : sContain) * zoom;

    meshRef.current.scale.set(s, s, 1);

    const scaledPlaneH = planeH * s;
    const maxYOffset = Math.max(0, (viewH - scaledPlaneH) / 2);
    const desiredY = (yPct / 100) * (viewH / 2);
    const y = THREE.MathUtils.clamp(desiredY, -maxYOffset, maxYOffset);

    meshRef.current.position.set(0, y, 0);
    invalidate();
  }, [camera, viewport.width, viewport.height, fit, planeW, planeH, yPct, zoom, invalidate]);

  // Perfil de rede → janela e concorrência
  const getNetProfile = useCallback(() => {
    type NavigatorWithConn = Navigator & { connection?: { effectiveType?: string } };
    const et = (navigator as NavigatorWithConn).connection?.effectiveType || "4g";
    const slow = /2g|3g/.test(et);
    const defaults = { MAX_INFLIGHT: slow ? 3 : 6, WINDOW: slow ? 12 : 28 };
    return {
      MAX_INFLIGHT: netProfileOverride?.MAX_INFLIGHT ?? defaults.MAX_INFLIGHT,
      WINDOW: netProfileOverride?.WINDOW ?? defaults.WINDOW,
    };
  }, [netProfileOverride]);

  // loadTexture
  const loadTexture = useCallback(
    async (idx: number, isPrefetch = false): Promise<THREE.Texture | null> => {
      if (!aliveRef.current) return null;

      const c = cacheRef.current;
      const hit = c.get(idx);
      if (hit) {
        c.delete(idx);
        c.set(idx, hit);
        return hit.tex;
      }

      const name = urls[idx];
      const candidates = extCandidates && extCandidates.length > 0 ? extCandidates : [ext];
      let tex: THREE.Texture | null = null;

      const { MAX_INFLIGHT } = getNetProfile();
      if (isPrefetch && inflightRef.current.size >= MAX_INFLIGHT) {
        return null;
      }

      const ac = new AbortController();
      inflightRef.current.set(idx, ac);

      try {
        // If caller provided explicit source URL for this frame, try it first
        const explicit = Array.isArray(sources) && sources[idx] ? sources[idx] : null;
        const tryList = explicit ? [explicit] : candidates.map((ex) => `${name}.${ex}`);

        for (const url of tryList) {
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
                const im = new Image();
                im.onload = () => ok(im);
                im.onerror = err as (ev: string | Event) => void;
                im.src = url;
              });
              tex = new THREE.Texture(img);
              (tex as THREE.Texture & { __img?: HTMLImageElement }).__img = img;
            }
            break;
          } catch {
            tex = null;
            continue;
          }
        }

        if (!tex) return null;

        tex.colorSpace = THREE.SRGBColorSpace;
        tex.flipY = false;
        tex.magFilter = THREE.LinearFilter;
        tex.minFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
        tex.needsUpdate = true;

        c.set(idx, { tex });
        if (c.size > maxCache) {
          const oldest = c.keys().next().value as number | undefined;
          if (oldest !== undefined) {
            c.get(oldest)?.tex.dispose();
            c.delete(oldest);
          }
        }
        return tex;
      } catch {
        return null;
      } finally {
        inflightRef.current.delete(idx);
      }
    },
    [urls, extCandidates, ext, maxCache, sources, getNetProfile]
  );

  // showFrame
  const showFrame = useCallback(
    async (idx: number) => {
      const tex = await loadTexture(idx);
      if (!tex || !matRef.current) return;

      if (matRef.current.map !== tex) {
        matRef.current.map = tex;

        const map = matRef.current.map!;
        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = THREE.RepeatWrapping;

        map.center.set(0.5, 0.5);
        map.rotation = 0;
        map.repeat.set(1, 1);
        map.offset.set(0, 0);

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
    },
    [invalidate, loadTexture, orient]
  );

  // prefetch
  const prefetchWindowFrom = useCallback(
    (idx: number) => {
      const { WINDOW } = getNetProfile();
      const desired = prefetchWindow ?? WINDOW;
      const limit = Math.max(0, Math.min(desired, count - 1));
      const schedule = (fn: () => void) => {
        if (typeof window !== "undefined" && "requestIdleCallback" in window) {
          
          (window as any).requestIdleCallback(fn, { timeout: 100 });
        } else {
          setTimeout(fn, 0);
        }
      };
      schedule(() => {
        for (let k = 1; k <= limit; k++) {
          const n = Math.min(count - 1, idx + k);
          if (!cacheRef.current.has(n) && !inflightRef.current.has(n)) {
            void loadTexture(n, true);
          }
        }
      });
    },
    [count, getNetProfile, loadTexture, prefetchWindow]
  );

  // scrub
  useEffect(() => {
    if (typeof progress !== "number") return;
    const totalLoops = Math.max(1, Math.floor(loops));
    const pClamped = Math.min(1, Math.max(0, progress));
    const pEff = totalLoops > 1 ? (pClamped * totalLoops) % 1 : pClamped;
    const idx = Math.min(count - 1, Math.max(0, Math.floor(pEff * (count - 1) + 0.00001)));
    void showFrame(idx);
    prefetchWindowFrom(idx);
  }, [progress, loops, count, showFrame, prefetchWindowFrom]);

  // loop
  useEffect(() => {
    if (typeof progress === "number") return;
    if (!active) return;

    const intervalMs = Math.max(1000 / fps, 16);
    let id: ReturnType<typeof setInterval> | null = null;

    const tick = () => {
      if (!aliveRef.current) return;
      if (document.hidden) return;
      const next = (Math.floor(timeRef.current) + 1) % count;
      timeRef.current = next;
      void showFrame(next);
      prefetchWindowFrom(next);
    };

    id = setInterval(tick, intervalMs);
    return () => {
      if (id) clearInterval(id);
    };
  }, [progress, active, fps, count, showFrame, prefetchWindowFrom]);

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

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
  ext?: "webp" | "png" | "jpg";
  extCandidates?: ("webp" | "png" | "jpg")[];
  start?: number;
  progress?: number; // 0..1
  loops?: number;
  visible?: boolean;
  active?: boolean;
  renderOrder?: number;
  size?: [number, number];
  maxCache?: number;
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

  // URLs
  const urls = useMemo(
    () =>
      Array.from({ length: count }, (_, i) =>
        `${dir}/${base}${String(start + i).padStart(pad, "0")}`
      ),
    [count, dir, base, pad, start]
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

  // prefetch window
  const getPrefetchWindow = useCallback((): number => {
    type NavigatorWithConn = Navigator & { connection?: { effectiveType?: string } };
    const conn = (navigator as NavigatorWithConn).connection?.effectiveType;
    if (!conn) return 1;
    if (conn.includes("2g")) return 1;
    if (conn.includes("3g")) return 1;
    return 2;
  }, []);

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

      const PREFETCH_CONCURRENCY_LIMIT = 1;
      if (isPrefetch && inflightRef.current.size >= PREFETCH_CONCURRENCY_LIMIT) {
        return null;
      }

      const ac = new AbortController();
      inflightRef.current.set(idx, ac);

      try {
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
    [urls, extCandidates, ext, maxCache]
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
      const win = getPrefetchWindow();
      for (let k = 1; k <= win; k++) {
        const n = Math.min(count - 1, idx + k);
        if (!cacheRef.current.has(n) && !inflightRef.current.has(n)) {
          void loadTexture(n, true);
        }
      }
    },
    [count, getPrefetchWindow, loadTexture]
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

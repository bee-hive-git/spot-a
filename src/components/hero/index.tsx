"use client";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import HeroScrollComposite from "./components/HeroScrollComposite";
import HeroStats from "./components/HeroStats";

// ===== Config específica para scroll =====
const seqPropsScroll = {
  orient: "flipY" as const,
  fit: "cover" as const,
  yPct: 15,
  zoom: 1.1,
};

export default function Hero() {
  const [scrollP, setScrollP] = useState(0);
  const pinRef = useRef<HTMLDivElement>(null);

  // Estado para controlar quando mostrar as estatísticas (último frame)
  const [showStats, setShowStats] = useState(false);
  const showStatsRef = useRef(showStats);
  useEffect(() => {
    showStatsRef.current = showStats;
  }, [showStats]);

  // ==== CONTROLES (pode mexer ao vivo) ====
  const [rangePct, setRangePct] = useState(200);   // RANGE em %
  const [fadeEndPct, setFadeEndPct] = useState(35); // mantido no painel (não usado no cálculo abaixo)
  const [scrubSmooth, setScrubSmooth] = useState(0); // 0 = scrub 1:1; >0 = suavização (segundos)
  const [showMarkers, setShowMarkers] = useState(false);
  const [hideGrid, setHideGrid] = useState(true);
  const [showDebug, setShowDebug] = useState(true);

  // Toggle painel no teclado (G)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "g") setShowDebug((s) => !s);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useLayoutEffect(() => {
    let ctx: { revert: () => void } | null = null;

    (async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const el = pinRef.current;
      if (!el) return;

      // ===== CONTROLES dinâmicos =====
      const RANGE = `+=${rangePct}%`;                  // tempo total do pin
      const SCRUB: true | number = scrubSmooth === 0 ? true : scrubSmooth;
      const FADE_START_P = 0.005;                      // ponto em que o fade começa
      const FADE_SPAN_P  = 0.10;                       // duração do fade no progresso

      ctx = (gsap as any).context(() => {
        // 1) PIN do Hero (dirige Canvas + fade por progress)
        ScrollTrigger.create({
          trigger: el,
          start: "top top",
          end: RANGE,
          scrub: SCRUB,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          markers: showMarkers,
          onUpdate: (s) => {
            // mantém sua seq-scroll
            setScrollP(s.progress);

            // Detecta quando chegou próximo ao último frame (95% do progresso)
            if (s.progress >= 0.95) {
              if (showStatsRef.current) {
                setShowStats(false);
                setTimeout(() => setShowStats(true), 50);
              } else {
                setShowStats(true);
              }
            } else if (s.progress < 0.95 && showStatsRef.current) {
              setShowStats(false);
            }

            // === Fade sincronizado ao progress ===
            const p = s.progress; // 0 → 1
            let t = (p - FADE_START_P) / FADE_SPAN_P;
            if (t < 0) t = 0;
            if (t > 1) t = 1;

            const alpha = 1 - t;
            gsap.set("#hero-content", { autoAlpha: alpha, yPercent: -6 * t });

            const gridAlpha = hideGrid ? 0 : alpha;
            gsap.set(".bg-grid", { autoAlpha: gridAlpha });

            const hc = document.getElementById("hero-content");
            if (hc) hc.style.pointerEvents = alpha < 0.95 ? "none" : "auto";

            // === Fade das estatísticas (lógica inversa) ===
            const STATS_START_P = 0.85;
            const STATS_SPAN_P = 0.15;

            let statsT = (p - STATS_START_P) / STATS_SPAN_P;
            if (statsT < 0) statsT = 0;
            if (statsT > 1) statsT = 1;

            const statsAlpha = statsT;
            gsap.set("#hero-stats", { autoAlpha: statsAlpha, yPercent: 6 * (1 - statsT) });
          },
        });

        // 2) Paralaxe do Canvas
        gsap.to("#hero-canvas-wrap", {
          yPercent: 8,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top top", end: RANGE, scrub: SCRUB, markers: showMarkers },
        });
      }, el as any);
    })();

    return () => ctx?.revert();
  }, [rangePct, scrubSmooth, showMarkers, hideGrid]); // <- sem 'showStats' aqui (usamos ref)

  const showScroll = true;

  return (
    <section
      id="hero"
      ref={pinRef}
      className="relative overflow-hidden bg-[#010510]"
      style={{ height: "100vh" }}
    >
      {/* Fundo do Hero */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundColor: "#010510",
          backgroundImage: 'url("/hero/fundo.png")',
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Canvas - Animação sempre abaixo dos botões e ocupando toda a largura */}
      <div
        id="hero-canvas-wrap"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          margin: 0,
          padding: 0,
          overflow: "hidden",
          zIndex: -1,
          pointerEvents: "none",
        }}
      >
        <Canvas
          style={{
            background: "transparent",
            width: "100%",
            height: "100%",
            display: "block",
            margin: 0,
            padding: 0,
            position: "absolute",
            top: 0,
            left: 0,
          }}
          dpr={[1, 1.2]}
          frameloop="demand"
          gl={{
            alpha: true,
            premultipliedAlpha: true,
            antialias: false,
            depth: false,
            stencil: false,
            powerPreference: "low-power",
          }}
          camera={{ position: [0, 0, 9.5], fov: 50 }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.NoToneMapping;
          }}
        >
          <HeroScrollComposite progress={scrollP} visible={showScroll} {...seqPropsScroll} />
        </Canvas>
      </div>

      {/* Overlays */}
      <div className="pointer-events-none absolute inset-0 z-[5] bg-grid opacity-[0.90]" />
      <div className="pointer-events-none absolute inset-0 z-[6] bg-gradient-to-b from-transparent via-transparent to-transparent" />

      {/* Conteúdo do Hero (texto/CTAs) */}
      <div id="hero-content" className="relative z-[2000] mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-14">
        {/* topbar */}
        <div className="flex items-center justify-between pt-6 sm:pt-8 md:pt-9 lg:pt-11">
          <span
            className="select-none text-white text-center text-sm sm:text-base md:text-lg"
            style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500, fontStyle: "italic", lineHeight: "100%" }}
          >
            SPOT-A
          </span>

          <Link
            href="#contato"
            className="inline-flex items-center justify-center rounded-[33.9px] border border-[#F3C53D]/60 bg-black/20 backdrop-blur-md h-8 sm:h-10 md:h-[46px] lg:h-[52px] px-3 sm:px-4 md:px-5 lg:px-6 transition-colors hover:border-[#F3C53D] text-xs sm:text-sm"
            style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500, textShadow: "0 0 4px rgba(255,255,255,.65)" }}
          >
            Contate-nos
          </Link>
        </div>

        {/* bloco central */}
        <div className="mx-auto flex max-w-[1100px] flex-col items-center text-center pt-12 sm:pt-16 md:pt-24 lg:pt-36 xl:pt-2">
          <h1
            className="bg-clip-text text-transparent tracking-tight px-2 sm:px-4"
            style={{
              fontFamily: "Proxima Nova, sans-serif",
              fontWeight: 600,
              fontSize: "clamp(24px, 6.5vw, 66px)",
              lineHeight: "110%",
              background:
                "linear-gradient(180deg,#FFFFFF -11.46%,#FFFFFF 36.26%,#B5AEAE 58.06%,#DCDCDC 81.04%,#0B0B0B 111.08%)",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            <span className="sm:hidden">
              <span className="block">Tráfego Pago para Atrair</span>
              <span className="block">Leads Qualificados</span>
              <span className="block">e Escalar Vendas</span>
            </span>
            <span className="hidden sm:block">
              <span className="block">Tráfego Pago para Atrair Leads</span>
              <span className="block">Qualificados e Escalar Vendas</span>
            </span>
          </h1>

          <p
            className="mt-4 sm:mt-5 md:mt-6 text-white/90 px-3 sm:px-4 max-w-[92%] sm:max-w-[80%] md:max-w-full"
            style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500, fontSize: "clamp(14px, 3.4vw, 19px)", lineHeight: "138%" }}
          >
            <span className="sm:hidden">
              <span className="block">Transformamos marcas em potências digitais</span>
              <span className="block">com estratégias de tráfego pago personalizadas,</span>
              <span className="block">foco em leads qualificados e alta performance.</span>
            </span>
            <span className="hidden sm:block">
              <span className="block">Transformamos marcas em potências digitais com estratégias de tráfego pago</span>
              <span className="block">personalizadas, foco em leads qualificados e execução de alta performance.</span>
            </span>
          </p>

          {/* CTAs */}
          <div className="mt-6 sm:mt-7 md:mt-8 lg:mt-10 flex w-full items-center justify-center gap-2 sm:gap-3 md:gap-5 px-4 sm:px-0">
            <Link
              href="#vender"
              className="group relative inline-flex h-11 sm:h-12 md:h-[52px] w-[48%] sm:w-[45%] md:w-[228px] items-center justify-center rounded-[33.9px]
                         bg-[linear-gradient(180deg,_#E5AC02_0.96%,_rgba(78,58,0,0.89)_100.96%)]
                         sm:bg-[linear-gradient(180deg,_#000000_0.96%,_rgba(25,25,25,0.89)_100.96%)]
                         shadow-[inset_0px_0px_11.2px_1.41px_#F3C53D]
                         sm:shadow-[inset_0px_0px_4.42px_2.26px_#F3C53D]
                         backdrop-blur-[17.6px] sm:backdrop-blur-[24px]
                         pl-4 pr-10 sm:pl-6 sm:pr-12 outline-none transition-all duration-200
                         hover:brightness-110 hover:ring-2 hover:ring-[#F3C53D]/35 hover:border-transparent
                         hover:bg-[linear-gradient(83.94deg,_#CA9700_-5.76%,_#765802_93.06%)]
                         sm:hover:bg-[linear-gradient(83.94deg,_#CA9700_-5.76%,_#765802_93.06%)]
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F3C53D]/45 active:brightness-105">
              <span className="pointer-events-none select-none font-medium group-hover:font-bold text-xs sm:text-sm md:text-base">Começar a vender</span>
              <ArrowRight className="absolute right-3 sm:right-4 md:right-6 top-1/2 h-[16px] w-[16px] sm:h-[18px] sm:w-[18px] md:h-[20px] md:w-[20px] -translate-y-1/2 text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.7)]" strokeWidth={2} />
            </Link>

            <Link
              href="https://wa.me/5511986542748?text=Olá! Gostaria de saber mais sobre os serviços de tráfego pago da Spot-A. Podem me ajudar a atrair leads qualificados e escalar minhas vendas?"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 sm:h-12 md:h-[52px] w-[48%] sm:w-[45%] md:w-[228px] items-center justify-center rounded-[33.9px] border border-[#F3C53D]/60 bg-black/20 backdrop-blur-md px-4 sm:px-5 md:px-7 transition-colors hover:border-[#F3C53D] text-xs sm:text-sm md:text-base">
              Saiba mais
            </Link>
          </div>

          <div className="h-[8vh] sm:h-[10vh] md:h-[12vh] lg:h-[14vh]" />
        </div>
      </div>

      {/* ===== Painel de Controle (Debug) ===== */}
      {false && showDebug && (
        <div className="fixed bottom-4 right-4 z-[9999] w-[320px] rounded-xl border border-white/10 bg-black/70 p-4 text-white backdrop-blur-md shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <strong className="text-sm">Controles do Hero</strong>
            <button
              className="text-xs opacity-70 hover:opacity-100"
              onClick={() => setShowDebug(false)}
            >
              fechar
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-xs flex items-center justify-between">
              <span>RANGE (pin) — {rangePct}%</span>
              <input
                type="number"
                className="w-16 bg-transparent border border-white/20 rounded px-1 text-right text-xs"
                value={rangePct}
                onChange={(e) => setRangePct(Math.max(40, Number(e.target.value) || 0))}
              />
            </label>
            <input min={40} max={500} step={10} type="range" value={rangePct} onChange={(e) => setRangePct(Number(e.target.value))} className="w-full" />

            <label className="text-xs flex items-center justify-between">
              <span>FADE_END (texto) — {fadeEndPct}%</span>
              <input
                type="number"
                className="w-16 bg-transparent border border-white/20 rounded px-1 text-right text-xs"
                value={fadeEndPct}
                onChange={(e) => setFadeEndPct(Math.max(5, Number(e.target.value) || 0))}
              />
            </label>
            <input min={5} max={100} step={5} type="range" value={fadeEndPct} onChange={(e) => setFadeEndPct(Number(e.target.value))} className="w-full" />

            <label className="text-xs flex items-center justify-between">
              <span>SCRUB suavização — {scrubSmooth === 0 ? "1:1" : `${scrubSmooth}s`}</span>
              <input
                type="number"
                className="w-16 bg-transparent border border-white/20 rounded px-1 text-right text-xs"
                value={scrubSmooth}
                onChange={(e) => setScrubSmooth(Math.max(0, Number(e.target.value) || 0))}
              />
            </label>
            <input min={0} max={2} step={0.1} type="range" value={scrubSmooth} onChange={(e) => setScrubSmooth(Number(e.target.value))} className="w-full" />

            <div className="flex items-center gap-3 text-xs">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={showMarkers} onChange={(e) => setShowMarkers(e.target.checked)} />
                markers
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={hideGrid} onChange={(e) => setHideGrid(e.target.checked)} />
                esconder grid
              </label>
              <button
                className="ml-auto rounded bg-white/10 px-2 py-1 text-xs hover:bg-white/20"
                onClick={() => { setRangePct(200); setFadeEndPct(35); setScrubSmooth(0); setShowMarkers(false); setHideGrid(true); }}
              >
                reset
              </button>
            </div>

            <div className="mt-1 text-[10px] opacity-70 space-y-0.5">
              <div><code>RANGE</code> =&nbsp;{`"+=${rangePct}%"`}</div>
              <div><code>FADE_END</code> =&nbsp;{`"+=${fadeEndPct}%"`}</div>
              <div><code>SCRUB</code> =&nbsp;{scrubSmooth === 0 ? "true (1:1)" : `${scrubSmooth}s`}</div>
              <div>Pressione <b>G</b> para mostrar/ocultar este painel</div>
            </div>
          </div>
        </div>
      )}

      {/* ===== Estatísticas do Hero (aparecem no último frame) ===== */}
      <HeroStats
        isVisible={showStats}
        className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 sm:px-8 md:px-14"
        id="hero-stats"
      />
    </section>
  );
}

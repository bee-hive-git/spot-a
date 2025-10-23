"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

type CaseSingle = { img: string; caption: string };
type CaseDual = { img: string; caption: [string, string] };
type CaseItem = CaseSingle | CaseDual;

const CASES: CaseItem[] = [
  { img: "/CasosClientes/cliente1.png", caption: "260 Leads em 10 Dias - Fevereiro de 2025" },
  {
    img: "/CasosClientes/cliente2.png",
    caption: [
      "R$0,08 por Visita ao Perfil do Instagram",
      "R$1,63 por Mensagem no Direct do Instagram",
    ],
  },
  { img: "/CasosClientes/cliente3.png", caption: "188 Conversões à R$5,95 Cada no Google Ads" },
] as const;

function isDual(c: CaseItem): c is CaseDual {
  return Array.isArray((c as CaseDual).caption);
}

export function CasosClientes() {
  // state
  const [idx, setIdx] = useState(0);
  const next = useCallback(() => setIdx((i) => (i + 1) % CASES.length), []);
  const prev = useCallback(() => setIdx((i) => (i - 1 + CASES.length) % CASES.length), []);

  // teclado
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  // imagens
  const [imgSrc, setImgSrc] = useState(CASES[0].img);
  useEffect(() => setImgSrc(CASES[idx].img), [idx]);
  const handleImgError = () => {
    setImgSrc((prev) =>
      prev.endsWith(".webp") ? prev.replace(/\.webp$/i, ".png") : prev.replace(/\.png$/i, ".webp")
    );
  };

  const [imgRatio, setImgRatio] = useState<number | null>(null);
  const onLoaded = (img: HTMLImageElement) => setImgRatio(img.naturalWidth / img.naturalHeight);

  // breakpoints
  const [isMobile, setIsMobile] = useState(false);          // <768
  const [isTablet, setIsTablet] = useState(false);          // 768–1023
  const [isMidDesk, setIsMidDesk] = useState(false);        // 1024–1535 (iPad Air → abaixo do desktop cheio)
  const [slideGap, setSlideGap] = useState(16);
  useEffect(() => {
    const upd = () => {
      const w = window.innerWidth;
      setIsMobile(w < 768);
      setIsTablet(w >= 768 && w < 1024);
      setIsMidDesk(w >= 1024 && w < 1536);
      setSlideGap(w < 768 ? 12 : w < 1280 ? 18 : 28);
    };
    upd();
    window.addEventListener("resize", upd);
    return () => window.removeEventListener("resize", upd);
  }, []);

  const mobileAspect = imgRatio ?? 16 / 9;

  // drag
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [dragPx, setDragPx] = useState(0);
  const dragStartX = useRef<number | null>(null);
  const dragStartY = useRef<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [allowTransition, setAllowTransition] = useState(true);
  const vw = () => Math.max(viewportRef.current?.clientWidth ?? 1, 1);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    dragStartX.current = e.clientX;
    dragStartY.current = e.clientY;
    setIsDragging(true);
    setAllowTransition(false);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || dragStartX.current === null || dragStartY.current === null) return;
    const dx = e.clientX - dragStartX.current;
    const dy = e.clientY - dragStartY.current;
    if (Math.abs(dx) < Math.abs(dy) + 8) return;
    setDragPx(dx);
  };
  const onPointerEnd = (e?: React.PointerEvent<HTMLDivElement>) => {
    e?.currentTarget.releasePointerCapture?.(e.pointerId);
    const width = vw();
    const threshold = Math.max(0.18 * width, 80);
    const dx = dragPx;
    setIsDragging(false);
    setAllowTransition(true);
    setDragPx(0);
    if (dx > threshold) prev();
    else if (dx < -threshold) next();
  };

  // track
  const translateX = -idx * (vw() + slideGap) + dragPx;
  const trackStyle: React.CSSProperties = {
    transform: `translate3d(${translateX}px, 0, 0)`,
    transition: allowTransition ? "transform 320ms ease" : "none",
    willChange: "transform",
  };

  // escala/offset progressivo: 1024→1535 mantém modelo do iPad Air; ≥1536 volta ao desktop cheio
  const w = typeof window !== "undefined" ? window.innerWidth : 1536;
  const tMid = isMidDesk ? Math.min(Math.max((w - 1024) / (1535 - 1024), 0), 1) : 0;
  const scaleMid = 0.85 + tMid * (0.98 - 0.85); // encolhe no 1024 e relaxa até perto do desktop
  const scale = isTablet ? 0.86 : isMidDesk ? scaleMid : 1;
  const scaleTransform: React.CSSProperties =
    isTablet || isMidDesk ? { transform: `scale(${scale})`, transformOrigin: "center top" } : {};

  // largura do viewport (max-width) progressiva para abrir espaço às setas
  const viewportMaxStyle: React.CSSProperties | undefined = isMidDesk
    ? { maxWidth: `${Math.round(940 + tMid * (1200 - 940))}px` }
    : undefined;

  // fontes levemente menores no mid (harmoniza com o scale)
  const h1Size = isMidDesk ? `${Math.round(38 + tMid * (46 - 38))}px` : undefined;
  const pSize = isMidDesk ? `${Math.round(16 + tMid * (18 - 16))}px` : undefined;
  const pLine = isMidDesk ? `${Math.round(26 + tMid * (30 - 26))}px` : undefined;

  // setas mais afastadas no mid (60px→76px)
  const arrowOffset = isMidDesk ? Math.round(60 + tMid * (76 - 60)) : 76;

  return (
    <section id="casos-clientes" className="relative overflow-visible bg-[#010510]">
      <div className="relative z-10 mx-auto max-w-[1350px] px-5 pt-20 pb-20 md:px-6 md:pt-20 md:pb-24 lg:px-8 lg:pt-28 lg:pb-28">
        <div style={scaleTransform}>
          {/* título */}
          <h1
            className="mx-auto max-w-[1100px] text-center text-[34px] font-semibold leading-[1.15] md:text-[46px] md:leading-[1.12] xl:text-[85.2px] xl:leading-[102.24px] bg-[linear-gradient(91.64deg,_#04070D_-6.08%,_#D5DBE6_37.96%)] bg-clip-text text-transparent"
            style={isMidDesk ? ({ fontSize: h1Size, lineHeight: 1.12 } as React.CSSProperties) : undefined}
          >
            Casos de Clientes
          </h1>

          {/* subtítulo */}
          <p
            className="mx-auto mt-3 max-w-[980px] text-center text-[16px] leading-[26px] text-[#D5DBE6] md:mt-4 md:text-[18px] md:leading-[30px] xl:text-[28px] xl:leading-[40px]"
            style={isMidDesk ? ({ fontSize: pSize, lineHeight: pLine } as React.CSSProperties) : undefined}
          >
            Veja alguns casos de clientes
            <br className="hidden md:block" />
            que confiaram na Spot-A
          </p>

          {/* carrossel */}
          <div className="mt-10 md:mt-12 lg:mt-16">
            <div className="relative mx-auto w-full md:max-w-[900px] lg:max-w-[1250px]" style={viewportMaxStyle}>
              {/* viewport */}
              <div
                ref={viewportRef}
                className="relative mx-auto w-full overflow-hidden select-none touch-pan-y"
                style={{ touchAction: "pan-y" }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerEnd}
                onPointerCancel={onPointerEnd}
                onPointerLeave={onPointerEnd}
              >
                {/* track */}
                <div className="flex w-full" style={trackStyle} aria-live="polite">
                  {CASES.map((c, i) => (
                    <div key={i} className="w-full shrink-0" style={{ marginRight: i === CASES.length - 1 ? 0 : slideGap }}>
                      {/* imagem */}
                      <div className="relative mx-auto w-full">
                        <div className="relative w-full rounded-[20px] ring-1 ring-white/10 bg-transparent shadow-[0_0_40px_rgba(115,175,255,0.10)] px-3 py-3 md:px-5 md:py-4">
                          <div
                            className="relative mx-auto w-[97%] md:w-[98.5%] md:aspect-[16/5.35]"
                            style={isMobile ? ({ aspectRatio: String(mobileAspect) } as React.CSSProperties) : undefined}
                          >
                            <Image
                              src={i === idx ? imgSrc : c.img}
                              alt={`Caso ${i + 1}`}
                              fill
                              sizes="(max-width: 768px) 95vw, (max-width:1024px) 860px, 1200px"
                              priority={i === 0}
                              onError={i === idx ? handleImgError : undefined}
                              onLoadingComplete={i === idx ? onLoaded : undefined}
                              className="rounded-[14px] object-center pointer-events-none select-none object-contain md:object-cover"
                              draggable={false}
                              onDragStart={(e) => e.preventDefault()}
                            />
                          </div>
                        </div>
                      </div>

                      {/* legendas */}
                      {isDual(c) ? (
                        <div
                          className={`mx-auto mt-5 w-full md:max-w-[900px] lg:max-w-[1250px] text-[#E6ECF8] font-semibold ${isMobile ? "flex flex-col items-center gap-2 text-[15px]" : "flex items-center justify-between px-1 text-[16px] md:text-[17px] lg:text-[20px]"}`}
                        >
                          {isMobile ? (
                            <>
                              <span className="text-center">{c.caption[0]}</span>
                              <span className="text-center">{c.caption[1]}</span>
                            </>
                          ) : (
                            <>
                              <span className="text-left whitespace-nowrap">{c.caption[0]}</span>
                              <span className="text-right whitespace-nowrap">{c.caption[1]}</span>
                            </>
                          )}
                        </div>
                      ) : (
                        <p className={`mx-auto mt-5 w-full md:max-w-[900px] lg:max-w-[1250px] text-center text-[#E6ECF8] font-semibold ${isMobile ? "text-[15px]" : "text-[16px] md:text-[17px] lg:text-[20px]"}`}>
                          {c.caption}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* setas (md+: aparecem; mobile: escondidas) */}
              <button
                type="button"
                aria-label="Anterior"
                onClick={prev}
                className="absolute hidden md:grid place-items-center text-white opacity-90 transition hover:opacity-100 z-30 pointer-events-auto md:top-1/2 md:-translate-y-1/2"
                style={{ left: `-${arrowOffset}px` }}
              >
                <ChevronLeft className="h-[40px] w-[40px] md:h-[46px] md:w-[46px] lg:h-[60px] lg:w-[60px]" strokeWidth={3.2} />
              </button>

              <button
                type="button"
                aria-label="Próximo"
                onClick={next}
                className="absolute hidden md:grid place-items-center text-white opacity-90 transition hover:opacity-100 z-30 pointer-events-auto md:top-1/2 md:-translate-y-1/2"
                style={{ right: `-${arrowOffset}px` }}
              >
                <ChevronRight className="h-[40px] w-[40px] md:h-[46px] md:w-[46px] lg:h-[60px] lg:w-[60px]" strokeWidth={3.2} />
              </button>
            </div>

            {/* base */}
            <div className="relative -mt-12 md:-mt-16 lg:-mt-20 pointer-events-none">
              <div className="relative left-1/2 -translate-x-1/2 h-[200px] md:h-[280px] w-[min(160vw,2600px)] md:w-[min(185vw,3200px)] max-w-none">
                <Image
                  src="/CasosClientes/base.png"
                  alt=""
                  fill
                  className="object-contain pointer-events-none select-none"
                  sizes="(max-width: 768px) 160vw, 185vw"
                  priority
                  draggable={false}
                  onDragStart={(e) => e.preventDefault()}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

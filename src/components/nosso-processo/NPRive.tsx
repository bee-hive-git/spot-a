"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRive, Layout, Fit, Alignment } from "@rive-app/react-canvas";
import type RiveEvent from "@rive-app/react-canvas";

type RiveCardProps = {
  // ——— NOVO: fontes Rive (se presentes, substituem a imagem ———
  desktopSrc?: string;               // ex: "/rive/section_3.riv"
  mobileSrc?: string;                // ex: "/rive/mobile_3.riv"
  desktopArtboard?: string;
  mobileArtboard?: string;
  desktopStateMachines?: string[];
  mobileStateMachines?: string[];
  autoplay?: boolean;
  fit?: Fit;
  alignment?: Alignment;

  // ——— LEGADO: fallback para imagem (mantém seu index funcionando) ———
  imgSrc?: string;
  imgAlt?: string;
  priority?: boolean;

  // ——— Layout ———
  className?: string;                // para dimensionar via Tailwind/CSS

  // ——— Link acionado pelo .riv ———
  ctaHref?: string;                 // ex: "#diagnostico" ou "https://..."
  ctaTarget?: "_self" | "_blank";   // default: "_self"
  ctaStateName?: string;            // nome do estado que você entra ao clicar (default: "CTA_Click")

  // ——— Transform extras (escala/offset) ———
  // Valores gerais (aplicados a ambos quando específicos não são fornecidos)
  scale?: number;
  offsetX?: number; // px
  offsetY?: number; // px
  // Valores específicos por dispositivo
  desktopScale?: number;
  mobileScale?: number;
  desktopOffsetX?: number; // px
  desktopOffsetY?: number; // px
  mobileOffsetX?: number; // px
  mobileOffsetY?: number; // px
};

// Hook simples de breakpoint (evita SSR mismatch)
function useIsMobile(query = "(max-width: 767px)") {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mql.matches);
    mql.addEventListener?.("change", onChange);
    return () => mql.removeEventListener?.("change", onChange);
  }, [query]);
  return isMobile;
}

// —— helper para extrair o nome do estado do evento do Rive sem usar `any`
function getRiveStateName(evt: { data?: unknown }): string {
  if (!evt) return "";
  const data = (evt as unknown as { data?: unknown }).data;
  if (typeof data === "object" && data !== null) {
    const maybe = data as { stateName?: unknown; name?: unknown };
    if (typeof maybe.stateName === "string") return maybe.stateName;
    if (typeof maybe.name === "string") return maybe.name;
  }
  return "";
}

export default function RiveCard({
  desktopSrc,
  mobileSrc,
  desktopArtboard,
  mobileArtboard,
  desktopStateMachines,
  mobileStateMachines,
  autoplay = true,
  // Ajuste: usar Fit.Contain como padrão para evitar "zoom" exagerado
  fit = Fit.Contain,
  alignment = Alignment.Center,
  imgSrc,
  imgAlt = "",
  priority,
  className,
  // Novos props
  scale,
  offsetX,
  offsetY,
  desktopScale,
  mobileScale,
  desktopOffsetX,
  desktopOffsetY,
  mobileOffsetX,
  mobileOffsetY,
  ctaHref,
  ctaTarget,
  ctaStateName,
}: RiveCardProps) {
  const isMobile = useIsMobile();

  const willUseRive = !!desktopSrc || !!mobileSrc;

  // Decide qual arquivo/params usar
  const config = useMemo(() => {
    if (!willUseRive) return null;
    return isMobile
      ? {
          src: mobileSrc ?? desktopSrc!, // fallback para desktop se mobile não vier
          artboard: mobileArtboard,
          stateMachines: mobileStateMachines,
        }
      : {
          src: desktopSrc ?? mobileSrc!, // fallback para mobile se desktop não vier
          artboard: desktopArtboard,
          stateMachines: desktopStateMachines,
        };
  }, [
    willUseRive,
    isMobile,
    desktopSrc,
    mobileSrc,
    desktopArtboard,
    mobileArtboard,
    desktopStateMachines,
    mobileStateMachines,
  ]);

  const instanceKey = config
    ? `${config.src}|${config.artboard ?? ""}|${(config.stateMachines ?? []).join(",")}`
    : "image";

  // Instância do Rive (só cria se for usar Rive)
  const rive = useRive(
    willUseRive
      ? {
          src: config!.src,
          artboard: config!.artboard,
          stateMachines: config!.stateMachines,
          autoplay,
          layout: new Layout({ fit, alignment }),
          onStateChange: (evt) => {
            const state = getRiveStateName(evt);
            const expect = ctaStateName || "CTA_Click";
            if (state === expect && ctaHref) {
              window.open(ctaHref, ctaTarget || "_self");
            }
          },
        }
      : undefined
  );

  const RiveComponent = rive?.RiveComponent;

  // ——— Transform por dispositivo ———
  const computedScale = isMobile ? (mobileScale ?? scale ?? 1) : (desktopScale ?? scale ?? 1);
  const computedOffsetX = isMobile ? (mobileOffsetX ?? offsetX ?? 0) : (desktopOffsetX ?? offsetX ?? 0);
  const computedOffsetY = isMobile ? (mobileOffsetY ?? offsetY ?? 0) : (desktopOffsetY ?? offsetY ?? 0);

  return (
    <div
      key={instanceKey}
      className={className ?? "relative w-[342px] h-[362px] rounded-3xl bg-[#0B1220] overflow-hidden"}
      style={{ position: "relative" }}
    >
      {willUseRive && RiveComponent ? (
        <RiveComponent
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            transformOrigin: "center center",
            transform: `translate3d(${computedOffsetX}px, ${computedOffsetY}px, 0) scale(${computedScale})`,
          }}
          aria-label="Rive animation"
          role="img"
        />
      ) : (
        // Fallback para sua imagem atual (mantém compatibilidade)
        <Image
          src={imgSrc ?? "/fallback.png"}
          alt={imgAlt}
          fill
          priority={priority}
          className="object-contain"
        />
      )}
    </div>
  );
}

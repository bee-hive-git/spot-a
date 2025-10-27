"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRive, Layout, Fit, Alignment } from "@rive-app/react-canvas";

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

  // ——— Controle de navegação/loop ———
  // Permite rolagem/teclas infinitas: ao chegar no último, volta ao primeiro
  enableWheelLoop?: boolean; // ativa navegação por scroll do mouse
  enableArrowKeys?: boolean; // ativa navegação por setas do teclado (↑ ↓)
  itemCount?: number;        // quantidade de itens (para fazer o wrap)
  initialIndex?: number;     // índice inicial
  riveIndexInputName?: string; // nome do input numérico no State Machine (ex: "index")

  // ——— WhatsApp CTA ———
  whatsappEnabled?: boolean;           // ativa o botão
  whatsappNumber?: string;             // número com DDI/DDD (ex: "5581999999999"); se vazio, abre seleção de contato
  whatsappMessageByIndex?: string[];   // mensagens por índice
  // Área clicável (overlay) para alinhar ao botão do banner
  whatsappOverlayDesktop?: { topPct?: number; leftPct?: number; widthPx?: number; heightPx?: number };
  whatsappOverlayMobile?: { topPct?: number; leftPct?: number; widthPx?: number; heightPx?: number };
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
  // Navegação
  enableWheelLoop = true,
  enableArrowKeys = true,
  itemCount = 6,
  initialIndex = 0,
  riveIndexInputName = "index",
  // CTA WhatsApp
  whatsappEnabled = true,
  whatsappNumber,
  whatsappMessageByIndex,
  whatsappOverlayDesktop,
  whatsappOverlayMobile,
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

  // ——— Debug: verificar carregamento do arquivo .riv ———
  useEffect(() => {
    if (!willUseRive || !config) return;
    const src = config.src;
    try {
      console.groupCollapsed("[NSRive] Configuração atual");
      console.log({
        isMobile,
        src,
        artboard: config.artboard,
        stateMachines: config.stateMachines,
      });
      console.groupEnd();
    } catch {}
    let cancelled = false;
    // Importante: usar GET com cache: "no-store" em dev evita net::ERR_ABORTED do Next.js
    fetch(src, { method: "GET", cache: "no-store" })
      .then((res) => {
        if (cancelled) return;
        if (!res.ok) {
          console.error(`[NSRive] Falha ao acessar ${src}: ${res.status} ${res.statusText}`);
        } else {
          console.log(`[NSRive] OK: ${src} acessível (status ${res.status})`);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(`[NSRive] Erro ao requisitar ${src}`, err);
      });
    return () => { cancelled = true; };
  }, [willUseRive, config, isMobile]);

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
        }
      : undefined
  );

  const RiveComponent = rive?.RiveComponent;

  // ——— Transform por dispositivo ———
  const computedScale = isMobile ? (mobileScale ?? scale ?? 1) : (desktopScale ?? scale ?? 1);
  const computedOffsetX = isMobile ? (mobileOffsetX ?? offsetX ?? 0) : (desktopOffsetX ?? offsetX ?? 0);
  const computedOffsetY = isMobile ? (mobileOffsetY ?? offsetY ?? 0) : (desktopOffsetY ?? offsetY ?? 0);

  // ——— Índice controlado para loop infinito ———
  const [index, setIndex] = useState<number>(Math.max(0, Math.min(initialIndex, Math.max(0, itemCount - 1))));

  // Atualiza o input do Rive, se existir
  useEffect(() => {
    if (!rive || !config?.stateMachines || !config.stateMachines.length) return;
    const sm = config.stateMachines[0];
    try {
      const inputs = (rive as any)?.stateMachineInputs?.(sm) ?? [];
      const idxInput = inputs?.find?.((i: any) =>
        String(i?.name ?? "").toLowerCase() === String(riveIndexInputName).toLowerCase()
      );
      if (idxInput && typeof idxInput.value === "number") {
        if (idxInput.value !== index) idxInput.value = index; // evita setar o mesmo valor repetidamente
      }
    } catch {}
  }, [rive, config, index, riveIndexInputName]);

  // Handlers de navegação (scroll e teclado) com wrap
  useEffect(() => {
    if (!enableArrowKeys) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") setIndex((i) => (i - 1 + itemCount) % itemCount);
      if (e.key === "ArrowDown") setIndex((i) => (i + 1) % itemCount);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enableArrowKeys, itemCount]);

  // Mensagens padrão (ajuste conforme sua ordem real de serviços)
  const defaultMsgs = Array.from({ length: itemCount }, (_, i) => {
    if (i === 0) return "Olá! Tenho interesse em META ADS da Spot-A.";
    if (i === 1) return "Olá! Tenho interesse em YOUTUBE ADS da Spot-A.";
    return "Olá! Tenho interesse nesse serviço da Spot-A.";
  });
  const currentMsg = (whatsappMessageByIndex ?? defaultMsgs)[index % itemCount];
  const waHref = (whatsappNumber && whatsappNumber.trim().length > 0)
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(currentMsg)}`
    : `https://wa.me/?text=${encodeURIComponent(currentMsg)}`;

  return (
    <div
      key={instanceKey}
      className={className ?? "relative w-[342px] h-[362px] rounded-3xl bg-[#0B1220] overflow-hidden"}
      style={{ position: "relative" }}
      onWheel={enableWheelLoop ? (e) => {
        const dir = e.deltaY > 0 ? 1 : e.deltaY < 0 ? -1 : 0;
        if (dir !== 0) setIndex((i) => (i + dir + itemCount) % itemCount);
      } : undefined}
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

      {whatsappEnabled && (
        (() => {
          const d = whatsappOverlayDesktop ?? { topPct: 58, leftPct: 9, widthPx: 220, heightPx: 56 };
          const m = whatsappOverlayMobile ?? { topPct: 61, leftPct: 6, widthPx: 200, heightPx: 52 };
          const cfg = isMobile ? m : d;
          const style: React.CSSProperties = {
            position: "absolute",
            top: `${cfg.topPct}%`,
            left: `${cfg.leftPct}%`,
            width: `${cfg.widthPx}px`,
            height: `${cfg.heightPx}px`,
            zIndex: 100,
            // invisível para não duplicar o botão visual; apenas captura o clique
            background: "transparent",
            pointerEvents: "auto",
            cursor: "pointer",
          };
          return (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              style={style}
              aria-label="Adquirir esse serviço via WhatsApp"
              role="button"
              title="Adquirir esse serviço"
            />
          );
        })()
      )}
    </div>
  );
}

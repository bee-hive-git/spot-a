"use client"

import ImageSequenceLite from "../ImagenSequenceLite";
import { useEffect, useState } from "react";

type Props = {
  progress?: number; // 0..1 do ScrollTrigger
  visible: boolean;
  // Aparência/transform comuns às duas sequências
  orient?: "none" | "flipY" | "flipX" | "rotate180";
  fit?: "cover" | "contain";
  yPct?: number;
  zoom?: number;
  // Percentual do scroll dedicado à primeira sequência (esteira com cubos)
  ratio?: number; // 0..1, default 0.35 (35% do scroll para a esteira)
};

// Componente composto: primeiro reproduz a seq-loop (esteira/cubos) uma vez,
// depois continua com a seq-scroll (queda) — tudo dirigido pelo scroll, sem repetir.
export default function HeroScrollComposite({
  progress = 0,
  visible,
  orient = "flipY",
  fit = "cover",
  yPct = 0,
  zoom = 1,
  ratio = 0.35,
}: Props) {
  const [sourcesScroll, setSourcesScroll] = useState<string[] | undefined>(undefined);

  // Gera fontes locais imediatamente (sem depender de manifest) para evitar requisições .avif inexistentes
  useEffect(() => {
    const total = 214; // temos 214 frames locais em /public/AnimationHero/seq-scroll
    const localWebp = Array.from({ length: total }, (_, i) => {
      const idx = String(i + 1).padStart(3, "0");
      return `/AnimationHero/seq-scroll/HERO_QUEDA${idx}.webp`;
    });
    setSourcesScroll(localWebp);
  }, []);

  
  const p = Math.min(1, Math.max(0, progress));
  const pScroll = p;
  const showScroll = true;

  return (
    <>
      {/* Sequência de scroll (queda) – continua após terminar a esteira */}
      <ImageSequenceLite
        count={214}
        fps={24}
        dir="/AnimationHero/seq-scroll" // dir não será usado quando 'sources' está preenchido, mas mantemos local por segurança
        base="HERO_QUEDA"
        pad={3}
        ext={'webp'}
        // Evita tentar .avif enquanto não existir no disco/CDN
        extCandidates={["webp"]}
        sources={sourcesScroll}
        maxCache={2}
        // Reduz concorrência e janela de prefetch para acelerar a aparição da seção
        netProfileOverride={{ MAX_INFLIGHT: 4, WINDOW: 12 }}
        prefetchWindow={10}
        start={1}
        progress={pScroll}
        loops={1}
        visible={visible}
        orient={orient}
        fit={fit}
        yPct={yPct}
        zoom={zoom}
      />
    </>
  );
}
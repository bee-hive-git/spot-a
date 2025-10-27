"use client"

import ImageSequenceLite from "../ImagenSequenceLite";

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
  const p = Math.min(1, Math.max(0, progress));
  const split = Math.min(0.95, Math.max(0.05, ratio)); // evita 0/1 extremos

  // Primeiro trecho: seq-loop (HERO_LOOP) mapeado para [0..split]
  const pLoop = split > 0 ? Math.min(1, Math.max(0, p / split)) : 0;
  const showLoop = p < split;

  // Segundo trecho: seq-scroll (HERO_QUEDA) mapeado para [split..1]
  const pScroll = p <= split ? 0 : Math.min(1, Math.max(0, (p - split) / (1 - split)));
  const showScroll = p >= split;

  return (
    <>
      {/* Esteira com cubos – roda uma vez no início do scroll */}
      <ImageSequenceLite
        count={83}
        fps={18}
        dir="/AnimationHero/seq-loop"
        base="HERO_LOOP"
        pad={3}
        ext="webp"
        extCandidates={["webp", "png"]}
        maxCache={2}
        start={1}
        progress={pLoop}
        loops={1}
        visible={visible && showLoop}
        orient={orient}
        fit={fit}
        yPct={yPct}
        zoom={zoom}
      />

      {/* Sequência de scroll (queda) – continua após terminar a esteira */}
      <ImageSequenceLite
        count={214}
        fps={24}
        dir="/AnimationHero/seq-scroll"
        base="HERO_QUEDA"
        pad={3}
        ext="webp"
        extCandidates={["webp", "png"]}
        maxCache={2}
        start={1}
        progress={pScroll}
        loops={1}
        visible={visible && showScroll}
        orient={orient}
        fit={fit}
        yPct={yPct}
        zoom={zoom}
      />
    </>
  );
}
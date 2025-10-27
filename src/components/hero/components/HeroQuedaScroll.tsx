"use client"

import ImageSequenceLite from "../ImagenSequenceLite";

type Props = { 
  progress?: number; 
  visible: boolean; 
  orient?: "none" | "flipY" | "flipX" | "rotate180";
  fit?: "cover" | "contain";
  yPct?: number;
  zoom?: number;
  loops?: number; // número de repetições da sequência durante o scroll

};

export default function HeroQuedaScroll({ progress = 0, visible, orient = "flipY", fit = "contain", yPct = 0, zoom = 1, loops = 2 }: Props) {
  return (
    <ImageSequenceLite
      count={214}
      fps={24}
      dir="/AnimationHero/seq-scroll"
      base="HERO_QUEDA"
      pad={3}
      ext="webp"
      extCandidates={["webp","png"]}
      maxCache={2}
      start={1}
      progress={progress}  // 0..1
      loops={loops}
      /* ...suas props atuais... */
      visible={visible}
      orient={orient}   // ← repassa
      fit={fit}
      yPct={yPct}     // ↑ sobe ~8% da altura do Canvas (ajuste aqui)
      zoom={zoom}  // mesmo zoom nos dois
    />
  );
}

"use client"

import ImageSequenceLite from "../ImagenSequenceLite";

type Props = { 
  progress?: number; 
  visible: boolean; 
  orient?: "none" | "flipY" | "flipX" | "rotate180";
  fit?: "cover" | "contain";
  yPct?: number;
  zoom?: number;

};

export default function HeroQuedaScroll({ progress = 0, visible, orient = "flipY", fit = "contain", yPct = 0, zoom = 1 }: Props) {
  return (
    <ImageSequenceLite
      count={214}
      fps={24}
      dir="/AnimationHero/seq-scroll"
      base="HERO_QUEDA"
      pad={3}
      ext="webp"
      start={1}
      progress={progress}  // 0..1
      /* ...suas props atuais... */
      visible={visible}
      orient={orient}   // ← repassa
      fit={fit}
      yPct={yPct}     // ↑ sobe ~8% da altura do Canvas (ajuste aqui)
      zoom={zoom}  // mesmo zoom nos dois
    />
  );
}

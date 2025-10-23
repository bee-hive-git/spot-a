"use client";

import ImageSequenceLite from "../ImagenSequenceLite";

type Props = { 
    visible: boolean; 
    active: boolean; 
    orient?: "none" | "flipY" | "flipX" | "rotate180";
    fit?: "cover" | "contain";
    yPct?: number;
    zoom?: number;

};

export default function HeroLoop({ visible, active, orient = "flipY", fit = "contain", yPct = 0, zoom = 0, }: Props) {
  return (
    <ImageSequenceLite
      count={83}
      fps={60}
      dir="/AnimationHero/seq-loop"
      base="HERO_LOOP"
      pad={3}
      ext="webp"
      start={1}
      /* ...suas props atuais... */
      visible={visible}
      active={active}
      orient={orient}   // ← repassa
      fit={fit}
      yPct={yPct}     // ↑ sobe ~8% da altura do Canvas (ajuste aqui)
      zoom={zoom}  // mesmo zoom nos dois
    />
  );
}


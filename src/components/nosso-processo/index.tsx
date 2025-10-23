"use client";

import React from "react";
import ResponsiveRive from "@/components/nosso-processo/NPRive";

export default function HeroSection() {
  return (
    <section className="relative bg-[#010510]">
      {/* 
        Mobile (até 767px) → /NossoProcesso/mobile_3.riv (430x1454)
        Desktop (>= 768px) → /NossoProcesso/section_3.riv (1920x1181)
        O container usa aspect-ratio específico por breakpoint para manter o tamanho proporcional ao artboard.
        Layout fluido: a largura se adapta ao viewport sem laterais marcadas.
      */}
      <ResponsiveRive
        desktopSrc="/NossoProcesso/section_3.riv"
        mobileSrc="/NossoProcesso/mobile_3.riv"
        // Se você tiver artboards/SMs específicos, basta preencher:
        desktopArtboard="SECTION_3"
        mobileArtboard="MOBILE_3"
        desktopStateMachines={["State Machine 1"]}
        mobileStateMachines={["State Machine 1"]}
        // Escala/offset por dispositivo
        desktopScale={1.4}
        mobileScale={1}
        desktopOffsetX={0}
        desktopOffsetY={0}
        mobileOffsetX={0}
        mobileOffsetY={0}
        className="mx-auto w-[min(100vw,430px)] aspect-[430/1454] h-auto md:w-[min(100vw,1920px)] md:aspect-[1920/1700]"
      />
    </section>
  );
}

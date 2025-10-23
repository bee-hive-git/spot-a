"use client";

import React from "react";
import ResponsiveRive from "@/components/nossos-servicos/NSRive";

export default function HeroSection() {
  return (
    <section className="relative bg-[#010510]">
      {/* 
        Mobile (até 767px) → /NossosServicos/mobile_5.riv
        Desktop (>= 768px) → /NossosServicos/section_5.riv
        O container usa aspect-ratio específico por breakpoint para manter o tamanho proporcional ao artboard.
        Layout fluido: a largura se adapta ao viewport sem laterais marcadas.
      */}
      <ResponsiveRive
        desktopSrc="/NossosServicos/section_5.riv"
        mobileSrc="/NossosServicos/mobile_5.riv"
        // Removidos artboard e stateMachines para usar padrões do arquivo .riv
        desktopArtboard="SECTION_5"
        desktopStateMachines={["State Machine 1"]}
        mobileArtboard="MOBILE_5"
        mobileStateMachines={["State Machine 1"]}
        // Escala/offset por dispositivo
        desktopScale={1.35}
        mobileScale={1}
        desktopOffsetX={0}
        desktopOffsetY={-200}
        mobileOffsetX={0}
        mobileOffsetY={0}
        className="mx-auto w-[min(100vw,430px)] aspect-[430/815] h-auto md:w-[min(100vw,1920px)] md:aspect-[1920/1080]"
      />
    </section>
  );
}

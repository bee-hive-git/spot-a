"use client";

import React from "react";
import ResponsiveRive from "@/components/diferenciais/DRive";

export default function HeroSection() {
  return (
    <section className="relative bg-[#010510] overflow-hidden">
      <ResponsiveRive
        desktopSrc="/diferenciais/section_4.riv"
        mobileSrc="/diferenciais/mobile_4.riv"
        desktopArtboard="SECTION_4"
        mobileArtboard="MOBILE_4"
        desktopStateMachines={["State Machine 1"]}
        mobileStateMachines={["State Machine 1"]}
        // 🔧 Novo ajuste: menos altura e offset mais suave
        desktopScale={1}
        mobileScale={1}
        desktopOffsetX={0}
        desktopOffsetY={-80} // era -200 → reduzido para colar o próximo bloco
        mobileOffsetX={0}
        mobileOffsetY={-20}
        className="
          mx-auto
          w-[min(100vw,430px)]
          aspect-[430/1300]          /* era 1640 → reduz altura */
          h-auto
          md:w-[min(100vw)]
          md:aspect-[1920/1350]      /* era 1800 → reduz altura e vazio superior */
          transition-all
          duration-300
        "
      />
    </section>
  );
}

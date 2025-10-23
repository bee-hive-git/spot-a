"use client";

import React from "react";
import ResponsiveRive from "@/components/nosso-processo/NPRive";

export default function HeroSection() {
  return (
    <section className="relative bg-[#010510] overflow-hidden w-full">
      <ResponsiveRive
        desktopSrc="/NossoProcesso/section_3.riv"
        mobileSrc="/NossoProcesso/mobile_3.riv"
        desktopArtboard="SECTION_3"
        mobileArtboard="MOBILE_3"
        desktopStateMachines={["State Machine 1"]}
        mobileStateMachines={["State Machine 1"]}
        desktopScale={1}
        mobileScale={1}
        desktopOffsetX={0}
        desktopOffsetY={0}
        mobileOffsetX={0}
        mobileOffsetY={0}
        className="
          relative
          w-full
          mx-auto
          md:max-w-[1920px]
          aspect-[430/1454]      /* mobile artboard original */
          md:aspect-[1920/1181]  /* desktop artboard original */
        "
      />
    </section>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import ResponsiveRive from "@/components/nossos-servicos/NSRive";

export default function HeroSection() {
  const [isMobile, setIsMobile] = useState(false);

  // Detecta mobile
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener?.("change", update);
    return () => mql.removeEventListener?.("change", update);
  }, []);

  const riveProps = {
    desktopSrc: "/NossosServicos/section_5.riv",
    mobileSrc: "/NossosServicos/mobile_5.riv",
    desktopArtboard: "SECTION_5",
    mobileArtboard: "MOBILE_5",
    desktopStateMachines: ["State Machine 1"],
    mobileStateMachines: ["State Machine 1"],
    desktopScale: 0.95,
    desktopOffsetX: 0,
    desktopOffsetY: -40,
    mobileScale: 1,
    mobileOffsetX: 0,
    mobileOffsetY: 0,
  };

  return (
    <section
      className="relative w-full bg-[#010510] flex justify-center items-center"
      style={{
        height: isMobile ? "140vh" : "auto", // altura geral menor só no mobile
        overflow: "hidden", // corta o excesso do canvas
      }}
    >
      <div
        className="w-full h-full flex justify-center items-center"
      >
        <div
          className="relative w-full"
          style={{
            aspectRatio: isMobile ? 430 / 1454 : 1920 / 1181,
            maxWidth: isMobile ? "100vw" : "1920px",
            width: "100%",
          }}
        >
          <ResponsiveRive
            desktopSrc={riveProps.desktopSrc}
            mobileSrc={riveProps.mobileSrc}
            desktopArtboard={riveProps.desktopArtboard}
            mobileArtboard={riveProps.mobileArtboard}
            desktopStateMachines={riveProps.desktopStateMachines}
            mobileStateMachines={riveProps.mobileStateMachines}
            desktopScale={riveProps.desktopScale}
            mobileScale={riveProps.mobileScale}
            desktopOffsetX={riveProps.desktopOffsetX}
            desktopOffsetY={riveProps.desktopOffsetY}
            mobileOffsetX={riveProps.mobileOffsetX}
            mobileOffsetY={riveProps.mobileOffsetY}
            className="w-full h-full"
          />
        </div>
      </div>
    </section>
  );
}

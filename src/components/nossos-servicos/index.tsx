"use client";

import React, { useEffect, useState } from "react";
import ResponsiveRive from "@/components/nossos-servicos/NSRive";
import { Fit } from "@rive-app/react-canvas";

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
    desktopScale: 1.1,
    desktopOffsetX: 0,
    desktopOffsetY: 0,
    mobileScale: 1,
    mobileOffsetX: 0,
    mobileOffsetY: 0,
    // Navegação infinita + WhatsApp CTA
    enableWheelLoop: true,
    enableArrowKeys: true,
    itemCount: 6, // ajuste conforme a quantidade real de serviços
    initialIndex: 0,
    riveIndexInputName: "index", // ajuste se seu State Machine usar outro nome
    whatsappEnabled: true,
    // Se não informarmos um número, o link abre o WhatsApp com a mensagem e você escolhe o contato
    // Exemplo para ativar com número: whatsappNumber: "5581XXXXXXXXX",
    whatsappMessageByIndex: [
      "Olá! Tenho interesse em META ADS da Spot-A.",
      "Olá! Tenho interesse em YOUTUBE ADS da Spot-A.",
      "Olá! Tenho interesse nesse serviço da Spot-A.",
      "Olá! Tenho interesse nesse serviço da Spot-A.",
      "Olá! Tenho interesse nesse serviço da Spot-A.",
      "Olá! Tenho interesse nesse serviço da Spot-A.",
    ],
  };

  return (
    <section
      className="relative w-full bg-[#010510] flex justify-center"
      style={{
        height: isMobile ? "140vh" : "100dvh", // altura geral menor só no mobile
        overflow: "hidden", // corta o excesso do canvas
      }}
    >
      <div
        className="w-full h-full flex justify-center items-center"
      >
        <div
          className="absolute w-full"
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
            enableWheelLoop={riveProps.enableWheelLoop}
            enableArrowKeys={riveProps.enableArrowKeys}
            itemCount={riveProps.itemCount}
            initialIndex={riveProps.initialIndex}
            riveIndexInputName={riveProps.riveIndexInputName}
            whatsappEnabled={riveProps.whatsappEnabled}
            // whatsappNumber={"5581XXXXXXXXX"} // opcional: ative com seu número real
            whatsappMessageByIndex={riveProps.whatsappMessageByIndex}
            className="w-full h-full"
            />
        </div>
      </div>
    </section>
  );
}

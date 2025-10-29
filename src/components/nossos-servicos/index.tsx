"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
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
    // Navegação infinita + WhatsApp CTA interno na Rive (mantido)
    enableWheelLoop: true,
    enableArrowKeys: true,
    itemCount: 6,
    initialIndex: 0,
    riveIndexInputName: "index",
    whatsappEnabled: true,
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
      className="relative w-full bg-[#010510] flex flex-col items-center"
      style={{
        height: isMobile ? "140vh" : "auto", // mantém altura menor no mobile
        overflow: "hidden",
      }}
    >
      <div className="w-full h-full flex justify-center items-center">
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

      {/* ===== Botão "Saiba mais" (maior e mais próximo) ===== */}
      <div className="relative z-20 -mt-3 md:-mt-5 lg:-mt-7 flex w-full items-center justify-center">
        <Link
          href="https://wa.me/5511986542748?text=Olá! Gostaria de saber mais sobre os serviços de tráfego pago da Spot-A. Podem me ajudar a atrair leads qualificados e escalar minhas vendas?"
          target="_blank"
          rel="noopener noreferrer"
          className="
            inline-flex items-center justify-center
            rounded-[33.9px] border border-[#F3C53D]/60 bg-black/20 backdrop-blur-md
            px-6 sm:px-7 md:px-8
            h-[54px] sm:h-[56px] md:h-[60px] lg:h-[64px]
            w-[66%] sm:w-[58%] md:w-[280px] lg:w-[320px]
            text-sm sm:text-base md:text-lg
            transition-colors hover:border-[#F3C53D]
          "
        >
          Saiba mais
        </Link>
      </div>
      {/* ===== /Botão ===== */}
    </section>
  );
}

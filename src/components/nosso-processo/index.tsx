"use client";

import React from "react";
import Link from "next/link";
import ResponsiveRive from "@/components/nosso-processo/NPRive";

export default function HeroSection() {
  return (
    <section className="relative bg-[#010510] w-full overflow-visible">
      {/* Wrapper relativo para ancorar o botão exatamente sobre o bloco da animação */}
      <div className="relative w-full mx-auto">
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
            aspect-[430/1454]      /* mobile artboard original */
            md:aspect-[1920/1181]  /* desktop artboard original */
          "
        />

        {/* ===== Botão "Saiba mais" — colado via translateY negativo ===== */}
        <div
          className="
            pointer-events-auto
            absolute left-1/2 bottom-0 -translate-x-1/2
            translate-y-[-88px] md:translate-y-[-108px] lg:translate-y-[-128px]
            z-30 flex w-full items-center justify-center
          "
        >
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
      </div>

      {/* Espaço mínimo para não sobrepor a próxima seção */}
      <div className="h-10 md:h-12 lg:h-14" />
    </section>
  );
}

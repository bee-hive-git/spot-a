"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], weight: ["400"] });

export function Diagnostico() {
  const [empresa, setEmpresa] = useState("");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      // Redirecionar para WhatsApp com mensagem personalizada
      const message = `Olá! Gostaria de fazer um diagnóstico gratuito de tráfego pago para minha empresa: ${empresa}. Podem me ajudar a identificar oportunidades de crescimento?`;
      const whatsappUrl = `https://wa.me/5511986542748?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    },
    [empresa]
  );

  return (
    <section
      id="diagnostico"
      className="relative isolate bg-[#010510] w-full max-w-full overflow-x-hidden overscroll-x-none touch-pan-y"
      style={
        {
          "--page": "1350px",
          "--desktopOffset": "160px",
          "--tabletPull": "clamp(0px, 1024px - 100vw, 256px)",
        } as React.CSSProperties
      }
    >
      {/* desktop */}
      <div
        className="pointer-events-none absolute inset-0 hidden lg:block -z-10 overflow-hidden"
        style={{ contain: "paint" }}
      >
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            top: "calc(clamp(-220px, -22%, -80px) + (var(--tabletPull) * 0.45))",
            width: "clamp(420px, 52vw, 760px)",
            height: "clamp(420px, 52vw, 760px)",
          }}
        >
          <Image
            src="/diag/simbolo2.png"
            alt=""
            fill
            className="object-contain opacity-90"
            sizes="(min-width: 1280px) 760px, 52vw"
            priority
          />
        </div>

        <div
          className="absolute"
          style={{
            top: "4%",
            left:
              "calc(((100vw - var(--page)) / 2) - var(--desktopOffset) + (var(--tabletPull) * 3.2))",
            width: "clamp(520px, 60vw, 880px)",
            height: "clamp(520px, 60vw, 880px)",
          }}
        >
          <Image
            src="/diag/simbolo1.png"
            alt=""
            fill
            className="object-contain opacity-90"
            sizes="(min-width: 1536px) 880px, (min-width: 1280px) 800px, 60vw"
          />
        </div>

        <div
          className="absolute"
          style={{
            top: "-2%",
            right:
              "calc(((100vw - var(--page)) / 2) - var(--desktopOffset) + (var(--tabletPull) * 3.2))",
            width: "clamp(480px, 56vw, 820px)",
            height: "clamp(480px, 56vw, 820px)",
          }}
        >
          <Image
            src="/diag/simbolo3.png"
            alt=""
            fill
            className="object-contain opacity-90"
            sizes="(min-width: 1536px) 820px, (min-width: 1280px) 760px, 56vw"
          />
        </div>
      </div>

      {/* mobile */}
      <div
        className="pointer-events-none absolute inset-0 block md:hidden -z-10 overflow-hidden"
        style={{ contain: "paint" }}
      >
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            top: "clamp(-160px, -18vw, -60px)",
            width: "clamp(300px, 64vw, 420px)",
            height: "clamp(300px, 64vw, 420px)",
          }}
        >
          <Image
            src="/diag/simbolo2.png"
            alt=""
            fill
            className="object-contain opacity-90"
            sizes="(max-width: 767px) 64vw"
            priority
          />
        </div>

        <div
          className="absolute"
          style={{
            top: "8%",
            left: "clamp(-170px, -20vw, -100px)", // um pouco à direita do anterior
            width: "clamp(280px, 58vw, 400px)",
            height: "clamp(280px, 58vw, 400px)",
          }}
        >
          <Image
            src="/diag/simbolo1.png"
            alt=""
            fill
            className="object-contain opacity-90"
            sizes="(max-width: 767px) 58vw"
          />
        </div>
      </div>

      {/* tablet */}
      <div
        className="pointer-events-none absolute inset-0 hidden md:block lg:hidden -z-10 overflow-hidden"
        style={{ contain: "paint" }}
      >
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            top: "clamp(-240px, -20vw, -100px)",
            width: "clamp(340px, 60vw, 460px)",
            height: "clamp(340px, 60vw, 460px)",
          }}
        >
          <Image
            src="/diag/simbolo2.png"
            alt=""
            fill
            className="object-contain opacity-90"
            sizes="(min-width: 768px) and (max-width: 1023px) 60vw"
            priority
          />
        </div>

        <div
          className="absolute"
          style={{
            top: "10%",
            left: "clamp(-140px, -13vw, -72px)", // um pouco à direita do anterior
            width: "clamp(320px, 56vw, 440px)",
            height: "clamp(320px, 56vw, 440px)",
          }}
        >
          <Image
            src="/diag/simbolo1.png"
            alt=""
            fill
            className="object-contain opacity-90"
            sizes="(min-width: 768px) and (max-width: 1023px) 56vw"
          />
        </div>
      </div>

      {/* content */}
      <div className="relative z-10 mx-auto max-w-[1350px] px-6 pt-36 pb-56 md:pt-80 md:pb-[420px]">
        <h1
          className={`
            mx-auto max-w-[1100px] text-center
            text-4xl font-semibold leading-[1.20]
            md:text-6xl md:leading-[1.10]
            xl:text-[85.2px] xl:leading-[1.06]
            bg-[linear-gradient(91.64deg,_#04070D_-6.08%,_#D5DBE6_37.96%)]
            bg-clip-text text-transparent pb-1
          `}
        >
          Faça um
          <br />
          Diagnóstico
        </h1>

        <p
          className={`${inter.className} mx-auto mt-2 max-w-[980px] text-center text-[18px] leading-[28px] text-white md:mt-4 md:text-[22px] md:leading-[34px] xl:text-[24px] xl:leading-[36px]`}
        >
          Para Começar a Atrair, Qualificar e
          <br className="md:hidden" />
          <span className="md:whitespace-nowrap"> Converter Leads</span>
        </p>

        <div className="relative">
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-6 flex w-full max-w-[560px] flex-col items-center gap-4 md:mt-10"
          >
            <input
              type="text"
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
              placeholder="Digite o nome da sua Empresa!"
              className={`
                w-full rounded-full border-4 bg-white px-6 py-3
                text-[16px] leading-[24px] text-black
                placeholder:text-black/60 outline-none
                md:text-[18px] md:leading-[26px]
              `}
              style={{ borderColor: "#15488D" }}
              aria-label="Digite o nome da sua Empresa!"
            />

            <button
              type="submit"
              className={`
                mt-2 inline-flex items-center justify-center rounded-full
                px-16 py-2.5
                text-[19px] font-bold text-white md:text-[21px]
                shadow-[0_0_40px_rgba(115,175,255,0.10)]
                transition-all duration-200
                hover:brightness-110 hover:ring-2 hover:ring-[#F3C53D]/35
                focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F3C53D]/45
                active:brightness-105
              `}
              style={{ background: "linear-gradient(83.94deg, #CA9700 -5.76%, #765802 93.06%)" }}
              aria-label="Começar!"
            >
              Começar!
            </button>
          </form>

          {/* mobile */}
          <div
            className="pointer-events-none absolute -z-10 md:hidden"
            style={{
              top: "calc(100% - 110px)",
              right: "clamp(-152px, -18vw, -36px)",
              width: "clamp(300px, 64vw, 420px)",
              height: "clamp(300px, 64vw, 420px)",
            }}
          >
            <Image
              src="/diag/simbolo3.png"
              alt=""
              fill
              className="object-contain opacity-90"
              sizes="(max-width: 767px) 64vw"
            />
          </div>

          {/* tablet */}
          <div
            className="pointer-events-none absolute -z-10 hidden md:block lg:hidden"
            style={{
              top: "calc(100% - 140px)",
              right: "clamp(-104px, -10vw, 0px)",
              width: "clamp(340px, 60vw, 460px)",
              height: "clamp(340px, 60vw, 460px)",
            }}
          >
            <Image
              src="/diag/simbolo3.png"
              alt=""
              fill
              className="object-contain opacity-90"
              sizes="(min-width: 768px) and (max-width: 1023px) 60vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

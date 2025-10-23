"use client";

// rodapé
export function Rodape() {
  return (
    <footer id="rodape" className="relative w-full bg-[#00142F]">
      <div className="mx-auto max-w-[1350px] px-6">
        <div className="flex items-center justify-center py-[18px] md:py-[28px]">
          <p
            className="
              text-center font-semibold text-white
              text-[12px] leading-[18px]
              sm:text-[13px] sm:leading-[19px]
              md:text-[14.5px] md:leading-[20px]
              tracking-[0px]
              whitespace-nowrap
            "
            style={{
              fontFamily:
                "Poppins, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Helvetica, Arial",
            }}
          >
            Copyright © SPOT-A Marketing – Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Rodape;

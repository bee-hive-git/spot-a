"use client";

import React from "react";
import Hero from "@/components/hero";
import NossoProcesso from "@/components/nosso-processo";
import Diferenciais from "@/components/diferenciais";
import NossosServicos from "@/components/nossos-servicos";
import { CasosClientes } from "@/components/casos-clientes";
import { Diagnostico } from "@/components/diag";
import Rodape from "@/components/rodape";
import { Leva } from "leva";

export default function Page() {
  return (
    <main>
      <Leva />
      <Hero />
      <NossoProcesso />
      <Diferenciais />
      <NossosServicos />
      <CasosClientes />
      <Diagnostico />
      <Rodape />
    </main>
  );
}

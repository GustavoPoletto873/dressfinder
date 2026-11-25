import type { ComponentType } from "react";
import { Buscador } from "@/components/Buscador";
import { Aviso, BotaoFavoritos } from "@/components/comum/favoritos";
import { SwitchModo } from "@/components/comum/SwitchModo";
import { FlorzinhasRoupas, RamoCantoRoupas } from "@/components/roupas/Ramos";
import { Florzinhas, RamoCanto } from "@/components/vestidos/Ramos";

type Ramo = ComponentType<{ className?: string; atrasoBase?: number }>;

/**
 * Os quatro ramos da página (cantos de cima e laterais em telas largas).
 * Cada modo tem o seu conjunto; o CSS faz o fade entre eles (.deco-*).
 */
function RamosDaPagina({ Ramo, classe }: { Ramo: Ramo; classe: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 -z-10 ${classe}`} aria-hidden>
      {/* ramos de flores nos cantos superiores (decorativos) */}
      <Ramo className="pointer-events-none absolute -left-3 -top-3 -z-10 w-48 sm:w-80 lg:w-[26rem]" />
      <Ramo className="pointer-events-none absolute -right-3 -top-3 -z-10 w-48 -scale-x-100 sm:w-80 lg:w-[26rem]" atrasoBase={0.35} />
      {/* em telas largas, ramos nas laterais emolduram o formulário */}
      <Ramo className="pointer-events-none absolute -left-3 top-[30rem] -z-10 hidden w-72 -scale-y-100 xl:block" atrasoBase={0.8} />
      <Ramo
        className="pointer-events-none absolute -right-3 top-[46rem] -z-10 hidden w-72 -scale-x-100 -scale-y-100 xl:block"
        atrasoBase={1}
      />
    </div>
  );
}

/** Enfeite pequeno de flores; o do outro modo fica por cima, invisível, para o fade. */
function Enfeite({ classe, classeRoupas }: { classe: string; classeRoupas: string }) {
  return (
    <div className="relative">
      <Florzinhas className={`deco-vestidos ${classe}`} />
      <FlorzinhasRoupas className={`deco-roupas absolute left-1/2 -translate-x-1/2 ${classeRoupas}`} />
    </div>
  );
}

export default function PaginaInicial() {
  return (
    <div className="relative isolate flex flex-1 flex-col overflow-x-clip">
      <RamosDaPagina Ramo={RamoCanto} classe="deco-vestidos" />
      <RamosDaPagina Ramo={RamoCantoRoupas} classe="deco-roupas" />

      {/* switch Vestidos | Roupas, no topo e centralizado */}
      <div data-regressao-ignorar className="absolute left-1/2 top-3 z-30 -translate-x-1/2 sm:top-5">
        <SwitchModo />
      </div>

      {/* favoritos sempre à mão */}
      <div className="fixed right-3 top-3 z-40 sm:right-5 sm:top-5">
        <BotaoFavoritos />
      </div>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-20 pt-36 sm:px-6 sm:pt-44 lg:pt-40">
        <header className="surgir mb-10 text-center sm:mb-14" style={{ animationDelay: "0.4s" }}>
          <p className="so-vestidos text-xs font-medium uppercase tracking-[0.3em] text-texto-suave">Sua consultora de vestidos</p>
          <p className="so-roupas text-xs font-medium uppercase tracking-[0.3em] text-texto-suave">Sua consultora de estilo</p>
          <h1 className="mt-2 font-cursiva text-6xl leading-[1.1] text-primaria sm:text-8xl">
            <span className="so-vestidos">Achei o Vestido</span>
            <span className="so-roupas">Achei a Roupa</span>
          </h1>
          <Enfeite classe="mx-auto mt-2 w-36 sm:w-44" classeRoupas="top-2 w-36 sm:w-44" />
          <p className="so-vestidos mx-auto mt-4 max-w-xl font-titulo text-xl italic leading-relaxed text-texto sm:text-2xl">
            Conte a ocasião e como você imagina o vestido. A gente encontra opções na Shein que combinam com você.
          </p>
          <p className="so-roupas mx-auto mt-4 max-w-xl font-titulo text-xl italic leading-relaxed text-texto sm:text-2xl">
            Conte qual peça você procura e como imagina. A gente encontra opções na Shein que combinam com você.
          </p>
        </header>

        <Buscador />
      </main>

      <footer className="border-t border-borda/70 px-4 py-8 text-center text-xs text-texto-suave">
        <Enfeite classe="mx-auto mb-3 w-24 opacity-80" classeRoupas="top-0 w-24 opacity-80" />
        <p>Feito com carinho. Este app não tem relação com a Shein.</p>
        <p className="mt-1">Preços e disponibilidade podem mudar: confira sempre na loja.</p>
      </footer>

      <Aviso />
    </div>
  );
}

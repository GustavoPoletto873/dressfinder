import { Buscador } from "@/components/Buscador";
import { Aviso, BotaoFavoritos } from "@/components/favoritos";
import { Florzinhas, RamoCanto } from "@/components/Ramos";

export default function PaginaInicial() {
  return (
    <div className="relative isolate flex flex-1 flex-col overflow-x-clip">
      {/* ramos de flores nos cantos superiores (decorativos) */}
      <RamoCanto className="pointer-events-none absolute -left-3 -top-3 -z-10 w-48 sm:w-80 lg:w-[26rem]" />
      <RamoCanto
        className="pointer-events-none absolute -right-3 -top-3 -z-10 w-48 -scale-x-100 sm:w-80 lg:w-[26rem]"
        atrasoBase={0.35}
      />
      {/* em telas largas, ramos nas laterais emolduram o formulário */}
      <RamoCanto
        className="pointer-events-none absolute -left-3 top-[30rem] -z-10 hidden w-72 -scale-y-100 xl:block"
        atrasoBase={0.8}
      />
      <RamoCanto
        className="pointer-events-none absolute -right-3 top-[46rem] -z-10 hidden w-72 -scale-x-100 -scale-y-100 xl:block"
        atrasoBase={1}
      />

      {/* favoritos sempre à mão */}
      <div className="fixed right-3 top-3 z-40 sm:right-5 sm:top-5">
        <BotaoFavoritos />
      </div>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-20 pt-36 sm:px-6 sm:pt-44 lg:pt-40">
        <header className="surgir mb-10 text-center sm:mb-14" style={{ animationDelay: "0.4s" }}>
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-suave">Sua consultora de vestidos</p>
          <h1 className="mt-2 font-cursiva text-6xl leading-[1.1] text-rosa sm:text-8xl">Achei o Vestido</h1>
          <Florzinhas className="mx-auto mt-2 w-36 sm:w-44" />
          <p className="mx-auto mt-4 max-w-xl font-titulo text-xl italic leading-relaxed text-tinta sm:text-2xl">
            Conte a ocasião e como você imagina o vestido. A gente encontra opções na Shein que combinam com você.
          </p>
        </header>

        <Buscador />
      </main>

      <footer className="border-t border-linha/70 px-4 py-8 text-center text-xs text-suave">
        <Florzinhas className="mx-auto mb-3 w-24 opacity-80" />
        <p>Feito com carinho. Este app não tem relação com a Shein.</p>
        <p className="mt-1">Preços e disponibilidade podem mudar: confira sempre na loja.</p>
      </footer>

      <Aviso />
    </div>
  );
}

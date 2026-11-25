import { Buscador } from "@/components/Buscador";
import { DecoracaoPagina, Enfeite } from "@/components/comum/Decoracao";
import { Aviso, BotaoFavoritos } from "@/components/comum/favoritos";
import { SwitchModo } from "@/components/comum/SwitchModo";

export default function PaginaInicial() {
  return (
    <div className="relative isolate flex flex-1 flex-col overflow-x-clip">
      {/* flores da página inteira (um conjunto por modo, com fade e crescendo a cada troca) */}
      <DecoracaoPagina />

      {/* switch Vestidos | Roupas, no topo e centralizado (em telas muito estreitas, à esquerda, para não cobrir os favoritos) */}
      <div
        data-regressao-ignorar
        className="absolute left-1/2 top-3 z-30 -translate-x-1/2 max-[359px]:left-3 max-[359px]:translate-x-0 sm:top-5"
      >
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
            Conte a ocasião e como você imagina o vestido. A gente encontra opções nas suas lojas favoritas.
          </p>
          <p className="so-roupas mx-auto mt-4 max-w-xl font-titulo text-xl italic leading-relaxed text-texto sm:text-2xl">
            Conte qual peça você procura e como imagina. A gente encontra opções nas suas lojas favoritas.
          </p>
        </header>

        <Buscador />
      </main>

      <footer className="border-t border-borda/70 px-4 pb-28 pt-8 text-center text-xs text-texto-suave sm:pb-8">
        <Enfeite classe="mx-auto mb-3 w-24 opacity-80" classeRoupas="top-0 w-24 opacity-80" />
        <p>Feito com carinho. Este app não tem relação com as lojas mostradas.</p>
        <p className="mt-1">Preços e disponibilidade podem mudar: confira sempre na loja.</p>
      </footer>

      <Aviso />
    </div>
  );
}

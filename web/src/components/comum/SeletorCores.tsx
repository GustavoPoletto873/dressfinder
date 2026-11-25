"use client";

/**
 * Seletor de cores e estampas: até MAX_CORES escolhidas da paleta, mais
 * uma cor digitada livremente. Usado pelos dois modos.
 */
import { useState, type CSSProperties } from "react";
import { alternarNaLista, CampoLivre, contemNaLista, Grupo, itensDaLista } from "./campos";
import { useCartela } from "./cartela";
import { IconeCheck, IconeFechar } from "./icones";
import { CORES_CLARAS, GRUPOS_CORES, MAX_CORES, TODAS_AS_CORES } from "./paletaCores";
import { CartelaNoSeletor } from "./QuizCores";

/** Bolinha de cor com o nome embaixo. */
function BolinhaCor({
  nome,
  fundo,
  ativa,
  bloqueada,
  sugerida,
  onClick,
}: {
  nome: string;
  fundo: string;
  ativa: boolean;
  bloqueada: boolean;
  /** Faz parte da cartela da usuária (quiz de cores). */
  sugerida: boolean;
  onClick: () => void;
}) {
  const clara = CORES_CLARAS.has(nome);
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativa}
      aria-disabled={bloqueada}
      aria-label={sugerida ? `${nome} (da sua cartela)` : nome}
      title={sugerida ? `${nome} · da sua cartela` : nome}
      className={
        "group flex w-[3.75rem] flex-col items-center gap-1.5 rounded-xl py-1 transition-opacity " +
        (bloqueada ? "opacity-55" : "")
      }
    >
      <span
        className={
          "relative grid size-10 place-items-center rounded-full transition-all duration-200 group-active:scale-90 " +
          (ativa
            ? "ring-2 ring-destaque ring-offset-2 ring-offset-superficie"
            : (clara ? "ring-1 ring-black/15 " : "ring-1 ring-black/5 ") + "group-hover:scale-110")
        }
        style={{ background: fundo } as CSSProperties}
      >
        {ativa && (
          <span className="grid size-5 place-items-center rounded-full bg-superficie/90 text-primaria-forte shadow-sm">
            <IconeCheck className="size-3.5" strokeWidth={2.6} />
          </span>
        )}
        {sugerida && (
          <span data-cartela className="absolute -right-0.5 -top-0.5 size-3 rounded-full border-2 border-superficie bg-primaria" />
        )}
      </span>
      <span className={"text-center text-[11px] leading-tight " + (ativa ? "font-semibold text-primaria-forte" : "text-texto")}>
        {nome}
      </span>
    </button>
  );
}

export function SeletorCores({
  cor,
  corOutra,
  aoMudarCor,
  aoMudarCorOutra,
  semRotulo = false,
}: {
  /** Quando a pergunta já está no título da etapa, esconde o rótulo e a ajuda. */
  semRotulo?: boolean;
  /** Cores da paleta escolhidas, separadas por vírgula. */
  cor: string;
  /** Cor ou estampa digitada livremente. */
  corOutra: string;
  aoMudarCor: (cor: string) => void;
  aoMudarCorOutra: (corOutra: string) => void;
}) {
  const coresEscolhidas = itensDaLista(cor);
  const cartela = useCartela();
  const [avisoLimite, setAvisoLimite] = useState(false);
  const alternarCor = (nome: string) => {
    if (!contemNaLista(cor, nome) && coresEscolhidas.length >= MAX_CORES) {
      setAvisoLimite(true);
      setTimeout(() => setAvisoLimite(false), 3500);
      return;
    }
    setAvisoLimite(false);
    aoMudarCor(alternarNaLista(cor, nome));
  };
  const fundoDaCor = (nome: string) => TODAS_AS_CORES.find((c) => c.nome === nome)?.fundo ?? "#eee";

  const conteudo = (
    <>
      {!semRotulo && (
        <p className="-mt-1 text-sm text-texto-suave">
          Escolha até {MAX_CORES}. Buscamos cada uma como opção.
        </p>
      )}

      {/* quiz de coloração pessoal: convite ou a cartela já descoberta */}
      <CartelaNoSeletor coresEscolhidas={coresEscolhidas} aoUsarCores={(cores) => aoMudarCor(cores.join(", "))} />

      {/* escolhidas, com atalho para tirar */}
      {coresEscolhidas.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5" aria-label="Cores escolhidas">
          {coresEscolhidas.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => alternarCor(c)}
              aria-label={`Tirar ${c}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-primaria-suave py-1 pl-1.5 pr-2.5 text-sm text-primaria-forte transition hover:bg-realce active:scale-95"
            >
              <span className="size-4 rounded-full ring-1 ring-black/10" style={{ background: fundoDaCor(c) }} />
              {c}
              <IconeFechar className="size-3.5" />
            </button>
          ))}
          <span className="ml-1 text-xs text-texto-suave">
            {coresEscolhidas.length} de {MAX_CORES}
          </span>
        </div>
      )}

      <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
        {GRUPOS_CORES.map((g) => (
          <div key={g.titulo}>
            <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-texto-suave">{g.titulo}</p>
            <div className="flex flex-wrap gap-x-0.5 gap-y-2">
              {g.cores.map((c) => {
                const ativa = contemNaLista(cor, c.nome);
                return (
                  <BolinhaCor
                    key={c.nome}
                    nome={c.nome}
                    fundo={c.fundo}
                    ativa={ativa}
                    bloqueada={!ativa && coresEscolhidas.length >= MAX_CORES}
                    sugerida={Boolean(cartela?.cores.includes(c.nome))}
                    onClick={() => alternarCor(c.nome)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {avisoLimite && (
        <p role="status" className="surgir rounded-xl bg-primaria-suave px-3.5 py-2 text-sm text-primaria-forte">
          Você já escolheu {MAX_CORES} cores. Toque em uma delas para tirar e escolher outra.
        </p>
      )}

      <CampoLivre
        valor={corOutra}
        aoMudar={aoMudarCorOutra}
        convite="Outra cor ou estampa? Escreva aqui"
        exemplo="Ex.: verde água, tie-dye"
        rotulo="Outra cor ou estampa"
        maxLength={60}
      />
    </>
  );
  return semRotulo ? <div className="space-y-2.5">{conteudo}</div> : <Grupo rotulo="Cores e estampas">{conteudo}</Grupo>;
}

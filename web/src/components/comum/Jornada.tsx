"use client";

/**
 * Jornada guiada: em vez de um formulário longo, uma pergunta por vez,
 * com barra de progresso clicável e o botão "Ver sugestões" disponível
 * assim que o essencial estiver escolhido. Usada pelos dois modos.
 */
import { useRef, useState, type ReactNode } from "react";
import { BotaoLimpar, CaixaErros } from "./campos";
import { IconeAvancar, IconeCheck, IconeFlor, IconeVoltar } from "./icones";

export interface Passo {
  id: string;
  /** Nome curto na barra de progresso ("Ocasião", "Cores"...). */
  rotulo: string;
  /** Pergunta grande da etapa. */
  pergunta: string;
  ajuda?: string;
  conteudo: ReactNode;
  /** A pessoa já escolheu algo nesta etapa? */
  preenchido: boolean;
  obrigatorio?: boolean;
  /** Mensagem quando tenta seguir sem preencher uma etapa obrigatória. */
  avisoObrigatorio?: string;
}

interface Props {
  passos: Passo[];
  aoEnviar: () => void;
  carregando: boolean;
  erros: string[];
  /** Texto do botão de busca na última etapa ("Encontrar meu vestido"). */
  textoFinal: string;
  textoCarregando: string;
  algoPreenchido: boolean;
  aoLimpar: () => void;
}

export function Jornada({ passos, aoEnviar, carregando, erros, textoFinal, textoCarregando, algoPreenchido, aoLimpar }: Props) {
  const [atual, setAtual] = useState(0);
  const [avisoEm, setAvisoEm] = useState<string | null>(null);
  const titulo = useRef<HTMLHeadingElement>(null);
  const topo = useRef<HTMLDivElement>(null);

  const passo = passos[Math.min(atual, passos.length - 1)]!;
  const ultimo = atual === passos.length - 1;
  const pendente = passos.findIndex((p) => p.obrigatorio && !p.preenchido);
  const podeBuscar = pendente === -1;

  const irPara = (indice: number) => {
    setAtual(indice);
    setAvisoEm(null);
    // leva a etapa nova para a tela e o foco para o título (leitores de tela anunciam a pergunta)
    requestAnimationFrame(() => {
      const caixa = topo.current?.getBoundingClientRect();
      if (caixa && caixa.top < 0) topo.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      titulo.current?.focus({ preventScroll: true });
    });
  };

  const avancar = () => {
    if (passo.obrigatorio && !passo.preenchido) {
      setAvisoEm(passo.id);
      return;
    }
    if (!ultimo) irPara(atual + 1);
  };

  const buscar = () => {
    if (!podeBuscar) {
      // falta algo obrigatório: leva até a etapa e explica
      irPara(pendente);
      setAvisoEm(passos[pendente]!.id);
      return;
    }
    aoEnviar();
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        // Enter num campo: segue para a próxima etapa (ou busca, na última)
        if (ultimo) buscar();
        else avancar();
      }}
      noValidate
      className="space-y-7"
    >
      <div ref={topo} className="scroll-mt-6" />

      {/* progresso: cada etapa é clicável */}
      <nav aria-label="Etapas">
        <ol className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${passos.length}, minmax(0, 1fr))` }}>
          {passos.map((p, i) => {
            const ehAtual = i === atual;
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => irPara(i)}
                  aria-current={ehAtual ? "step" : undefined}
                  aria-label={`Etapa ${i + 1}: ${p.rotulo}${p.preenchido ? " (preenchida)" : ""}`}
                  className="group flex w-full flex-col gap-1.5 rounded-lg py-1.5 text-left sm:pb-1 sm:pt-0"
                >
                  <span
                    className={
                      "h-1.5 w-full rounded-full transition-colors duration-300 " +
                      (ehAtual ? "bg-primaria" : p.preenchido ? "bg-destaque" : "bg-borda group-hover:bg-destaque/50")
                    }
                  />
                  {/* no celular só as barrinhas: o título "Passo X de Y" já diz onde a pessoa está */}
                  <span
                    aria-hidden
                    className={
                      "hidden items-center gap-1 truncate text-xs sm:flex " +
                      (ehAtual ? "font-semibold text-primaria-forte" : "text-texto-suave group-hover:text-texto")
                    }
                  >
                    {p.preenchido && !ehAtual && <IconeCheck className="size-3 shrink-0 text-primaria" strokeWidth={2.6} />}
                    {p.rotulo}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* etapa atual */}
      <section key={passo.id} className="surgir space-y-6" aria-labelledby={`pergunta-${passo.id}`}>
        <header className="space-y-1">
          <p className="font-cursiva text-2xl leading-none text-primaria">
            Passo {atual + 1} de {passos.length}
          </p>
          <h2
            ref={titulo}
            id={`pergunta-${passo.id}`}
            tabIndex={-1}
            className="font-titulo text-[1.85rem] font-semibold leading-tight outline-none sm:text-4xl"
          >
            {passo.pergunta}
          </h2>
          {passo.ajuda && <p className="text-texto-suave">{passo.ajuda}</p>}
        </header>

        {passo.conteudo}

        {avisoEm === passo.id && passo.avisoObrigatorio && (
          <p role="alert" className="surgir rounded-2xl border border-destaque/30 bg-primaria-suave px-4 py-3 text-sm text-primaria-forte">
            {passo.avisoObrigatorio}
          </p>
        )}
      </section>

      <CaixaErros erros={erros} />

      {/* navegação; fica "grudada" no rodapé da tela no celular */}
      <div className="sticky bottom-3 z-10 -mx-1 flex items-center gap-2 rounded-full bg-superficie/90 p-1.5 shadow-elevada backdrop-blur lg:static lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none">
        {atual > 0 && (
          <button
            type="button"
            onClick={() => irPara(atual - 1)}
            aria-label="Voltar para a etapa anterior"
            className="grid size-12 shrink-0 place-items-center rounded-full border border-borda bg-superficie text-texto-suave transition hover:border-destaque/50 hover:text-texto active:scale-95"
          >
            <IconeVoltar className="size-5" />
          </button>
        )}

        {!ultimo && (
          <button
            type="button"
            onClick={avancar}
            className={
              "flex h-12 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 text-sm font-semibold transition-all duration-200 active:scale-[0.98] sm:px-4 " +
              (podeBuscar
                ? "border border-destaque/50 bg-superficie text-primaria-forte hover:border-primaria"
                : "bg-primaria text-white shadow-elevada hover:bg-primaria-forte")
            }
          >
            {passo.preenchido || passo.obrigatorio ? "Continuar" : "Pular"}
            <IconeAvancar className="size-4" />
          </button>
        )}

        {(podeBuscar || ultimo) && (
          <button
            type="button"
            onClick={buscar}
            disabled={carregando}
            className="group flex h-12 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-primaria px-3 text-sm font-semibold tracking-wide text-white sm:gap-2 sm:px-4 shadow-elevada transition-all duration-200 hover:-translate-y-0.5 hover:bg-primaria-forte active:translate-y-0 active:scale-[0.98] disabled:cursor-wait disabled:opacity-85 sm:text-base"
          >
            <IconeFlor className={"size-4 shrink-0 text-white/90 sm:size-5 transition-transform duration-500 " + (carregando ? "girar-lento" : "group-hover:rotate-[72deg]")} />
            {carregando ? textoCarregando : ultimo ? textoFinal : "Ver sugestões"}
          </button>
        )}
      </div>

      {algoPreenchido && !carregando && (
        <BotaoLimpar
          onClick={() => {
            setAtual(0);
            setAvisoEm(null);
            aoLimpar();
          }}
        />
      )}
    </form>
  );
}

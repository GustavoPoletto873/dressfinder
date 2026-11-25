"use client";

/**
 * "Cores que combinam com você": convite + quiz de coloração pessoal numa folha.
 * Fica no topo da etapa de cores (os dois modos). O resultado é guardado no
 * navegador e as cores da cartela ganham uma marquinha na paleta.
 */
import { useRef, useState } from "react";
import { calcularCartela, PERGUNTAS, type Cartela } from "@/lib/coloracao";
import { definirCartela, useCartela } from "./cartela";
import { Folha } from "./Folha";
import { IconeBrilho, IconeVoltar } from "./icones";
import { CORES_CLARAS, MAX_CORES, TODAS_AS_CORES } from "./paletaCores";

const fundoDaCor = (nome: string) => TODAS_AS_CORES.find((c) => c.nome === nome)?.fundo ?? "#eee";

function Amostras({ cores, tamanho = "size-5" }: { cores: string[]; tamanho?: string }) {
  return (
    <span className="flex -space-x-1.5" aria-hidden>
      {cores.map((c) => (
        <span
          key={c}
          className={`${tamanho} rounded-full ring-2 ring-superficie ${CORES_CLARAS.has(c) ? "outline outline-1 -outline-offset-1 outline-black/15" : ""}`}
          style={{ background: fundoDaCor(c) }}
        />
      ))}
    </span>
  );
}

function ListaCores({ titulo, cores }: { titulo: string; cores: string[] }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-texto-suave">{titulo}</p>
      <ul className="flex flex-wrap gap-x-3 gap-y-2.5">
        {cores.map((c) => (
          <li key={c} className="flex w-14 flex-col items-center gap-1 text-center text-[11px] leading-tight">
            <span
              className={"size-9 rounded-full " + (CORES_CLARAS.has(c) ? "ring-1 ring-black/15" : "ring-1 ring-black/5")}
              style={{ background: fundoDaCor(c) }}
            />
            {c}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Resultado({ cartela }: { cartela: Cartela }) {
  return (
    <div className="surgir space-y-5">
      <div className="rounded-3xl bg-primaria-suave px-5 py-4">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-primaria-forte">Sua cartela</p>
        <p className="font-titulo text-3xl font-semibold leading-tight">
          {cartela.nome} <span className="font-normal italic text-texto-suave">· {cartela.resumo}</span>
        </p>
        <p className="mt-1.5 text-sm leading-relaxed">{cartela.descricao}</p>
      </div>
      <ListaCores titulo="Valorizam você" cores={cartela.cores} />
      <ListaCores titulo="Use longe do rosto" cores={cartela.evitar} />
      <p className="text-xs text-texto-suave">
        É uma dica rápida para orientar a busca. Uma análise de coloração com profissional, ao vivo, é bem mais precisa.
      </p>
    </div>
  );
}

export function CartelaNoSeletor({ coresEscolhidas, aoUsarCores }: { coresEscolhidas: string[]; aoUsarCores: (cores: string[]) => void }) {
  const cartela = useCartela();
  const folha = useRef<HTMLDialogElement>(null);
  const [respostas, setRespostas] = useState<number[]>([]);
  const [resultado, setResultado] = useState<Cartela | null>(null);
  const atual = respostas.length;
  const pergunta = PERGUNTAS[atual];
  const sugestao = (cartela?.cores ?? []).slice(0, MAX_CORES);
  const jaUsando = sugestao.length > 0 && sugestao.every((c) => coresEscolhidas.includes(c));

  const abrir = () => {
    setRespostas([]);
    setResultado(null);
    folha.current?.showModal();
  };
  const responder = (indice: number) => {
    const proximas = [...respostas, indice];
    setRespostas(proximas);
    if (proximas.length === PERGUNTAS.length) {
      const nova = calcularCartela(proximas);
      setResultado(nova);
      definirCartela(nova);
    }
  };
  const usar = (c: Cartela) => {
    aoUsarCores(c.cores.slice(0, MAX_CORES));
    folha.current?.close();
  };

  return (
    <>
      {cartela ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-borda bg-superficie px-4 py-3">
          <Amostras cores={cartela.cores.slice(0, 6)} />
          <p className="min-w-0 flex-1 text-sm">
            Sua cartela: <strong className="font-semibold text-primaria-forte">{cartela.nome}</strong>{" "}
            <span className="text-texto-suave">· {cartela.resumo}. As cores dela têm um pontinho na paleta.</span>
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => aoUsarCores(sugestao)}
              disabled={jaUsando}
              className="rounded-full bg-primaria px-3.5 py-1.5 text-sm font-medium text-white transition hover:bg-primaria-forte active:scale-95 disabled:bg-primaria-suave disabled:text-primaria-forte"
            >
              {jaUsando ? "Usando suas cores" : "Usar minhas cores"}
            </button>
            <button type="button" onClick={abrir} className="rounded-full px-3 py-1.5 text-sm text-primaria-forte transition hover:bg-primaria-suave">
              Refazer
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={abrir}
          className="group flex w-full items-center gap-3 rounded-2xl border border-dashed border-destaque/50 bg-primaria-suave/50 px-4 py-3 text-left transition hover:border-solid hover:bg-primaria-suave active:scale-[0.99]"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-superficie text-primaria shadow-suave transition group-hover:rotate-12">
            <IconeBrilho className="size-5" />
          </span>
          <span className="flex-1">
            <span className="block font-medium">Não sabe quais cores te valorizam?</span>
            <span className="block text-sm text-texto-suave">Descubra sua cartela em 1 minuto, com 5 perguntas.</span>
          </span>
        </button>
      )}

      <Folha
        ref={folha}
        id="quiz-cores"
        titulo="Suas cores"
        subtitulo={resultado ? "Pronto! Estas são as cores que mais combinam com você." : `Pergunta ${atual + 1} de ${PERGUNTAS.length}`}
        rodape={
          resultado ? (
            <button
              type="button"
              onClick={() => usar(resultado)}
              className="flex h-12 w-full items-center justify-center rounded-full bg-primaria px-5 font-semibold text-white shadow-elevada transition hover:bg-primaria-forte active:scale-[0.98]"
            >
              Usar minhas cores na busca
            </button>
          ) : undefined
        }
      >
        {resultado ? (
          <Resultado cartela={resultado} />
        ) : pergunta ? (
          <div key={pergunta.id} className="surgir space-y-4">
            {/* progresso */}
            <div className="flex gap-1.5" aria-hidden>
              {PERGUNTAS.map((p, i) => (
                <span key={p.id} className={"h-1.5 flex-1 rounded-full " + (i < atual ? "bg-destaque" : i === atual ? "bg-primaria" : "bg-borda")} />
              ))}
            </div>
            <div>
              <h3 className="font-titulo text-2xl font-semibold leading-snug">{pergunta.texto}</h3>
              {pergunta.ajuda && <p className="mt-1 text-sm text-texto-suave">{pergunta.ajuda}</p>}
            </div>
            <div className="grid gap-2.5">
              {pergunta.opcoes.map((o, i) => (
                <button
                  key={o.texto}
                  type="button"
                  onClick={() => responder(i)}
                  // sem deslocar no hover: a opção seguinte aparece no mesmo lugar e "tremeria" sob o cursor
                  className="rounded-2xl border border-borda bg-superficie px-4 py-3.5 text-left transition-colors duration-200 hover:border-destaque/50 hover:bg-primaria-suave/60 active:bg-primaria-suave"
                >
                  {o.texto}
                </button>
              ))}
            </div>
            {atual > 0 && (
              <button
                type="button"
                onClick={() => setRespostas(respostas.slice(0, -1))}
                className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-sm text-texto-suave transition hover:text-texto"
              >
                <IconeVoltar className="size-4" /> Pergunta anterior
              </button>
            )}
          </div>
        ) : null}
      </Folha>
    </>
  );
}

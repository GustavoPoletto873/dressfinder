"use client";

/**
 * Escolha das lojas onde procurar (as mesmas nos dois modos).
 * Na tela, uma linha discreta: "Procurando em Shein · Renner  [Escolher lojas]".
 * O botão abre uma folha (de baixo no celular, centralizada no desktop)
 * com um cartão por loja.
 */
import { useRef, useState } from "react";
import { LOJAS, lojaPorId, MAX_LOJAS } from "@/lib/lojas";
import { CartaoOpcao } from "./campos";
import { IconeFechar, IconeSacola } from "./icones";
import { useLojasEscolhidas } from "./lojasEscolhidas";

export function SeletorLojas() {
  const { lojas, alternar } = useLojasEscolhidas();
  const folha = useRef<HTMLDialogElement>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const tocar = (id: string) => {
    const resultado = alternar(id);
    setAviso(
      resultado === "limite"
        ? `Dá para escolher até ${MAX_LOJAS} lojas. Tire uma para escolher outra.`
        : resultado === "ultima"
          ? "Deixe pelo menos uma loja escolhida."
          : null,
    );
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
        <span className="text-texto-suave">Procurando em</span>
        {lojas.map((id) => (
          <span key={id} className="rounded-full bg-primaria-suave px-3 py-1 font-medium text-primaria-forte">
            {lojaPorId(id)?.nome}
          </span>
        ))}
        <button
          type="button"
          onClick={() => {
            setAviso(null);
            folha.current?.showModal();
          }}
          className="inline-flex items-center gap-1.5 rounded-full border border-borda bg-superficie px-3 py-1 font-medium text-texto shadow-suave transition hover:-translate-y-0.5 hover:border-destaque/50 active:translate-y-0"
        >
          <IconeSacola className="size-4 text-primaria" /> Escolher lojas
        </button>
      </div>

      <dialog
        ref={folha}
        aria-labelledby="titulo-lojas"
        onClick={(e) => {
          // tocar fora da folha fecha
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
        className="folha m-0 mt-auto max-h-[88dvh] w-full max-w-none overflow-y-auto rounded-t-[2rem] bg-fundo p-0 text-texto shadow-elevada sm:m-auto sm:max-w-2xl sm:rounded-[2rem]"
      >
        <div className="space-y-5 p-6 sm:p-8">
          <header className="flex items-start justify-between gap-4">
            <div>
              <h2 id="titulo-lojas" className="font-cursiva text-4xl leading-none text-primaria">
                Onde procurar?
              </h2>
              <p className="mt-2 text-sm text-texto-suave">
                Escolha até {MAX_LOJAS} lojas. A gente procura em todas de uma vez, para vestidos e para roupas.
              </p>
            </div>
            <button
              type="button"
              onClick={() => folha.current?.close()}
              aria-label="Fechar"
              className="grid size-10 shrink-0 place-items-center rounded-full text-texto-suave transition hover:bg-primaria-suave hover:text-texto"
            >
              <IconeFechar className="size-5" />
            </button>
          </header>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {LOJAS.map((l) => (
              <CartaoOpcao key={l.id} ativo={lojas.includes(l.id)} onClick={() => tocar(l.id)} titulo={l.nome} descricao={l.descricao} />
            ))}
          </div>

          {aviso && (
            <p role="status" className="surgir rounded-2xl bg-primaria-suave px-4 py-3 text-sm text-primaria-forte">
              {aviso}
            </p>
          )}

          <button
            type="button"
            onClick={() => folha.current?.close()}
            className="flex h-12 w-full items-center justify-center rounded-full bg-primaria px-5 font-semibold text-white shadow-elevada transition hover:bg-primaria-forte active:scale-[0.98]"
          >
            Pronto ({lojas.length} {lojas.length === 1 ? "loja" : "lojas"})
          </button>
        </div>
      </dialog>
    </>
  );
}

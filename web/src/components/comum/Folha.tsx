"use client";

/**
 * Folha (dialog) que sobe de baixo no celular e fica centralizada no desktop.
 * Mesmo visual da escolha de lojas. Usada pelo quiz de cores e pelo guia de traje.
 *
 * Abrir: folha.current?.showModal(). Fechar: botão X, tecla Esc ou tocar fora.
 */
import type { ReactNode, Ref } from "react";
import { IconeFechar } from "./icones";

interface Props {
  ref: Ref<HTMLDialogElement>;
  id: string;
  titulo: string;
  subtitulo?: ReactNode;
  children: ReactNode;
  /** Conteúdo preso no rodapé (ex.: botão principal), sempre à vista. */
  rodape?: ReactNode;
  aoFechar?: () => void;
}

export function Folha({ ref, id, titulo, subtitulo, children, rodape, aoFechar }: Props) {
  return (
    <dialog
      ref={ref}
      aria-labelledby={`titulo-${id}`}
      onClose={aoFechar}
      onClick={(e) => {
        // tocar fora da folha fecha
        if (e.target === e.currentTarget) e.currentTarget.close();
      }}
      className="folha m-0 mt-auto max-h-[88dvh] w-full max-w-none overflow-y-auto rounded-t-[2rem] bg-fundo p-0 text-texto shadow-elevada sm:m-auto sm:max-h-[90dvh] sm:max-w-2xl sm:rounded-[2rem]"
    >
      <div className="space-y-6 px-6 pt-6 sm:px-8 sm:pt-8">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h2 id={`titulo-${id}`} className="font-cursiva text-4xl leading-none text-primaria">
              {titulo}
            </h2>
            {subtitulo && <div className="mt-2 text-sm text-texto-suave">{subtitulo}</div>}
          </div>
          <button
            type="button"
            onClick={(e) => e.currentTarget.closest("dialog")?.close()}
            aria-label="Fechar"
            className="grid size-10 shrink-0 place-items-center rounded-full text-texto-suave transition hover:bg-primaria-suave hover:text-texto"
          >
            <IconeFechar className="size-5" />
          </button>
        </header>
        {children}
      </div>
      {rodape ? (
        <div className="sticky bottom-0 space-y-3 bg-linear-to-t from-fundo from-70% to-transparent px-6 pb-6 pt-6 sm:px-8 sm:pb-8">{rodape}</div>
      ) : (
        <div className="h-6 sm:h-8" />
      )}
    </dialog>
  );
}

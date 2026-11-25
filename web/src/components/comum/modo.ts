/**
 * Modo do app ("vestidos" ou "roupas").
 *
 * A fonte da verdade é o atributo data-tema do <html>:
 * - um script no <head> (ver lib/tema.ts e app/layout.tsx) lê ?modo= da URL e define o
 *   atributo ANTES da primeira pintura, então cores e flores já aparecem
 *   certas, sem "piscar";
 * - os componentes leem o modo com useModo() (useSyncExternalStore);
 * - definirModo() troca o tema, atualiza a URL (?modo=roupas) e avisa
 *   quem estiver ouvindo.
 */
import { useSyncExternalStore } from "react";
import type { Modo } from "@/lib/tipos";

export type { Modo };

/** Cor da barra do navegador em cada modo (mesmo fundo do tema). */
const COR_BARRA: Record<Modo, string> = { vestidos: "#fdf9f3", roupas: "#f2f7fc" };

const ouvintes = new Set<() => void>();
let fimTransicao: ReturnType<typeof setTimeout> | undefined;

/**
 * Quantas vezes cada modo foi "ativado" por uma troca. As flores usam esse
 * número como chave: quando muda, o conjunto é remontado e a animação de
 * crescer recomeça.
 */
let ativacoes: Record<Modo, number> = { vestidos: 0, roupas: 0 };

function ler(): Modo {
  return document.documentElement.dataset.tema === "roupas" ? "roupas" : "vestidos";
}

function assinar(ouvir: () => void) {
  ouvintes.add(ouvir);
  return () => ouvintes.delete(ouvir);
}

/** Modo atual. No servidor (e na hidratação) é sempre "vestidos". */
export function useModo(): Modo {
  return useSyncExternalStore(assinar, ler, () => "vestidos");
}

/** Número de ativações de um modo (muda a cada troca para ele). */
export function useAtivacoes(modo: Modo): number {
  return useSyncExternalStore(
    assinar,
    () => ativacoes[modo],
    () => 0,
  );
}

/** Escuta trocas de modo (para limpar resultados, cancelar buscas etc.). */
export function aoTrocarModo(ouvir: () => void): () => void {
  return assinar(ouvir);
}

/** Atualiza a cor da barra do navegador para o modo atual. */
export function sincronizarCorDaBarra() {
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", COR_BARRA[ler()]);
}

export function definirModo(modo: Modo) {
  if (ler() === modo) return;
  const html = document.documentElement;

  // transição suave de cores (~400 ms), só se a pessoa não pedir menos movimento
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    html.classList.add("trocando-tema");
    clearTimeout(fimTransicao);
    fimTransicao = setTimeout(() => html.classList.remove("trocando-tema"), 450);
  }

  html.dataset.tema = modo;
  ativacoes = { ...ativacoes, [modo]: ativacoes[modo] + 1 };
  sincronizarCorDaBarra();

  // reflete na URL (sem recarregar e sem criar entrada no histórico)
  const url = new URL(window.location.href);
  if (modo === "roupas") url.searchParams.set("modo", "roupas");
  else url.searchParams.delete("modo");
  window.history.replaceState(window.history.state, "", url);

  ouvintes.forEach((ouvir) => ouvir());
}

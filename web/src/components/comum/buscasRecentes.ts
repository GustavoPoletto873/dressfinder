/**
 * Buscas recentes, guardadas no navegador (localStorage), para refazer com um toque.
 * Cada modo mostra só as suas. No servidor (e na hidratação) a lista começa vazia.
 */
import { useSyncExternalStore } from "react";
import type { Modo } from "@/lib/tipos";

export interface BuscaRecente {
  id: string;
  modo: Modo;
  /** Valores do formulário do modo (só textos). */
  valores: Record<string, string>;
  /** Resumo curto mostrado no chip ("casamento de dia · midi · verde"). */
  rotulo: string;
  quando: number;
}

const CHAVE = "achei-o-vestido:recentes";
const MAXIMO = 8;
const VAZIO: BuscaRecente[] = [];
const ouvintes = new Set<() => void>();
let cache: BuscaRecente[] | null = null;

function valida(b: unknown): b is BuscaRecente {
  if (!b || typeof b !== "object") return false;
  const r = b as BuscaRecente;
  return (
    typeof r.id === "string" &&
    (r.modo === "vestidos" || r.modo === "roupas") &&
    typeof r.rotulo === "string" &&
    !!r.valores &&
    typeof r.valores === "object" &&
    Object.values(r.valores).every((v) => typeof v === "string")
  );
}

function ler(): BuscaRecente[] {
  if (cache) return cache;
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE) ?? "[]");
    cache = Array.isArray(salvo) ? salvo.filter(valida).slice(0, MAXIMO) : [];
  } catch {
    cache = [];
  }
  return cache;
}

function gravar(lista: BuscaRecente[]) {
  cache = lista;
  try {
    localStorage.setItem(CHAVE, JSON.stringify(lista));
  } catch {
    // armazenamento indisponível: vale só enquanto a página estiver aberta
  }
  ouvintes.forEach((o) => o());
}

function assinar(ouvir: () => void) {
  ouvintes.add(ouvir);
  return () => ouvintes.delete(ouvir);
}

/** Guarda uma busca (a mesma busca de novo só sobe para o começo). */
export function salvarRecente(modo: Modo, valores: object, partesResumo: string[]) {
  const limpos = Object.fromEntries(Object.entries(valores).filter(([, v]) => typeof v === "string")) as Record<string, string>;
  const assinatura = JSON.stringify([modo, limpos]);
  const outras = ler().filter((b) => JSON.stringify([b.modo, b.valores]) !== assinatura);
  const rotulo = partesResumo.slice(0, 4).join(" · ").slice(0, 80) || "busca";
  gravar([{ id: `${Date.now()}`, modo, valores: limpos, rotulo, quando: Date.now() }, ...outras].slice(0, MAXIMO));
}

export function removerRecente(id: string) {
  gravar(ler().filter((b) => b.id !== id));
}

export function useBuscasRecentes(): BuscaRecente[] {
  return useSyncExternalStore(assinar, ler, () => VAZIO);
}

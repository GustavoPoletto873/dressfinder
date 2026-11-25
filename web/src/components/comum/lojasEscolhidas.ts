/**
 * Lojas escolhidas pela usuária, as mesmas nos dois modos.
 * Ficam guardadas no navegador (localStorage) para a próxima visita.
 * No servidor (e na hidratação) a lista é a padrão: só a Shein.
 */
import { useSyncExternalStore } from "react";
import { LOJAS_PADRAO, MAX_LOJAS, normalizarLojas } from "@/lib/lojas";

const CHAVE = "achei-o-vestido:lojas";
const ouvintes = new Set<() => void>();
let cache: string[] | null = null;

function ler(): string[] {
  if (cache) return cache;
  try {
    cache = normalizarLojas(JSON.parse(localStorage.getItem(CHAVE) ?? "null"));
  } catch {
    cache = LOJAS_PADRAO;
  }
  return cache;
}

function gravar(lista: string[]) {
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

/** Lojas atuais (para usar fora de componentes, ex.: ao montar a busca). */
export function lojasAtuais(): string[] {
  return ler();
}

export type ResultadoAlternar = "ok" | "limite" | "ultima";

export function useLojasEscolhidas() {
  const lojas = useSyncExternalStore(assinar, ler, () => LOJAS_PADRAO);
  return {
    lojas,
    /** Liga/desliga uma loja. Não deixa ficar sem nenhuma nem passar do limite. */
    alternar(id: string): ResultadoAlternar {
      const atual = ler();
      if (atual.includes(id)) {
        if (atual.length === 1) return "ultima";
        gravar(atual.filter((l) => l !== id));
        return "ok";
      }
      if (atual.length >= MAX_LOJAS) return "limite";
      gravar([...atual, id]);
      return "ok";
    },
  };
}

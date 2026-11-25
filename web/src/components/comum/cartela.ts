/**
 * Cartela de cores da usuária (resultado do quiz), guardada no navegador.
 * A mesma para os dois modos. No servidor (e na hidratação) não há cartela.
 */
import { useSyncExternalStore } from "react";
import { CARTELAS, type Cartela, type IdCartela } from "@/lib/coloracao";

const CHAVE = "achei-o-vestido:cartela";
const ouvintes = new Set<() => void>();
let cache: { valor: Cartela | null } | null = null;

function ler(): Cartela | null {
  if (cache) return cache.valor;
  try {
    const id = localStorage.getItem(CHAVE) as IdCartela | null;
    cache = { valor: id && id in CARTELAS ? CARTELAS[id] : null };
  } catch {
    cache = { valor: null };
  }
  return cache.valor;
}

export function definirCartela(cartela: Cartela | null) {
  cache = { valor: cartela };
  try {
    if (cartela) localStorage.setItem(CHAVE, cartela.id);
    else localStorage.removeItem(CHAVE);
  } catch {
    // armazenamento indisponível: vale só enquanto a página estiver aberta
  }
  ouvintes.forEach((o) => o());
}

function assinar(ouvir: () => void) {
  ouvintes.add(ouvir);
  return () => ouvintes.delete(ouvir);
}

export function useCartela(): Cartela | null {
  return useSyncExternalStore(assinar, ler, () => null);
}

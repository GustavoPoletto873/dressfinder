/** Utilitários dos termos de busca. (Os links das lojas ficam em lib/lojas.ts.) */

/** Deixa o termo no formato de quem pesquisa: minúsculo, sem pontuação, 3 a 6 palavras. */
export function normalizarTermo(termo: string): string {
  const palavras = termo
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
  return palavras.slice(0, 6).join(" ");
}

export function contarPalavras(termo: string): number {
  return termo.split(/\s+/).filter(Boolean).length;
}

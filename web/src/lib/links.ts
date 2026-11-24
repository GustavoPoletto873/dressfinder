/** Monta os links de busca usados como plano B. */

export function linkBuscaShein(termo: string): string {
  return `https://br.shein.com/pdsearch/${encodeURIComponent(termo)}/`;
}

export function linkBuscaGoogle(termo: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(`site:br.shein.com ${termo}`)}`;
}

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

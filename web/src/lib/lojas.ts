/**
 * Lojas onde o app pode procurar. A usuária escolhe até MAX_LOJAS.
 *
 * Seleção baseada no ranking de sites de moda mais visitados no Brasil
 * (Semrush, outubro de 2026), mantendo só lojas que vendem vestidos e
 * roupas femininas (ficaram de fora lojas de esporte, tênis, calçados e óculos).
 *
 * Todas são consultadas numa ÚNICA busca do Google Imagens por termo
 * ("(site:a OR site:b) termo"), então escolher mais lojas não gasta mais
 * créditos da SerpAPI.
 *
 * Este arquivo não pode importar nada exclusivo do servidor.
 */

export interface Loja {
  id: string;
  nome: string;
  /** Frase curta mostrada no seletor. */
  descricao: string;
  /** Domínios (ou domínio + caminho) usados no "site:" da busca. */
  sites: string[];
  /** Reconhece links desta loja (hostname sem "www."). */
  host: RegExp;
  /** Reconhece páginas de produto (no caminho da URL). */
  produto: RegExp;
  /** Endereço de busca da própria loja; sem ele, a busca vai pelo Google filtrado pela loja. */
  busca?: (termo: string) => string;
}

const codificar = encodeURIComponent;

/** Busca padrão das lojas feitas na plataforma VTEX ("/termo?_q=termo&map=ft"). */
const buscaVtex = (base: string) => (termo: string) => `${base}/${codificar(termo)}?_q=${codificar(termo)}&map=ft`;

export const LOJAS: Loja[] = [
  {
    id: "shein",
    nome: "Shein",
    descricao: "moda acessível e muitas opções",
    sites: ["br.shein.com"],
    host: /(^|\.)shein\.com$/,
    produto: /-p-\d+/,
    busca: (termo) => `https://br.shein.com/pdsearch/${codificar(termo)}/`,
  },
  {
    id: "renner",
    nome: "Renner",
    descricao: "loja de departamento, de básicos a festa",
    sites: ["lojasrenner.com.br"],
    host: /(^|\.)lojasrenner\.com\.br$/,
    produto: /\/p\//,
  },
  {
    id: "cea",
    nome: "C&A",
    descricao: "básicos e tendências com bom preço",
    sites: ["cea.com.br"],
    host: /(^|\.)cea\.com\.br$/,
    produto: /\/p$/,
    busca: buscaVtex("https://www.cea.com.br"),
  },
  {
    id: "riachuelo",
    nome: "Riachuelo",
    descricao: "moda para o dia a dia",
    sites: ["riachuelo.com.br"],
    host: /(^|\.)riachuelo\.com\.br$/,
    produto: /\d{6,}/,
  },
  {
    id: "dafiti",
    nome: "Dafiti",
    descricao: "várias marcas num só lugar",
    sites: ["dafiti.com.br"],
    host: /(^|\.)dafiti\.com\.br$/,
    produto: /-\d{6,}\.html$/,
    busca: (termo) => `https://www.dafiti.com.br/catalog/?q=${codificar(termo)}`,
  },
  {
    id: "farm",
    nome: "Farm",
    descricao: "estampas e cores bem brasileiras",
    sites: ["farmrio.com.br"],
    host: /(^|\.)farmrio\.com\.br$/,
    produto: /\/p$/,
    busca: buscaVtex("https://www.farmrio.com.br"),
  },
  {
    id: "hering",
    nome: "Hering",
    descricao: "básicos de algodão e malha",
    sites: ["hering.com.br"],
    host: /(^|\.)hering\.com\.br$/,
    produto: /\/p$/,
    busca: buscaVtex("https://www.hering.com.br"),
  },
  {
    id: "torra",
    nome: "Lojas Torra",
    descricao: "preços baixos e plus size",
    sites: ["lojastorra.com.br"],
    host: /(^|\.)lojastorra\.com\.br$/,
    produto: /\/p$/,
    busca: buscaVtex("https://www.lojastorra.com.br"),
  },
  {
    id: "marisa",
    nome: "Marisa",
    descricao: "moda feminina e plus size",
    sites: ["marisa.com.br"],
    host: /(^|\.)marisa\.com\.br$/,
    produto: /\/p\/\d+/,
  },
  {
    id: "zara",
    nome: "Zara",
    descricao: "tendências internacionais",
    sites: ["zara.com/br"],
    host: /(^|\.)zara\.com$/,
    produto: /-p\d+\.html/,
    busca: (termo) => `https://www.zara.com/br/pt/search?searchTerm=${codificar(termo)}`,
  },
];

export const IDS_LOJAS = LOJAS.map((l) => l.id) as [string, ...string[]];
export const LOJAS_PADRAO = ["shein"];
/** Mais lojas que isso deixaria poucas peças de cada uma por busca. */
export const MAX_LOJAS = 4;

export function lojaPorId(id: string): Loja | undefined {
  return LOJAS.find((l) => l.id === id);
}

/** Descobre a loja de um link (ex.: página de produto vinda do Google). */
export function lojaDoLink(url: URL): Loja | undefined {
  const host = url.hostname.replace(/^(www|m)\./, "");
  return LOJAS.find((l) => l.host.test(host) && (l.id !== "zara" || url.pathname.startsWith("/br/")));
}

/** Parte "site:" da consulta: "site:a" ou "(site:a OR site:b)". */
export function filtroDeSites(ids: string[]): string {
  const sites = ids.flatMap((id) => lojaPorId(id)?.sites ?? []).map((s) => `site:${s}`);
  return sites.length > 1 ? `(${sites.join(" OR ")})` : (sites[0] ?? "");
}

export function linkGoogle(ids: string[], termo: string): string {
  return `https://www.google.com/search?q=${codificar(`${filtroDeSites(ids)} ${termo}`.trim())}`;
}

/** Link "buscar na loja": a busca da própria loja ou, sem ela, o Google filtrado pela loja. */
export function linkDaLoja(loja: Loja, termo: string): { url: string; viaGoogle: boolean } {
  return loja.busca ? { url: loja.busca(termo), viaGoogle: false } : { url: linkGoogle([loja.id], termo), viaGoogle: true };
}

/** Garante uma lista válida: ids conhecidos, sem repetição, de 1 a MAX_LOJAS. */
export function normalizarLojas(ids: unknown): string[] {
  const validos = Array.isArray(ids) ? [...new Set(ids.filter((i): i is string => typeof i === "string" && Boolean(lojaPorId(i))))] : [];
  return validos.length ? validos.slice(0, MAX_LOJAS) : LOJAS_PADRAO;
}

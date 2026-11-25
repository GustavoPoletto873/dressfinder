/**
 * Lojas onde o app pode procurar. A usuária escolhe até MAX_LOJAS.
 *
 * Seleção baseada nos sites de moda feminina mais visitados no Brasil
 * (Semrush e Similarweb, outubro/novembro de 2026), organizados em quatro
 * grupos. Ficou de fora a Privalia: é um clube fechado (as peças só aparecem
 * depois do cadastro), então nem a busca do Google nem o link funcionariam.
 *
 * Todas as lojas escolhidas são consultadas numa ÚNICA busca do Google
 * Imagens por termo ("(site:a OR site:b) termo"), então escolher mais lojas
 * não gasta mais créditos da SerpAPI.
 *
 * Este arquivo não pode importar nada exclusivo do servidor.
 */

export type GrupoLoja = "gigantes" | "varejistas" | "curadoria" | "marcas";

export const GRUPOS_LOJAS: { id: GrupoLoja; titulo: string }[] = [
  { id: "gigantes", titulo: "Gigantes e marketplaces" },
  { id: "varejistas", titulo: "Grandes varejistas" },
  { id: "curadoria", titulo: "Curadoria e luxo" },
  { id: "marcas", titulo: "Marcas femininas" },
];

export interface Loja {
  id: string;
  nome: string;
  /** Frase curta mostrada no seletor. */
  descricao: string;
  grupo: GrupoLoja;
  /** Domínios (ou domínio + caminho, ex.: "zara.com/br") usados no "site:" da busca. */
  sites: string[];
  /** Reconhece links desta loja (hostname sem "www."). */
  host: RegExp;
  /** Reconhece páginas de produto (no caminho da URL). */
  produto: RegExp;
  /** Endereço de busca da própria loja; sem ele, a busca vai pelo Google filtrado pela loja. */
  busca?: (termo: string) => string;
}

const codificar = encodeURIComponent;

/** Busca das lojas feitas na plataforma VTEX ("/s?q=termo"; conferido em nov/2026). */
const buscaVtex = (base: string) => (termo: string) => `${base}/s?q=${codificar(termo)}`;

/** Busca das lojas na plataforma Wake/Fbits ("/busca?busca=termo"). */
const buscaFbits = (base: string) => (termo: string) => `${base}/busca?busca=${codificar(termo)}`;

/** "calça jeans" → "calca-jeans" (endereços que usam o termo no caminho). */
const emSlug = (termo: string) =>
  codificar(termo.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim().replace(/\s+/g, "-"));

export const LOJAS: Loja[] = [
  // Gigantes e marketplaces
  {
    id: "shein",
    nome: "Shein",
    descricao: "moda acessível e muitas opções",
    grupo: "gigantes",
    sites: ["br.shein.com"],
    host: /(^|\.)shein\.com$/,
    produto: /-p-\d+/,
    busca: (termo) => `https://br.shein.com/pdsearch/${codificar(termo)}/`,
  },
  {
    id: "dafiti",
    nome: "Dafiti",
    descricao: "várias marcas num só lugar",
    grupo: "gigantes",
    sites: ["dafiti.com.br"],
    host: /(^|\.)dafiti\.com\.br$/,
    produto: /-\d{6,}\.html$/,
    busca: (termo) => `https://www.dafiti.com.br/catalog/?q=${codificar(termo)}`,
  },
  {
    id: "zattini",
    nome: "Zattini",
    descricao: "moda e calçados do grupo Netshoes",
    grupo: "gigantes",
    sites: ["zattini.com.br"],
    host: /(^|\.)zattini\.com\.br$/,
    produto: /^\/p\//,
    busca: (termo) => `https://www.zattini.com.br/busca/${emSlug(termo)}`,
  },
  {
    id: "zara",
    nome: "Zara",
    descricao: "tendências internacionais",
    grupo: "gigantes",
    sites: ["zara.com/br"],
    host: /(^|\.)zara\.com$/,
    produto: /-p\d+\.html/,
    busca: (termo) => `https://www.zara.com/br/pt/search?searchTerm=${codificar(termo)}`,
  },
  {
    id: "hm",
    nome: "H&M",
    descricao: "básicos e tendências da marca sueca",
    grupo: "gigantes",
    sites: ["hm.com.br"],
    host: /(^|\.)hm\.com\.br$/,
    produto: /\/p$/,
    busca: buscaVtex("https://www.hm.com.br"),
  },

  // Grandes varejistas
  {
    id: "renner",
    nome: "Renner",
    descricao: "loja de departamento, de básicos a festa",
    grupo: "varejistas",
    sites: ["lojasrenner.com.br"],
    host: /(^|\.)lojasrenner\.com\.br$/,
    produto: /\/p\//,
  },
  {
    id: "cea",
    nome: "C&A",
    descricao: "básicos e tendências com bom preço",
    grupo: "varejistas",
    sites: ["cea.com.br"],
    host: /(^|\.)cea\.com\.br$/,
    produto: /\/p$/,
    busca: buscaVtex("https://www.cea.com.br"),
  },
  {
    id: "riachuelo",
    nome: "Riachuelo",
    descricao: "moda para o dia a dia",
    grupo: "varejistas",
    sites: ["riachuelo.com.br"],
    host: /(^|\.)riachuelo\.com\.br$/,
    produto: /\d{6,}/,
  },
  {
    id: "marisa",
    nome: "Marisa",
    descricao: "moda feminina e plus size",
    grupo: "varejistas",
    sites: ["marisa.com.br"],
    host: /(^|\.)marisa\.com\.br$/,
    produto: /\/p\/\d+/,
  },
  {
    id: "hering",
    nome: "Hering",
    descricao: "básicos de algodão e malha",
    grupo: "varejistas",
    sites: ["hering.com.br"],
    host: /(^|\.)hering\.com\.br$/,
    produto: /\/p$/,
    busca: buscaVtex("https://www.hering.com.br"),
  },
  {
    id: "torra",
    nome: "Lojas Torra",
    descricao: "preços baixos e plus size",
    grupo: "varejistas",
    sites: ["lojastorra.com.br"],
    host: /(^|\.)lojastorra\.com\.br$/,
    produto: /\/p$/,
    busca: buscaVtex("https://www.lojastorra.com.br"),
  },
  {
    id: "posthaus",
    nome: "Posthaus",
    descricao: "multimarcas, forte em plus size",
    grupo: "varejistas",
    sites: ["posthaus.com.br"],
    host: /(^|\.)posthaus\.com\.br$/,
    produto: /_art\d+/,
  },

  // Curadoria e luxo
  {
    id: "oqvestir",
    nome: "OQVestir",
    descricao: "curadoria de marcas brasileiras",
    grupo: "curadoria",
    sites: ["oqvestir.com.br"],
    host: /(^|\.)oqvestir\.com\.br$/,
    produto: /-\d{6,}$/,
    busca: buscaFbits("https://www.oqvestir.com.br"),
  },
  {
    id: "shop2gether",
    nome: "Shop2gether",
    descricao: "moda contemporânea e autoral",
    grupo: "curadoria",
    sites: ["shop2gether.com.br"],
    host: /(^|\.)shop2gether\.com\.br$/,
    produto: /-\d{6,}$/,
    busca: buscaFbits("https://www.shop2gether.com.br"),
  },
  {
    id: "amaro",
    nome: "AMARO",
    descricao: "marca digital, rápida nas tendências",
    grupo: "curadoria",
    sites: ["amaro.com"],
    host: /(^|\.)amaro\.com$/,
    produto: /^\/produtos\//,
    busca: (termo) => `https://amaro.com/search/?q=${codificar(termo)}`,
  },
  {
    id: "farfetch",
    nome: "Farfetch",
    descricao: "luxo de marcas do mundo todo",
    grupo: "curadoria",
    sites: ["farfetch.com/br"],
    host: /(^|\.)farfetch\.com$/,
    produto: /-item-\d+\.aspx/,
  },

  // Marcas femininas
  {
    id: "farm",
    nome: "Farm",
    descricao: "estampas e cores bem brasileiras",
    grupo: "marcas",
    sites: ["farmrio.com.br"],
    host: /(^|\.)farmrio\.com\.br$/,
    produto: /\/p$/,
    busca: buscaVtex("https://www.farmrio.com.br"),
  },
  {
    id: "animale",
    nome: "Animale",
    descricao: "sofisticação e alfaiataria",
    grupo: "marcas",
    sites: ["animale.com.br"],
    host: /(^|\.)animale\.com\.br$/,
    produto: /\/p$/,
    busca: buscaVtex("https://www.animale.com.br"),
  },
  {
    id: "zinzane",
    nome: "Zinzane",
    descricao: "estampas e moda casual carioca",
    grupo: "marcas",
    sites: ["zinzane.com.br"],
    host: /(^|\.)zinzane\.com\.br$/,
    produto: /\/p$/,
    busca: buscaVtex("https://www.zinzane.com.br"),
  },
];

export const IDS_LOJAS = LOJAS.map((l) => l.id) as [string, ...string[]];
export const LOJAS_PADRAO = ["shein"];
/** Mais lojas que isso deixaria poucas peças de cada uma por busca. */
export const MAX_LOJAS = 4;

export function lojaPorId(id: string): Loja | undefined {
  return LOJAS.find((l) => l.id === id);
}

/** O link está dentro de um dos "sites" da loja? (ex.: "zara.com/br" só aceita caminhos que começam com /br/) */
function dentroDosSites(loja: Loja, url: URL): boolean {
  return loja.sites.some((site) => {
    const barra = site.indexOf("/");
    if (barra < 0) return true;
    const caminho = site.slice(barra);
    return url.pathname === caminho || url.pathname.startsWith(`${caminho}/`);
  });
}

/** Descobre a loja de um link (ex.: página de produto vinda do Google). */
export function lojaDoLink(url: URL): Loja | undefined {
  const host = url.hostname.replace(/^(www\d?|m)\./, "");
  return LOJAS.find((l) => l.host.test(host) && dentroDosSites(l, url));
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

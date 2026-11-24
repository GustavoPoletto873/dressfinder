/**
 * Busca anúncios da Shein no Google pela SerpAPI (https://serpapi.com).
 *
 * É uma API oficial e paga (com cota gratuita), então não sofre captcha.
 * Usamos a consulta "site:br.shein.com <termo>" e guardamos o resultado em
 * cache por 6 horas para economizar a cota.
 *
 * Observação: na Vercel o cache em memória vale por instância da função,
 * então ele ajuda mas não é garantido entre requisições.
 */
import "server-only";
import { LRUCache } from "lru-cache";
import type { Anuncio, StatusAnuncios } from "./tipos";

const SEIS_HORAS = 6 * 60 * 60 * 1000;
const TIMEOUT_MS = 10_000;
const MAX_ANUNCIOS = 10;

interface ResultadoAnuncios {
  status: StatusAnuncios;
  anuncios: Anuncio[];
}

const cache = new LRUCache<string, ResultadoAnuncios>({ max: 300, ttl: SEIS_HORAS });

export function serpApiConfigurada(): boolean {
  return Boolean(process.env.SERPAPI_KEY);
}

/** Quantos termos por pesquisa podem consultar a SerpAPI (economia de cota). */
export function maxTermosSerpApi(): number {
  const valor = Number(process.env.SERPAPI_MAX_TERMOS ?? 3);
  return Number.isFinite(valor) && valor >= 0 ? Math.floor(valor) : 3;
}

export async function buscarAnunciosNoGoogle(termo: string): Promise<ResultadoAnuncios> {
  const chave = process.env.SERPAPI_KEY;
  if (!chave) return { status: "desativado", anuncios: [] };

  const chaveCache = termo.trim().toLowerCase();
  const emCache = cache.get(chaveCache);
  if (emCache) return emCache;

  const parametros = new URLSearchParams({
    engine: "google",
    q: `site:br.shein.com ${termo}`,
    google_domain: "google.com.br",
    gl: "br",
    hl: "pt-br",
    api_key: chave,
  });

  const inicio = Date.now();
  try {
    const resposta = await fetch(`https://serpapi.com/search.json?${parametros}`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    const dados = (await resposta.json().catch(() => ({}))) as RespostaSerpApi;

    if (resposta.status === 429) {
      console.warn(`[serpapi] limite atingido: ${dados.error ?? "sem detalhes"}`);
      return { status: "cota", anuncios: [] };
    }
    if (!resposta.ok) {
      console.warn(`[serpapi] HTTP ${resposta.status} para "${termo}": ${dados.error ?? ""}`);
      return { status: "erro", anuncios: [] };
    }

    const anuncios = converterResultados(dados.organic_results ?? []);
    const resultado: ResultadoAnuncios = { status: anuncios.length ? "ok" : "vazio", anuncios };
    cache.set(chaveCache, resultado);
    console.info(
      `[serpapi] termo="${termo}" status=${resultado.status} anuncios=${anuncios.length} tempo=${((Date.now() - inicio) / 1000).toFixed(1)}s`,
    );
    return resultado;
  } catch (erro) {
    console.warn(`[serpapi] falha para "${termo}": ${(erro as Error).message}`);
    return { status: "erro", anuncios: [] };
  }
}

// ---------------------------------------------------------------------------
// Conversão da resposta da SerpAPI

interface ExtensoesDetectadas {
  price?: number;
  currency?: string;
}

interface ResultadoOrganico {
  title?: string;
  link?: string;
  snippet?: string;
  thumbnail?: string;
  rich_snippet?: {
    top?: { detected_extensions?: ExtensoesDetectadas; extensions?: string[] };
    bottom?: { detected_extensions?: ExtensoesDetectadas; extensions?: string[] };
  };
}

interface RespostaSerpApi {
  error?: string;
  organic_results?: ResultadoOrganico[];
}

const REGEX_PRECO = /R\$\s?\d{1,3}(?:\.\d{3})*(?:,\d{2})?/;

function converterPreco(texto: string): number | null {
  const numero = Number.parseFloat(texto.replace(/[^\d,]/g, "").replace(",", "."));
  return Number.isFinite(numero) && numero > 0 ? numero : null;
}

function lerPreco(item: ResultadoOrganico): { preco: string | null; precoNumero: number | null } {
  for (const parte of [item.rich_snippet?.top, item.rich_snippet?.bottom]) {
    const det = parte?.detected_extensions;
    if (det?.price && (!det.currency || /R\$|BRL/i.test(det.currency))) {
      return {
        preco: det.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
        precoNumero: det.price,
      };
    }
    const texto = parte?.extensions?.find((e) => REGEX_PRECO.test(e));
    const achado = texto?.match(REGEX_PRECO)?.[0];
    if (achado) return { preco: achado, precoNumero: converterPreco(achado) };
  }
  const noTrecho = item.snippet?.match(REGEX_PRECO)?.[0];
  if (noTrecho) return { preco: noTrecho, precoNumero: converterPreco(noTrecho) };
  return { preco: null, precoNumero: null };
}

function limparTitulo(titulo: string): string {
  let limpo = titulo
    .replace(/\s*[|\-–]\s*SHEIN.*$/i, "") // "... | SHEIN Brasil"
    .replace(/^SHEIN\s+/i, "") // "SHEIN Vestido..."
    .trim();
  if (/(\.\.\.|…)$/.test(limpo)) {
    // título cortado pelo Google: tira as reticências e o pedaço incompleto
    limpo = limpo.replace(/\s*(\.\.\.|…)$/, "");
    const traco = limpo.search(/\s[–-]\s[^–-]*$/);
    if (traco > 15) limpo = limpo.slice(0, traco); // "Vestido X – Elegância e" → "Vestido X"
    limpo = limpo.replace(/[\s,]+(e|com|de|da|do|sem|para|em|no|na|a|o)$/i, ""); // conectivo solto no fim
  }
  return limpo.trim() || titulo;
}

/** Remove ruído comum dos trechos ("Available Sizes. G2. ..."). */
function limparTrecho(trecho: string | undefined): string | null {
  if (!trecho) return null;
  const limpo = trecho
    .replace(/^Available Sizes\.\s*[^.]{0,40}\.\s*/i, "")
    .replace(/^SHEIN\s+/i, "")
    .trim();
  return limpo || null;
}

/** Roupas infantis aparecem na busca do Google; o app é para mulheres adultas. */
// (sem "bebê" de propósito: vestidos para "chá de bebê" são adultos)
const INFANTIL = /(tween|teen|toddler|little|young|baby|kids?)[-\s]?girls?|infantil|\bmeninas?\b|\bkids?\b/i;

function decodificar(texto: string): string {
  try {
    return decodeURIComponent(texto);
  } catch {
    return texto;
  }
}

function converterResultados(itens: ResultadoOrganico[]): Anuncio[] {
  const anuncios: Anuncio[] = [];
  const vistos = new Set<string>();
  for (const item of itens) {
    if (!item.link || !item.title) continue;
    let url: URL;
    try {
      url = new URL(item.link);
    } catch {
      continue;
    }
    if (!url.hostname.endsWith("shein.com")) continue;
    if (INFANTIL.test(decodificar(url.pathname)) || INFANTIL.test(item.title)) continue;
    url.hostname = "br.shein.com";
    url.protocol = "https:";
    if (vistos.has(url.pathname)) continue;
    vistos.add(url.pathname);

    const imagem = item.thumbnail?.startsWith("https://") ? item.thumbnail : null;
    anuncios.push({
      titulo: limparTitulo(item.title),
      url: url.toString(),
      imagem,
      trecho: limparTrecho(item.snippet),
      tipo: /-p-\d+/.test(url.pathname) ? "produto" : "pagina",
      ...lerPreco(item),
    });
  }
  // páginas de produto primeiro
  anuncios.sort((a, b) => Number(b.tipo === "produto") - Number(a.tipo === "produto"));
  return anuncios.slice(0, MAX_ANUNCIOS);
}

/** Exportado só para testes locais. */
export const _converterResultados = converterResultados;

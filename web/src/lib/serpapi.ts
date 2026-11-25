/**
 * Busca anúncios da Shein no Google Imagens pela SerpAPI (https://serpapi.com).
 *
 * É uma API oficial e paga (com cota gratuita), então não sofre captcha.
 * Usamos o Google Imagens com "site:br.shein.com <termo>": cada resultado já
 * vem com a FOTO do produto (servida pela própria Shein, em 750x999) e o
 * link da página dele. Custa o mesmo crédito da busca comum do Google, que
 * quase nunca trazia foto. Em troca, essa busca não traz preço.
 *
 * O resultado fica em cache por 6 horas para economizar a cota.
 * Observação: na Vercel o cache em memória vale por instância da função,
 * então ele ajuda mas não é garantido entre requisições.
 */
import "server-only";
import { LRUCache } from "lru-cache";
import type { Anuncio, StatusAnuncios } from "./tipos";

const SEIS_HORAS = 6 * 60 * 60 * 1000;
const TIMEOUT_MS = 10_000;
const MAX_ANUNCIOS = 12;
const MAX_TITULO = 120;

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

  const chaveCache = `imagens:${termo.trim().toLowerCase()}`;
  const emCache = cache.get(chaveCache);
  if (emCache) return emCache;

  const parametros = new URLSearchParams({
    engine: "google_images",
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

    const anuncios = converterResultados(dados.images_results ?? dados.image_results ?? []);
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
// Conversão da resposta da SerpAPI (Google Imagens)

interface ResultadoImagem {
  title?: string;
  /** Página onde a imagem está (a página do produto na Shein). */
  link?: string;
  /** Foto em tamanho real, no servidor de imagens da Shein. */
  original?: string;
  /** Miniatura servida pelo Google (reserva). */
  thumbnail?: string;
}

interface RespostaSerpApi {
  error?: string;
  images_results?: ResultadoImagem[];
  /** Grafia alternativa citada na documentação. */
  image_results?: ResultadoImagem[];
}

const REGEX_PRECO = /R\$\s?\d{1,3}(?:\.\d{3})*(?:,\d{2})?/;

function converterPreco(texto: string): number | null {
  const numero = Number.parseFloat(texto.replace(/[^\d,]/g, "").replace(",", "."));
  return Number.isFinite(numero) && numero > 0 ? numero : null;
}

function limparTitulo(titulo: string): string {
  let limpo = titulo
    .replace(/\s+/g, " ")
    .replace(/\s*[|\-–]\s*SHEIN.*$/i, "") // "... | SHEIN Brasil"
    .replace(/\s*[-–]\s*(Product Video|V[íi]deo( do produto)?)\s*$/i, "") // "... - Product Video"
    .replace(/^SHEIN\s+/i, "") // "SHEIN Vestido..."
    .trim();
  const cortado = /(\.\.\.|…|,)$/.test(limpo) || limpo.length > MAX_TITULO;
  if (cortado) {
    // título cortado pelo Google ou longo demais: termina numa palavra inteira, sem pontuação solta
    limpo = limpo.replace(/\s*(\.\.\.|…)$/, "");
    if (limpo.length > MAX_TITULO) limpo = limpo.slice(0, MAX_TITULO).replace(/\s+\S*$/, "");
    const traco = limpo.search(/\s[–-]\s[^–-]*$/);
    if (traco > 15) limpo = limpo.slice(0, traco); // "Vestido X – Elegância e" → "Vestido X"
    limpo = limpo
      .replace(/[\s,;:]+$/, "")
      .replace(/[\s,]+(e|com|de|da|do|sem|para|em|no|na|a|o)$/i, ""); // conectivo solto no fim
  }
  return limpo.trim() || titulo;
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

function urlHttps(valor: string | undefined): string | null {
  if (!valor) return null;
  try {
    const url = new URL(valor);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function converterResultados(itens: ResultadoImagem[]): Anuncio[] {
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
    url.search = "";
    if (vistos.has(url.pathname)) continue;

    // foto principal: a da Shein; reserva: a miniatura do Google
    const original = urlHttps(item.original);
    const miniatura = urlHttps(item.thumbnail);
    const imagem = original ?? miniatura;
    if (!imagem) continue; // a ideia aqui é sempre ter foto
    vistos.add(url.pathname);

    const preco = item.title.match(REGEX_PRECO)?.[0] ?? null;
    anuncios.push({
      titulo: limparTitulo(item.title),
      url: url.toString(),
      imagem,
      imagemReserva: miniatura && miniatura !== imagem ? miniatura : null,
      trecho: null,
      tipo: /-p-\d+/.test(url.pathname) ? "produto" : "pagina",
      preco,
      precoNumero: preco ? converterPreco(preco) : null,
    });
  }
  // páginas de produto primeiro
  anuncios.sort((a, b) => Number(b.tipo === "produto") - Number(a.tipo === "produto"));
  return anuncios.slice(0, MAX_ANUNCIOS);
}

/** Exportados só para testes locais. */
export const _converterResultados = converterResultados;
export const _limparTitulo = limparTitulo;

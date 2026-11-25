/**
 * Busca anúncios das lojas escolhidas no Google Imagens pela SerpAPI (https://serpapi.com).
 *
 * É uma API oficial e paga (com cota gratuita), então não sofre captcha.
 * Usamos o Google Imagens com "(site:loja1 OR site:loja2 ...) <termo>": numa
 * ÚNICA busca (1 crédito) vêm produtos de todas as lojas escolhidas, cada um
 * com a FOTO (servida pela própria loja) e o link da página. Essa busca não
 * traz preço.
 *
 * O resultado fica em cache por 6 horas para economizar a cota.
 * Observação: na Vercel o cache em memória vale por instância da função,
 * então ele ajuda mas não é garantido entre requisições.
 */
import "server-only";
import { LRUCache } from "lru-cache";
import { filtroDeSites, lojaDoLink } from "./lojas";
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

/**
 * @param lojas ids das lojas escolhidas (ver lib/lojas.ts)
 * @param excluir descarta resultados cujo título/link combine (ex.: /masculin/ para público feminino)
 */
export async function buscarAnunciosNoGoogle(termo: string, lojas: string[], excluir?: RegExp): Promise<ResultadoAnuncios> {
  const chave = process.env.SERPAPI_KEY;
  if (!chave) return { status: "desativado", anuncios: [] };

  const chaveCache = `imagens:${[...lojas].sort().join(",")}:${excluir?.source ?? ""}:${termo.trim().toLowerCase()}`;
  const emCache = cache.get(chaveCache);
  if (emCache) return emCache;

  const parametros = new URLSearchParams({
    engine: "google_images",
    q: `${filtroDeSites(lojas)} ${termo}`,
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

    const anuncios = converterResultados(dados.images_results ?? dados.image_results ?? [], lojas, excluir);
    const resultado: ResultadoAnuncios = { status: anuncios.length ? "ok" : "vazio", anuncios };
    cache.set(chaveCache, resultado);
    const porLoja = anuncios.reduce<Record<string, number>>((m, a) => ((m[a.loja] = (m[a.loja] ?? 0) + 1), m), {});
    console.info(
      `[serpapi] termo="${termo}" lojas=${lojas.join(",")} status=${resultado.status} anuncios=${anuncios.length} ${JSON.stringify(porLoja)} tempo=${((Date.now() - inicio) / 1000).toFixed(1)}s`,
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

/** Nomes de loja que aparecem como "assinatura" nos títulos ("... | Marisa", "Riachuelo | ..."). */
const ASSINATURA_LOJA =
  /^(shein( brasil)?|lojas renner|renner|c&a|cea|riachuelo|dafiti|farm( rio)?|hering|lojas torra|torra|marisa|zara( brasil)?|zattini|h&m( brasil)?|posthaus|oqvestir|shop2gether|amaro|farfetch|animale|zinzane|compre online)$/i;

function limparTitulo(titulo: string): string {
  // "Riachuelo | Vestido midi godê - Verde | Pool" → fica o pedaço mais longo que não é o nome da loja
  const partes = titulo.replace(/\s+/g, " ").split(/\s\|\s/).map((p) => p.trim()).filter((p) => p && !ASSINATURA_LOJA.test(p));
  const principal = partes.sort((a, b) => b.length - a.length)[0] ?? titulo;
  let limpo = principal
    .replace(/\s+[-–]\s+([^-–]+)$/, (trecho, fim: string) => (ASSINATURA_LOJA.test(fim.trim()) ? "" : trecho)) // "... - Marisa"
    .replace(/\s+[-–]\s+(Size|Tamanho):?\s*\S+$/i, "") // "... - Size: M" (H&M)
    .replace(/\s+[-–]\s+(PP|P|M|G|GG|XG|EG|U|\d{2})$/, "") // "... - PP", "... - 40"
    .replace(/^(Ladies|Women|Mulher)\s+[-–]\s+/i, "") // "Ladies - Vestido..." (H&M)
    .replace(/\s*[|\-–]\s*SHEIN.*$/i, "") // "... - SHEIN Brasil"
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
  limpo = limpo.replace(/\s+Cor:.*$/i, "").trim() || titulo; // "... B79 Cor:;Tamanho:Unico"
  if (!/\s/.test(limpo) && limpo.includes("-")) limpo = limpo.replace(/-+/g, " "); // "VESTIDO-POLO-TRICOT"
  const letras = limpo.replace(/[^\p{L}]/gu, "");
  if (letras.length > 8 && letras === letras.toUpperCase()) limpo = limpo.toLocaleLowerCase("pt-BR"); // TUDO EM CAIXA ALTA
  // algumas lojas (ex.: C&A) mandam o título todo em minúsculas
  return limpo.charAt(0).toLocaleUpperCase("pt-BR") + limpo.slice(1);
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

/**
 * Converte os resultados do Google Imagens em anúncios.
 * - só aceita links das lojas escolhidas;
 * - descarta roupa infantil e, se pedido, o que não for do público (ex.: masculino);
 * - intercala as lojas (uma de cada vez) para nenhuma dominar a lista.
 */
function converterResultados(itens: ResultadoImagem[], lojas: string[], excluir?: RegExp): Anuncio[] {
  const porLoja = new Map<string, Anuncio[]>(lojas.map((id) => [id, []]));
  const vistos = new Set<string>();
  for (const item of itens) {
    if (!item.link || !item.title) continue;
    let url: URL;
    try {
      url = new URL(item.link);
    } catch {
      continue;
    }
    const loja = lojaDoLink(url);
    if (!loja || !porLoja.has(loja.id)) continue;
    if (/\/blog\//i.test(url.pathname)) continue; // posts de blog não são peças (ex.: AMARO)
    const textoBusca = `${decodificar(url.pathname)} ${item.title}`;
    if (INFANTIL.test(textoBusca) || (excluir && excluir.test(textoBusca))) continue;
    url.protocol = "https:";
    url.hostname = loja.id === "shein" ? "br.shein.com" : url.hostname.replace(/^m\./, "www.");
    url.search = ""; // tira parâmetros de rastreio (ex.: srsltid do Google)
    if (vistos.has(url.hostname + url.pathname)) continue;

    // foto principal: a da loja; reserva: a miniatura do Google
    const original = urlHttps(item.original);
    const miniatura = urlHttps(item.thumbnail);
    const imagem = original ?? miniatura;
    if (!imagem) continue; // a ideia aqui é sempre ter foto
    vistos.add(url.hostname + url.pathname);

    const preco = item.title.match(REGEX_PRECO)?.[0] ?? null;
    porLoja.get(loja.id)!.push({
      loja: loja.id,
      titulo: limparTitulo(item.title),
      url: url.toString(),
      imagem,
      imagemReserva: miniatura && miniatura !== imagem ? miniatura : null,
      trecho: null,
      tipo: loja.produto.test(url.pathname) ? "produto" : "pagina",
      preco,
      precoNumero: preco ? converterPreco(preco) : null,
    });
  }

  // em cada loja, páginas de produto primeiro; depois uma de cada loja, em rodízio
  const filas = [...porLoja.values()].map((lista) =>
    lista.sort((a, b) => Number(b.tipo === "produto") - Number(a.tipo === "produto")),
  );
  const anuncios: Anuncio[] = [];
  while (anuncios.length < MAX_ANUNCIOS && filas.some((f) => f.length)) {
    for (const fila of filas) {
      const proximo = fila.shift();
      if (proximo && anuncios.length < MAX_ANUNCIOS) anuncios.push(proximo);
    }
  }
  return anuncios;
}

/** Exportados só para testes locais. */
export const _converterResultados = converterResultados;
export const _limparTitulo = limparTitulo;

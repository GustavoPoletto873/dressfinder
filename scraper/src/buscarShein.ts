/**
 * Busca produtos na Shein Brasil para um termo.
 *
 * 1. Abre a página de busca num contexto novo do navegador.
 * 2. Estratégia principal: intercepta as respostas JSON que o próprio site
 *    carrega e procura listas de produtos nelas.
 * 3. Estratégia secundária: lê dados embutidos na página (variáveis globais)
 *    e, por fim, o DOM dos cards de produto.
 * 4. Se aparecer captcha/verificação (ou a página vier vazia de forma
 *    suspeita), devolve "bloqueado" na hora. Não tentamos contornar bloqueios.
 */
import type { BrowserContext, Page } from "playwright";
import { obterNavegador } from "./navegador.js";
import {
  ORIGEM_SHEIN,
  converterPreco,
  deduplicar,
  extrairProdutosDeJson,
  normalizarImagem,
  normalizarUrlProduto,
  pareceBloqueio,
  pareceSemResultados,
} from "./extracao.js";
import type { OrigemDados, Produto, StatusBusca } from "./tipos.js";

const TIPOS_BLOQUEADOS = new Set(["image", "media", "font"]);
/** Quanto esperar por mais produtos depois de achar os primeiros. */
const ESPERA_EXTRA_MS = 1_200;

export interface ResultadoInterno {
  status: StatusBusca;
  produtos: Produto[];
  origem: OrigemDados;
  detalhe?: string;
}

export function urlBuscaShein(termo: string): string {
  return `${ORIGEM_SHEIN}/pdsearch/${encodeURIComponent(termo)}/`;
}

export async function buscarNaShein(termo: string, limite: number, timeoutMs: number): Promise<ResultadoInterno> {
  const navegador = await obterNavegador();
  const contexto = await navegador.newContext({
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
    viewport: { width: 1366, height: 900 },
  });

  // o tempo total da busca é limitado; ao estourar, o contexto é fechado
  let temporizador: NodeJS.Timeout | undefined;
  const estouro = new Promise<ResultadoInterno>((resolver) => {
    temporizador = setTimeout(
      () => resolver({ status: "erro", produtos: [], origem: "nenhuma", detalhe: "tempo esgotado" }),
      timeoutMs,
    );
  });

  const tarefa = executar(contexto, termo, limite, Date.now() + timeoutMs - 500);
  // se o tempo estourar, a tarefa falha quando o contexto fecha: evita rejeição não tratada
  tarefa.catch(() => undefined);

  try {
    return await Promise.race([tarefa, estouro]);
  } finally {
    clearTimeout(temporizador);
    await contexto.close().catch(() => undefined);
  }
}

async function executar(contexto: BrowserContext, termo: string, limite: number, prazo: number): Promise<ResultadoInterno> {
  // não baixa imagens, vídeos e fontes: a URL da imagem vem do JSON/DOM
  await contexto.route("**/*", (rota) =>
    TIPOS_BLOQUEADOS.has(rota.request().resourceType()) ? rota.abort() : rota.continue(),
  );

  const pagina = await contexto.newPage();
  const doJson: Produto[] = [];
  let bloqueado = false;
  let listaVaziaRecebida = false;

  pagina.on("framenavigated", (frame) => {
    if (frame === pagina.mainFrame() && pareceBloqueio(frame.url())) bloqueado = true;
  });

  pagina.on("response", async (resposta) => {
    const tipo = resposta.headers()["content-type"] ?? "";
    if (!tipo.includes("json")) return;
    const url = resposta.url();
    try {
      const corpo = await resposta.text();
      if (/\/risk\//.test(url) && /anti_crawler|captcha/i.test(corpo) && /challenge|captcha_type/i.test(corpo)) {
        bloqueado = true;
      }
      const json: unknown = JSON.parse(corpo);
      const produtos = extrairProdutosDeJson(json);
      if (produtos.length) doJson.push(...produtos);
      else if (/product|goods|search/i.test(url) && /"(products|goods)"\s*:\s*\[\s*\]/.test(corpo)) {
        listaVaziaRecebida = true;
      }
    } catch {
      // resposta sem corpo legível ou JSON inválido: ignora
    }
  });

  try {
    await pagina.goto(urlBuscaShein(termo), {
      waitUntil: "domcontentloaded",
      timeout: Math.max(1_000, prazo - Date.now()),
    });
  } catch (erro) {
    if (bloqueado) return { status: "bloqueado", produtos: [], origem: "nenhuma" };
    throw erro;
  }

  // aguarda até: bloqueio, produtos suficientes, ou fim do prazo
  let primeiroAchadoEm: number | null = null;
  while (Date.now() < prazo) {
    if (bloqueado || pareceBloqueio(pagina.url())) {
      return { status: "bloqueado", produtos: [], origem: "nenhuma", detalhe: pagina.url() };
    }
    if (doJson.length) {
      primeiroAchadoEm ??= Date.now();
      if (doJson.length >= limite || Date.now() - primeiroAchadoEm > ESPERA_EXTRA_MS) break;
    }
    if (listaVaziaRecebida) break;
    if (await temCardsNoDom(pagina)) break;
    await pagina.waitForTimeout(400);
  }

  if (doJson.length) {
    return { status: "ok", produtos: deduplicar(doJson).slice(0, limite), origem: "json" };
  }

  // estratégia secundária 1: dados embutidos em variáveis globais da página
  const embutidos = await lerDadosEmbutidos(pagina);
  if (embutidos.length) {
    return { status: "ok", produtos: deduplicar(embutidos).slice(0, limite), origem: "embutido" };
  }

  // estratégia secundária 2: cards no DOM
  const doDom = await extrairDoDom(pagina);
  if (doDom.length) {
    return { status: "ok", produtos: deduplicar(doDom).slice(0, limite), origem: "dom" };
  }

  const html = await pagina.content().catch(() => "");
  if (pareceBloqueio(pagina.url(), html)) return { status: "bloqueado", produtos: [], origem: "nenhuma" };
  if (listaVaziaRecebida || pareceSemResultados(html)) return { status: "vazio", produtos: [], origem: "nenhuma" };
  // nenhum produto e nenhuma mensagem de "sem resultados": tratamos como bloqueio silencioso
  return { status: "bloqueado", produtos: [], origem: "nenhuma", detalhe: "página sem produtos" };
}

async function temCardsNoDom(pagina: Page): Promise<boolean> {
  return pagina
    .evaluate(() => document.querySelectorAll('a[href*="-p-"]').length >= 4)
    .catch(() => false);
}

async function lerDadosEmbutidos(pagina: Page): Promise<Produto[]> {
  const dados = await pagina
    .evaluate(() => {
      const w = window as unknown as Record<string, unknown>;
      const nomes = ["gbRawData", "gbProductListSsrData", "__INITIAL_STATE__", "__NUXT__", "__NEXT_DATA__"];
      const encontrados: unknown[] = [];
      for (const nome of nomes) {
        try {
          if (w[nome]) encontrados.push(JSON.parse(JSON.stringify(w[nome])));
        } catch {
          // estrutura não serializável
        }
      }
      return encontrados;
    })
    .catch(() => [] as unknown[]);
  return dados.flatMap((d) => extrairProdutosDeJson(d));
}

interface CardBruto {
  href: string;
  titulo: string;
  imagem: string | null;
  preco: string | null;
}

async function extrairDoDom(pagina: Page): Promise<Produto[]> {
  const cards = await pagina
    .evaluate((): CardBruto[] => {
      const resultado: CardBruto[] = [];
      const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href*="-p-"]'));
      for (const link of links) {
        if (!/-p-\d+/.test(link.href)) continue;
        const card =
          link.closest<HTMLElement>('section, li, [class*="product-card"], [class*="product-item"], [class*="goods"]') ??
          link.parentElement ??
          link;
        const img = card.querySelector("img");
        const imagem =
          img?.getAttribute("data-src") ?? img?.getAttribute("data-original") ?? img?.getAttribute("src") ?? null;
        const titulo =
          link.getAttribute("aria-label") ?? link.getAttribute("title") ?? img?.getAttribute("alt") ?? link.textContent ?? "";
        const preco = (card.textContent ?? "").match(/R\$\s?[\d.]+,\d{2}/)?.[0] ?? null;
        resultado.push({ href: link.href, titulo: titulo.trim(), imagem, preco });
      }
      return resultado;
    })
    .catch(() => [] as CardBruto[]);

  const produtos: Produto[] = [];
  for (const card of cards) {
    const url = normalizarUrlProduto(card.href);
    if (!url || !card.titulo) continue;
    produtos.push({
      titulo: card.titulo,
      url,
      imagem: normalizarImagem(card.imagem),
      preco: card.preco,
      precoNumero: converterPreco(card.preco),
    });
  }
  return produtos;
}

/**
 * POST /api/buscar
 *
 * 1. Valida a entrada (zod): um formulário por modo ("vestidos" ou "roupas").
 * 2. Gera 5 a 8 buscas (Claude com o prompt do modo; se falhar, regras do modo).
 * 3. Monta os links de busca de cada loja escolhida e do Google (sempre disponíveis).
 * 4. Se a Shein estiver entre as lojas, consulta o scraper em paralelo, com timeout total de 25 s.
 * 5. Consulta o Google Imagens via SerpAPI (1 busca por termo cobre todas as lojas escolhidas).
 * 6. Filtra pela faixa de preço e devolve tudo.
 */
import { NextResponse, type NextRequest } from "next/server";
import { limiteExcedido } from "@/lib/limiteTaxa";
import { linkDaLoja, linkGoogle, lojaPorId } from "@/lib/lojas";
import { buscarNoScraper } from "@/lib/scraper";
import { buscarAnunciosNoGoogle, maxTermosSerpApi, serpApiConfigurada } from "@/lib/serpapi";
import { gerarBuscas } from "@/lib/termosIA";
import {
  esquemaEntrada,
  type Anuncio,
  type Entrada,
  type Produto,
  type RespostaBusca,
  type ResultadoBusca,
} from "@/lib/tipos";

// IA (~10 s) + scraper (até 25 s) + Google (até 10 s)
export const maxDuration = 60;

const TIMEOUT_SCRAPER_MS = 25_000;

function dentroDaFaixa<T extends { precoNumero: number | null }>(itens: T[], entrada: Entrada): T[] {
  const { precoMin, precoMax } = entrada;
  return itens.filter((item) => {
    if (item.precoNumero === null) return true; // sem preço: mantém
    if (precoMin !== undefined && item.precoNumero < precoMin) return false;
    if (precoMax !== undefined && item.precoNumero > precoMax) return false;
    return true;
  });
}

/** No modo Roupas, o público escolhido filtra o que não é para ele (ex.: peças masculinas para quem pediu feminino). */
function filtroDePublico(entrada: Entrada): RegExp | undefined {
  if (entrada.modo !== "roupas") return undefined;
  if (entrada.publico === "feminino" || entrada.publico === "plus size") return /masculin/i;
  if (entrada.publico === "masculino") return /feminin/i;
  return undefined;
}

function ipDaRequisicao(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
}

export async function POST(req: NextRequest) {
  if (limiteExcedido(ipDaRequisicao(req))) {
    return NextResponse.json(
      { erro: "Muitas buscas em pouco tempo. Espere um minuto e tente de novo." },
      { status: 429 },
    );
  }

  const corpo = await req.json().catch(() => null);
  const validacao = esquemaEntrada.safeParse(corpo);
  if (!validacao.success) {
    return NextResponse.json(
      { erro: "Confira os campos do formulário.", detalhes: validacao.error.issues.map((i) => i.message) },
      { status: 400 },
    );
  }
  const entrada = validacao.data;
  const inicio = Date.now();

  // 2. buscas sugeridas
  const { buscas, origem } = await gerarBuscas(entrada);

  // 3 e 4. scraper (só existe para a Shein) em paralelo, com um único prazo para todas as buscas
  const { lojas } = entrada;
  const comShein = lojas.includes("shein");
  const controle = new AbortController();
  const temporizador = setTimeout(() => controle.abort(), TIMEOUT_SCRAPER_MS);
  const doScraper = await Promise.allSettled(
    buscas.map((b) => (comShein ? buscarNoScraper(b.termo, controle.signal) : Promise.resolve({ status: "desativado" as const, produtos: [] as Produto[] }))),
  );
  clearTimeout(temporizador);

  const resultados: ResultadoBusca[] = buscas.map((busca, i) => {
    const r = doScraper[i];
    const scraper = r?.status === "fulfilled" ? r.value : { status: "erro" as const, produtos: [] as Produto[] };
    return {
      ...busca,
      links: lojas.map((id) => {
        const loja = lojaPorId(id)!;
        return { loja: id, nome: loja.nome, ...linkDaLoja(loja, busca.termo) };
      }),
      linkGoogle: linkGoogle(lojas, busca.termo),
      status: scraper.status,
      produtos: dentroDaFaixa(scraper.produtos, entrada),
      statusAnuncios: serpApiConfigurada() ? "pulado" : "desativado",
      anuncios: [] as Anuncio[],
    };
  });

  // 5. Google Imagens (SerpAPI): 1 busca por termo cobre todas as lojas escolhidas.
  //    Com só a Shein, vai apenas para os termos em que o scraper não trouxe produtos.
  if (serpApiConfigurada()) {
    const outrasLojas = lojas.some((id) => id !== "shein");
    const precisam = resultados.filter((r) => outrasLojas || r.produtos.length === 0).slice(0, maxTermosSerpApi());
    const excluir = filtroDePublico(entrada);
    const doGoogle = await Promise.allSettled(precisam.map((r) => buscarAnunciosNoGoogle(r.termo, lojas, excluir)));
    precisam.forEach((resultado, i) => {
      const g = doGoogle[i];
      if (g?.status === "fulfilled") {
        resultado.statusAnuncios = g.value.status;
        resultado.anuncios = dentroDaFaixa(g.value.anuncios, entrada);
      } else {
        resultado.statusAnuncios = "erro";
      }
    });
  }

  const resposta: RespostaBusca = {
    buscas: resultados,
    origemTermos: origem,
    totalProdutos: resultados.reduce((s, r) => s + r.produtos.length, 0),
    totalAnuncios: resultados.reduce((s, r) => s + r.anuncios.length, 0),
  };

  const pedido =
    entrada.modo === "roupas"
      ? `peca="${entrada.tipoPeca === "outra" ? entrada.tipoOutro : entrada.tipoPeca}" publico="${entrada.publico ?? ""}"`
      : `ocasiao="${entrada.ocasiao}"`;
  console.info(
    `[buscar] modo=${entrada.modo} lojas=${lojas.join(",")} ${pedido} buscas=${resultados.length} origem=${origem} ` +
      `scraper=[${resultados.map((r) => r.status).join(",")}] produtos=${resposta.totalProdutos} ` +
      `anuncios=${resposta.totalAnuncios} tempo=${((Date.now() - inicio) / 1000).toFixed(1)}s`,
  );

  return NextResponse.json(resposta);
}

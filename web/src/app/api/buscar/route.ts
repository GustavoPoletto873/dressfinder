/**
 * POST /api/buscar
 *
 * 1. Valida a entrada (zod).
 * 2. Gera 5 a 8 buscas (Claude; se falhar, regras locais).
 * 3. Monta os links de busca da Shein e do Google (sempre disponíveis).
 * 4. Consulta o scraper em paralelo, com timeout total de 25 s.
 * 5. Para as buscas que ficaram sem produtos, consulta o Google via SerpAPI.
 * 6. Filtra pela faixa de preço e devolve tudo.
 */
import { NextResponse, type NextRequest } from "next/server";
import { limiteExcedido } from "@/lib/limiteTaxa";
import { linkBuscaGoogle, linkBuscaShein } from "@/lib/links";
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

  // 3 e 4. scraper em paralelo, com um único prazo para todas as buscas
  const controle = new AbortController();
  const temporizador = setTimeout(() => controle.abort(), TIMEOUT_SCRAPER_MS);
  const doScraper = await Promise.allSettled(buscas.map((b) => buscarNoScraper(b.termo, controle.signal)));
  clearTimeout(temporizador);

  const resultados: ResultadoBusca[] = buscas.map((busca, i) => {
    const r = doScraper[i];
    const scraper = r?.status === "fulfilled" ? r.value : { status: "erro" as const, produtos: [] as Produto[] };
    return {
      ...busca,
      linkShein: linkBuscaShein(busca.termo),
      linkGoogle: linkBuscaGoogle(busca.termo),
      status: scraper.status,
      produtos: dentroDaFaixa(scraper.produtos, entrada),
      statusAnuncios: serpApiConfigurada() ? "pulado" : "desativado",
      anuncios: [] as Anuncio[],
    };
  });

  // 5. Google (SerpAPI) só para as buscas sem produtos, até o limite configurado
  if (serpApiConfigurada()) {
    const semProdutos = resultados.filter((r) => r.produtos.length === 0).slice(0, maxTermosSerpApi());
    const doGoogle = await Promise.allSettled(semProdutos.map((r) => buscarAnunciosNoGoogle(r.termo)));
    semProdutos.forEach((resultado, i) => {
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

  console.info(
    `[buscar] ocasiao="${entrada.ocasiao}" buscas=${resultados.length} origem=${origem} ` +
      `scraper=[${resultados.map((r) => r.status).join(",")}] produtos=${resposta.totalProdutos} ` +
      `anuncios=${resposta.totalAnuncios} tempo=${((Date.now() - inicio) / 1000).toFixed(1)}s`,
  );

  return NextResponse.json(resposta);
}

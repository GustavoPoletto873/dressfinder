/**
 * Link curto do "Qual eu levo?".
 *
 * POST /api/escolhas      { v, n?, p: [...] } → { id }   (guarda as peças por 90 dias)
 * GET  /api/escolhas?id=… → { v, n?, p: [...] }          (as peças guardadas)
 *
 * Só aceita peças de lojas do catálogo (mesma regra do link longo).
 * Sem banco configurado, o POST responde 503 e o app usa o link longo.
 */
import { NextResponse, type NextRequest } from "next/server";
import { FORMATO_CODIGO, montarDados, validarEscolha } from "@/lib/compartilhar";
import { guardarEscolha, lerEscolha, linksCurtosAtivos } from "@/lib/escolhasGuardadas";
import { limiteExcedido } from "@/lib/limiteTaxa";

const MAX_CORPO = 8_000;

function ipDaRequisicao(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
}

export async function POST(req: NextRequest) {
  if (!linksCurtosAtivos()) return NextResponse.json({ erro: "Links curtos desativados" }, { status: 503 });
  if (limiteExcedido(ipDaRequisicao(req), "escolhas", 30)) {
    return NextResponse.json({ erro: "Muitos links em pouco tempo. Espere um minuto." }, { status: 429 });
  }
  const texto = await req.text();
  if (texto.length > MAX_CORPO) return NextResponse.json({ erro: "Escolha grande demais" }, { status: 413 });

  let escolha;
  try {
    escolha = validarEscolha(JSON.parse(texto));
  } catch {
    escolha = null;
  }
  if (!escolha) return NextResponse.json({ erro: "Peças inválidas" }, { status: 400 });

  try {
    // guarda a versão conferida (links normalizados), não o que chegou
    const id = await guardarEscolha(montarDados(escolha.pecas, escolha.nome));
    return NextResponse.json({ id });
  } catch (erro) {
    console.warn(`[escolhas] falha ao guardar: ${(erro as Error).message}`);
    return NextResponse.json({ erro: "Não foi possível guardar agora" }, { status: 502 });
  }
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id") ?? "";
  if (!FORMATO_CODIGO.test(id)) return NextResponse.json({ erro: "Código inválido" }, { status: 400 });
  if (!linksCurtosAtivos()) return NextResponse.json({ erro: "Links curtos desativados" }, { status: 503 });
  try {
    const dados = await lerEscolha(id);
    if (!dados) return NextResponse.json({ erro: "Esse link expirou ou não existe" }, { status: 404 });
    // o conteúdo de um código nunca muda: pode ficar em cache por um tempo
    return NextResponse.json(dados, { headers: { "Cache-Control": "public, max-age=300" } });
  } catch (erro) {
    console.warn(`[escolhas] falha ao ler: ${(erro as Error).message}`);
    return NextResponse.json({ erro: "Não foi possível abrir agora" }, { status: 502 });
  }
}

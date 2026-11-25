/**
 * "Qual eu levo?": as peças escolhidas viajam dentro do próprio link
 * (depois do #, que nem chega ao servidor). Sem banco de dados.
 *
 * Formato: /qual-eu-levo#d=<dados>, onde <dados> é o JSON comprimido
 * (deflate) em base64url ("z." no começo) ou, se o navegador não tiver
 * CompressionStream, o JSON só em base64url ("j.").
 *
 * Segurança: ao abrir, só aceitamos links https de lojas do catálogo
 * (lib/lojas.ts) e fotos https. Assim o link não serve para levar alguém
 * a um site falso usando o nome do app.
 */
import { z } from "zod";
import { lojaDoLink } from "./lojas";

export const MIN_PECAS = 2;
export const MAX_PECAS = 4;

export interface PecaCompartilhada {
  url: string;
  titulo: string;
  imagem: string | null;
  preco: string | null;
  /** Id da loja (lib/lojas.ts). */
  loja: string;
}

/** Formato curto que vai no link. */
const esquemaLink = z.object({
  v: z.literal(1),
  n: z.string().trim().max(30).optional(),
  p: z
    .array(
      z.object({
        u: z.string().max(600),
        t: z.string().max(200),
        i: z.string().max(800).nullable().optional(),
        r: z.string().max(30).nullable().optional(),
      }),
    )
    .min(MIN_PECAS)
    .max(MAX_PECAS),
});

function https(valor: string | null | undefined): URL | null {
  if (!valor) return null;
  try {
    const url = new URL(valor);
    return url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

/** Converte um favorito em peça compartilhável (null se não for de uma loja conhecida). */
export function pecaDoFavorito(f: { url: string; titulo: string; imagem: string | null; preco: string | null }): PecaCompartilhada | null {
  const url = https(f.url);
  const loja = url ? lojaDoLink(url) : undefined;
  if (!url || !loja) return null;
  return { url: url.toString(), titulo: f.titulo.slice(0, 200), imagem: https(f.imagem)?.toString() ?? null, preco: f.preco, loja: loja.id };
}

// ---------------------------------------------------------------------------
// base64url e compressão (navegador)

function paraBase64Url(bytes: Uint8Array): string {
  let binario = "";
  bytes.forEach((b) => (binario += String.fromCharCode(b)));
  return btoa(binario).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function deBase64Url(texto: string): Uint8Array {
  const base64 = texto.replace(/-/g, "+").replace(/_/g, "/");
  const binario = atob(base64 + "=".repeat((4 - (base64.length % 4)) % 4));
  return Uint8Array.from(binario, (c) => c.charCodeAt(0));
}

async function transformar(bytes: Uint8Array, fluxo: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const resposta = new Response(new Blob([bytes as BlobPart]).stream().pipeThrough(fluxo));
  return new Uint8Array(await resposta.arrayBuffer());
}

const temCompressao = () => typeof CompressionStream !== "undefined" && typeof DecompressionStream !== "undefined";

/** Monta o trecho depois do "#". */
export async function codificarEscolha(pecas: PecaCompartilhada[], nome?: string): Promise<string> {
  const dados = {
    v: 1,
    ...(nome?.trim() ? { n: nome.trim().slice(0, 30) } : {}),
    p: pecas.slice(0, MAX_PECAS).map((p) => ({ u: p.url, t: p.titulo, i: p.imagem, r: p.preco })),
  };
  const json = new TextEncoder().encode(JSON.stringify(dados));
  if (temCompressao()) return `d=z.${paraBase64Url(await transformar(json, new CompressionStream("deflate")))}`;
  return `d=j.${paraBase64Url(json)}`;
}

export interface EscolhaAberta {
  nome?: string;
  pecas: PecaCompartilhada[];
}

/** Lê o trecho depois do "#". Devolve null se o link estiver quebrado ou não for confiável. */
export async function decodificarEscolha(hash: string): Promise<EscolhaAberta | null> {
  const valor = new URLSearchParams(hash.replace(/^#/, "")).get("d");
  if (!valor || valor.length > 8000) return null;
  try {
    const [tipo, corpo] = [valor.slice(0, 2), valor.slice(2)];
    let bytes = deBase64Url(corpo);
    if (tipo === "z.") {
      if (!temCompressao()) return null;
      bytes = await transformar(bytes, new DecompressionStream("deflate"));
    } else if (tipo !== "j.") {
      return null;
    }
    const dados = esquemaLink.safeParse(JSON.parse(new TextDecoder().decode(bytes)));
    if (!dados.success) return null;
    const pecas = dados.data.p
      .map((p) => pecaDoFavorito({ url: p.u, titulo: p.t, imagem: p.i ?? null, preco: p.r ?? null }))
      .filter((p): p is PecaCompartilhada => p !== null);
    // todas as peças precisam ser de lojas conhecidas; senão, o link inteiro é recusado
    if (pecas.length !== dados.data.p.length) return null;
    return { nome: dados.data.n || undefined, pecas };
  } catch {
    return null;
  }
}

/** Link do WhatsApp com a mensagem pronta (a pessoa escolhe o contato). */
export function linkWhatsApp(texto: string): string {
  return `https://wa.me/?text=${encodeURIComponent(texto)}`;
}

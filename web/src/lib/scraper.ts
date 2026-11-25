/**
 * Cliente do serviço /scraper (Playwright).
 * Nunca lança erro: qualquer falha vira status "erro" para não derrubar as outras buscas.
 */
import "server-only";
import { z } from "zod";
import type { Produto, StatusScraper } from "./tipos";

const esquemaResposta = z.object({
  status: z.enum(["ok", "vazio", "bloqueado", "erro"]),
  produtos: z
    .array(
      z.object({
        titulo: z.string(),
        preco: z.string().nullable(),
        precoNumero: z.number().nullable(),
        imagem: z.string().nullable(),
        url: z.string().url(),
      }),
    )
    .default([]),
});

export function scraperConfigurado(): boolean {
  return Boolean(process.env.SCRAPER_URL);
}

export async function buscarNoScraper(
  termo: string,
  sinal: AbortSignal,
): Promise<{ status: StatusScraper; produtos: Produto[] }> {
  const base = process.env.SCRAPER_URL;
  if (!base) return { status: "desativado", produtos: [] };

  try {
    const resposta = await fetch(`${base.replace(/\/+$/, "")}/buscar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SCRAPER_TOKEN ?? ""}`,
      },
      body: JSON.stringify({ termo, limite: 12 }),
      signal: sinal,
      cache: "no-store",
    });
    if (!resposta.ok) {
      console.warn(`[scraper] HTTP ${resposta.status} para "${termo}"`);
      return { status: "erro", produtos: [] };
    }
    const dados = esquemaResposta.safeParse(await resposta.json());
    if (!dados.success) {
      console.warn(`[scraper] resposta em formato inesperado para "${termo}"`);
      return { status: "erro", produtos: [] };
    }
    return { status: dados.data.status, produtos: dados.data.produtos.map((p) => ({ ...p, loja: "shein" })) };
  } catch (erro) {
    const motivo = sinal.aborted ? "tempo esgotado" : (erro as Error).message;
    console.warn(`[scraper] falha para "${termo}": ${motivo}`);
    return { status: "erro", produtos: [] };
  }
}

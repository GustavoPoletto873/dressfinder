/**
 * Tipos e esquemas compartilhados entre a API e a interface.
 * Este arquivo não pode importar nada exclusivo do servidor.
 */
import { z } from "zod";

export const OCASIOES_SUGERIDAS = [
  "casamento de dia",
  "casamento à noite",
  "formatura",
  "trabalho",
  "festa",
  "praia",
  "jantar",
  "batizado",
  "dia a dia",
] as const;

export const COMPRIMENTOS = ["curto", "midi", "longo"] as const;
export const TAMANHOS = ["PP", "P", "M", "G", "GG", "Plus size"] as const;

/** Campo de texto opcional: string vazia vira undefined. */
const textoOpcional = (maximo: number) =>
  z
    .string()
    .trim()
    .max(maximo, `Use no máximo ${maximo} caracteres`)
    .optional()
    .transform((v) => (v ? v : undefined));

/** Aceita "", null ou undefined como ausente. */
const vazioParaUndefined = (v: unknown) => (v === "" || v === null ? undefined : v);

const precoOpcional = z.preprocess(
  vazioParaUndefined,
  z.coerce.number({ error: "Preço inválido" }).min(0, "Preço não pode ser negativo").max(100_000).optional(),
);

export const esquemaEntrada = z
  .object({
    ocasiao: z.string().trim().min(2, "Conte a ocasião").max(100, "Use no máximo 100 caracteres"),
    comprimento: z.preprocess(vazioParaUndefined, z.enum(COMPRIMENTOS).optional()),
    cor: textoOpcional(60),
    tecido: textoOpcional(60),
    decoteManga: textoOpcional(80),
    estilo: textoOpcional(60),
    tamanho: z.preprocess(vazioParaUndefined, z.enum(TAMANHOS).optional()),
    precoMin: precoOpcional,
    precoMax: precoOpcional,
    observacoes: textoOpcional(400),
  })
  .refine((d) => d.precoMin === undefined || d.precoMax === undefined || d.precoMin <= d.precoMax, {
    message: "O preço mínimo precisa ser menor que o máximo",
    path: ["precoMax"],
  });

export type Entrada = z.infer<typeof esquemaEntrada>;

/** Uma busca sugerida (pela IA ou pelas regras). */
export interface BuscaSugerida {
  termo: string;
  titulo: string;
  motivo: string;
}

export interface Produto {
  titulo: string;
  preco: string | null;
  precoNumero: number | null;
  imagem: string | null;
  url: string;
}

/** Resultado encontrado via Google (SerpAPI). */
export interface Anuncio {
  titulo: string;
  url: string;
  imagem: string | null;
  preco: string | null;
  precoNumero: number | null;
  trecho: string | null;
  /** "produto" = página de um vestido; "pagina" = categoria/lista da Shein. */
  tipo: "produto" | "pagina";
}

/** Status do scraper da Shein. "desativado" = SCRAPER_URL não configurada. */
export type StatusScraper = "ok" | "vazio" | "bloqueado" | "erro" | "desativado";

/** Status da busca no Google. "pulado" = não foi necessária ou passou do limite por pesquisa. */
export type StatusAnuncios = "ok" | "vazio" | "cota" | "erro" | "desativado" | "pulado";

export interface ResultadoBusca extends BuscaSugerida {
  linkShein: string;
  linkGoogle: string;
  status: StatusScraper;
  produtos: Produto[];
  statusAnuncios: StatusAnuncios;
  anuncios: Anuncio[];
}

export interface RespostaBusca {
  buscas: ResultadoBusca[];
  /** "ia" quando o Claude gerou as buscas; "regras" quando usamos o gerador local. */
  origemTermos: "ia" | "regras";
  totalProdutos: number;
  totalAnuncios: number;
}

/**
 * Tipos e esquemas compartilhados entre a API e a interface.
 * Este arquivo não pode importar nada exclusivo do servidor.
 */
import { z } from "zod";
import { MAX_LOJAS, normalizarLojas } from "./lojas";
import { NUMERACOES, PUBLICOS, TIPOS_PECA } from "./roupas/opcoes";

export type Modo = "vestidos" | "roupas";

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

/** Lojas escolhidas (ids). Lista vazia, inválida ou ausente vira a loja padrão (Shein). */
const lojas = z.preprocess(normalizarLojas, z.array(z.string()).min(1).max(MAX_LOJAS));

const faixaValida = (d: { precoMin?: number; precoMax?: number }) =>
  d.precoMin === undefined || d.precoMax === undefined || d.precoMin <= d.precoMax;
const ERRO_FAIXA = { message: "O preço mínimo precisa ser menor que o máximo", path: ["precoMax"] };

/** Formulário do modo Vestidos. */
export const esquemaVestidos = z
  .object({
    modo: z.literal("vestidos"),
    lojas,
    ocasiao: z.string().trim().min(2, "Conte a ocasião").max(100, "Use no máximo 100 caracteres"),
    comprimento: z.preprocess(vazioParaUndefined, z.enum(COMPRIMENTOS).optional()),
    // várias cores separadas por vírgula ("azul marinho, dourado, verde água")
    cor: textoOpcional(160),
    tecido: textoOpcional(60),
    decoteManga: textoOpcional(80),
    estilo: textoOpcional(60),
    tamanho: z.preprocess(vazioParaUndefined, z.enum(TAMANHOS).optional()),
    precoMin: precoOpcional,
    precoMax: precoOpcional,
    observacoes: textoOpcional(400),
  })
  .refine(faixaValida, ERRO_FAIXA);

/** Formulário do modo Roupas. */
export const esquemaRoupas = z
  .object({
    modo: z.literal("roupas"),
    lojas,
    tipoPeca: z.preprocess(vazioParaUndefined, z.enum(TIPOS_PECA, { error: "Escolha o tipo de peça" })),
    /** Usado quando tipoPeca é "outra". */
    tipoOutro: textoOpcional(40),
    publico: z.preprocess(vazioParaUndefined, z.enum(PUBLICOS, { error: "Público inválido" }).optional()),
    ocasiao: textoOpcional(100),
    estilo: textoOpcional(60),
    cor: textoOpcional(160),
    tecido: textoOpcional(60),
    // modelagens separadas por vírgula ("wide leg, cintura alta")
    modelagem: textoOpcional(120),
    tamanho: z.preprocess(vazioParaUndefined, z.enum(TAMANHOS).optional()),
    numeracao: z.preprocess(vazioParaUndefined, z.enum(NUMERACOES, { error: "Numeração inválida" }).optional()),
    precoMin: precoOpcional,
    precoMax: precoOpcional,
    observacoes: textoOpcional(400),
  })
  .refine(faixaValida, ERRO_FAIXA)
  .refine((d) => d.tipoPeca !== "outra" || Boolean(d.tipoOutro), {
    message: "Conte qual peça você procura",
    path: ["tipoOutro"],
  });

/**
 * Entrada da API: um formulário por modo (união discriminada pelo campo "modo").
 * Pedidos sem "modo" (páginas abertas antes desta versão) contam como Vestidos.
 */
export const esquemaEntrada = z.preprocess(
  (v) => (v && typeof v === "object" && !("modo" in v) ? { ...v, modo: "vestidos" } : v),
  z.discriminatedUnion("modo", [esquemaVestidos, esquemaRoupas], { error: "Modo inválido" }),
);

export type EntradaVestidos = z.infer<typeof esquemaVestidos>;
export type EntradaRoupas = z.infer<typeof esquemaRoupas>;
export type Entrada = EntradaVestidos | EntradaRoupas;

/** Uma busca sugerida (pela IA ou pelas regras). */
export interface BuscaSugerida {
  termo: string;
  titulo: string;
  motivo: string;
}

export interface Produto {
  /** Id da loja (ver lib/lojas.ts). */
  loja: string;
  titulo: string;
  preco: string | null;
  precoNumero: number | null;
  imagem: string | null;
  url: string;
}

/** Resultado encontrado via Google (SerpAPI). */
export interface Anuncio {
  /** Id da loja (ver lib/lojas.ts). */
  loja: string;
  titulo: string;
  url: string;
  /** Foto principal (servida pela própria loja). */
  imagem: string | null;
  /** Foto reserva (miniatura do Google), usada se a principal não carregar. */
  imagemReserva?: string | null;
  preco: string | null;
  precoNumero: number | null;
  trecho: string | null;
  /** "produto" = página de uma peça; "pagina" = categoria/lista da loja. */
  tipo: "produto" | "pagina";
}

/** Status do scraper da Shein. "desativado" = SCRAPER_URL não configurada ou Shein não escolhida. */
export type StatusScraper = "ok" | "vazio" | "bloqueado" | "erro" | "desativado";

/** Status da busca no Google. "pulado" = não foi necessária ou passou do limite por pesquisa. */
export type StatusAnuncios = "ok" | "vazio" | "cota" | "erro" | "desativado" | "pulado";

/** Link "buscar na loja" (a busca da própria loja ou o Google filtrado por ela). */
export interface LinkLoja {
  loja: string;
  nome: string;
  url: string;
  viaGoogle: boolean;
}

export interface ResultadoBusca extends BuscaSugerida {
  /** Um link por loja escolhida. */
  links: LinkLoja[];
  /** Google filtrado por todas as lojas escolhidas. */
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

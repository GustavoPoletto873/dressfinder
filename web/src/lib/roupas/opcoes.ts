/**
 * Opções do modo Roupas, usadas pela interface e pela validação da API.
 * Este arquivo não pode importar nada exclusivo do servidor.
 */

export const GRUPOS_PECAS = [
  { titulo: "Parte de cima", pecas: ["blusa", "camiseta", "camisa", "regata", "cropped"] },
  { titulo: "Parte de baixo", pecas: ["calça", "jeans", "saia", "short", "bermuda"] },
  { titulo: "Peça inteira", pecas: ["macacão", "conjunto"] },
  { titulo: "Para cobrir", pecas: ["jaqueta", "casaco", "blazer", "moletom", "cardigã", "suéter", "colete"] },
] as const;

export const TIPOS_PECA = [...GRUPOS_PECAS.flatMap((g) => g.pecas), "outra"] as const;
export type TipoPeca = (typeof TIPOS_PECA)[number];

/** Peças que também usam numeração (34 a 56). */
export const PECAS_COM_NUMERACAO: readonly string[] = ["calça", "jeans", "short", "bermuda", "saia"];
export const NUMERACOES = ["34", "36", "38", "40", "42", "44", "46", "48", "50", "52", "54", "56"] as const;

export const PUBLICOS = ["feminino", "masculino", "unissex", "plus size"] as const;
export type Publico = (typeof PUBLICOS)[number];

export const OCASIOES_ROUPAS = ["dia a dia", "trabalho", "academia", "viagem", "frio", "praia", "balada", "encontro"] as const;

export const ESTILOS_ROUPAS = ["básico", "streetwear", "social", "vintage", "esportivo", "casual", "romântico", "minimalista"] as const;

/** Gênero gramatical de cada peça, para concordar os adjetivos ("calça feminina", "short feminino"). */
export const GENERO_PECA: Record<string, "f" | "m"> = {
  blusa: "f", camiseta: "f", camisa: "f", regata: "f", cropped: "m",
  calça: "f", jeans: "m", saia: "f", short: "m", bermuda: "f",
  macacão: "m", conjunto: "m",
  jaqueta: "f", casaco: "m", blazer: "m", moletom: "m", cardigã: "m", suéter: "m", colete: "m",
};

const TOPO = ["oversized", "slim", "cropped", "manga longa", "manga curta", "gola alta", "ombro a ombro", "decote V"];
const COBRIR = ["oversized", "cropped", "slim", "com capuz", "puffer", "bomber", "corta vento"];

/** Modelagens e caimentos que fazem sentido para cada tipo de peça. */
const MODELAGENS: Record<string, string[]> = {
  blusa: TOPO,
  camiseta: ["oversized", "slim", "cropped", "manga longa", "gola V", "básica"],
  camisa: ["oversized", "slim", "manga longa", "manga curta", "cropped", "amarração"],
  regata: ["slim", "oversized", "cropped", "nadador", "alcinha", "gola alta"],
  cropped: ["manga longa", "manga curta", "alcinha", "ombro a ombro", "decote V", "amarração"],
  calça: ["wide leg", "pantalona", "reta", "skinny", "flare", "cargo", "jogger", "cintura alta"],
  jeans: ["mom", "wide leg", "reta", "skinny", "flare", "baggy", "cintura alta", "destroyed"],
  saia: ["mini", "midi", "longa", "plissada", "evasê", "lápis", "envelope", "com fenda"],
  short: ["cintura alta", "ciclista", "saia short", "clochard", "soltinho", "alfaiataria"],
  bermuda: ["ciclista", "cargo", "reta", "cintura alta", "alfaiataria"],
  macacão: ["longo", "curto", "pantacourt", "wide leg", "alcinha", "manga longa"],
  conjunto: ["cropped e saia", "calça e blazer", "short e blusa", "calça e cropped", "moletom"],
  jaqueta: COBRIR,
  casaco: [...COBRIR, "trench coat", "sobretudo"],
  blazer: ["oversized", "slim", "alongado", "cropped", "abotoamento duplo"],
  moletom: ["oversized", "cropped", "com capuz", "careca", "zíper"],
  cardigã: ["oversized", "cropped", "alongado", "botões", "decote V"],
  suéter: ["oversized", "cropped", "gola alta", "decote V", "listrado"],
  colete: ["alfaiataria", "tricô", "puffer", "cropped", "alongado"],
  outra: ["oversized", "slim", "cropped", "cintura alta"],
};

export function modelagensDaPeca(tipo: string): string[] {
  return MODELAGENS[tipo] ?? MODELAGENS.outra!;
}

export function usaNumeracao(tipo: string): boolean {
  return PECAS_COM_NUMERACAO.includes(tipo);
}

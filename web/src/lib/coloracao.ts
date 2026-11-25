/**
 * Quiz rápido de coloração pessoal (por regras, sem IA).
 *
 * Quatro perguntas indicam o subtom da pele (quente, frio ou neutro) e uma
 * indica o contraste entre cabelo, olhos e pele. Juntos, dão uma das cartelas
 * simplificadas (as quatro estações e uma cartela neutra). As cores sugeridas
 * usam os mesmos nomes da paleta do app (components/comum/paletaCores.ts).
 *
 * É uma dica, não substitui uma análise de coloração feita por profissional.
 */

export type Subtom = "quente" | "frio" | "neutro";
export type Contraste = "alto" | "medio" | "baixo";
export type IdCartela = "primavera" | "outono" | "verao" | "inverno" | "neutra";

export interface Opcao {
  texto: string;
  /** +1 puxa para quente, -1 para frio, 0 neutro. */
  peso?: number;
  contraste?: Contraste;
}

export interface Pergunta {
  id: string;
  texto: string;
  ajuda?: string;
  opcoes: Opcao[];
}

export const PERGUNTAS: Pergunta[] = [
  {
    id: "veias",
    texto: "Olhe as veias do seu pulso, na luz do dia. Que cor elas parecem?",
    opcoes: [
      { texto: "Esverdeadas", peso: 1 },
      { texto: "Azuladas ou arroxeadas", peso: -1 },
      { texto: "Difícil dizer, um pouco de cada", peso: 0 },
    ],
  },
  {
    id: "joias",
    texto: "Qual joia ilumina mais o seu rosto?",
    opcoes: [
      { texto: "Dourada", peso: 1 },
      { texto: "Prateada", peso: -1 },
      { texto: "As duas ficam bem", peso: 0 },
    ],
  },
  {
    id: "sol",
    texto: "Como a sua pele reage ao sol?",
    opcoes: [
      { texto: "Bronzeia fácil, quase não queima", peso: 1 },
      { texto: "Fica vermelha e queima fácil", peso: -1 },
      { texto: "Queima um pouco e depois bronzeia", peso: 0 },
    ],
  },
  {
    id: "branco",
    texto: "Perto do rosto, qual branco fica melhor em você?",
    ajuda: "Pense numa camiseta ou numa toalha encostada no rosto, sem maquiagem.",
    opcoes: [
      { texto: "Off-white, creme", peso: 1 },
      { texto: "Branco puro", peso: -1 },
      { texto: "Os dois ficam bem", peso: 0 },
    ],
  },
  {
    id: "contraste",
    texto: "Comparando cabelo, olhos e pele, o contraste entre eles é…",
    opcoes: [
      { texto: "Alto: ex. cabelo bem escuro e pele clara", contraste: "alto" },
      { texto: "Médio", contraste: "medio" },
      { texto: "Baixo: tons parecidos entre si", contraste: "baixo" },
    ],
  },
];

export interface Cartela {
  id: IdCartela;
  nome: string;
  /** Frase curta: "quente e viva". */
  resumo: string;
  descricao: string;
  /** Cores da paleta que valorizam (as 4 primeiras viram o atalho "Usar minhas cores"). */
  cores: string[];
  /** Cores da paleta para usar longe do rosto. */
  evitar: string[];
}

export const CARTELAS: Record<IdCartela, Cartela> = {
  primavera: {
    id: "primavera",
    nome: "Primavera",
    resumo: "quente e viva",
    descricao: "Cores quentes, claras e alegres iluminam o seu rosto. Prefira dourado a prateado e off-white a branco puro.",
    cores: ["coral", "turquesa", "amarelo", "verde", "salmão", "off-white", "caramelo", "dourado"],
    evitar: ["preto", "cinza", "prata", "vinho"],
  },
  outono: {
    id: "outono",
    nome: "Outono",
    resumo: "quente e suave",
    descricao: "Tons terrosos e profundos, como os de folhas secas, combinam com você. Dourado e tecidos com textura valorizam.",
    cores: ["terracota", "verde-oliva", "mostarda", "caramelo", "marrom", "cáqui", "bege", "dourado"],
    evitar: ["pink", "azul royal", "branco", "prata"],
  },
  verao: {
    id: "verao",
    nome: "Verão",
    resumo: "fria e suave",
    descricao: "Cores frias e delicadas, um pouco acinzentadas, deixam sua pele uniforme. Prateado e tons pastel são seus aliados.",
    cores: ["rosa", "lilás", "azul bebê", "verde menta", "rosa bebê", "azul", "cinza", "prata"],
    evitar: ["laranja", "mostarda", "terracota", "preto"],
  },
  inverno: {
    id: "inverno",
    nome: "Inverno",
    resumo: "fria e intensa",
    descricao: "Cores puras, frias e marcantes combinam com o seu contraste. Preto e branco puro ficam ótimos em você.",
    cores: ["preto", "branco", "pink", "azul royal", "verde esmeralda", "vermelho", "roxo", "prata"],
    evitar: ["bege", "caramelo", "mostarda", "laranja"],
  },
  neutra: {
    id: "neutra",
    nome: "Neutra",
    resumo: "equilibrada",
    descricao: "Seu subtom fica no meio do caminho: você transita bem entre cores quentes e frias. Fuja só dos extremos muito vibrantes.",
    cores: ["off-white", "azul marinho", "verde esmeralda", "vinho", "rosa", "verde", "nude", "cinza"],
    evitar: ["laranja", "pink"],
  },
};

/** Respostas: índice da opção escolhida em cada pergunta (na mesma ordem de PERGUNTAS). */
export function calcularCartela(respostas: number[]): Cartela {
  const escolhidas = PERGUNTAS.map((p, i) => p.opcoes[respostas[i] ?? -1]).filter((o): o is Opcao => Boolean(o));
  const soma = escolhidas.reduce((s, o) => s + (o.peso ?? 0), 0);
  const contraste: Contraste = escolhidas.find((o) => o.contraste)?.contraste ?? "medio";
  const subtom: Subtom = soma >= 2 ? "quente" : soma <= -2 ? "frio" : "neutro";
  if (subtom === "neutro") return CARTELAS.neutra;
  const vivo = contraste === "alto";
  if (subtom === "quente") return vivo ? CARTELAS.primavera : CARTELAS.outono;
  return vivo ? CARTELAS.inverno : CARTELAS.verao;
}

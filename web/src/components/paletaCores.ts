/**
 * Paleta de cores e estampas do formulário, organizada em grupos para
 * não sobrecarregar a usuária. "fundo" é qualquer valor CSS de background.
 */

export interface Cor {
  nome: string;
  fundo: string;
}

export interface GrupoCores {
  titulo: string;
  cores: Cor[];
}

/** Máximo de cores escolhidas ao mesmo tempo (mais que isso dispersa a busca). */
export const MAX_CORES = 4;

export const GRUPOS_CORES: GrupoCores[] = [
  {
    titulo: "Neutros",
    cores: [
      { nome: "preto", fundo: "#262122" },
      { nome: "branco", fundo: "#ffffff" },
      { nome: "off-white", fundo: "#f3eadb" },
      { nome: "bege", fundo: "#e6d3b8" },
      { nome: "nude", fundo: "#dfbfa3" },
      { nome: "cáqui", fundo: "#b4a77f" },
      { nome: "caramelo", fundo: "#b9814f" },
      { nome: "marrom", fundo: "#6e4a35" },
      { nome: "cinza", fundo: "#a3a3a3" },
    ],
  },
  {
    titulo: "Rosas e vermelhos",
    cores: [
      { nome: "rosa bebê", fundo: "#f6cdd6" },
      { nome: "rosa", fundo: "#ee9bb0" },
      { nome: "pink", fundo: "#e2438a" },
      { nome: "salmão", fundo: "#f4a58e" },
      { nome: "coral", fundo: "#f08070" },
      { nome: "vermelho", fundo: "#c7363f" },
      { nome: "vinho", fundo: "#7a2336" },
    ],
  },
  {
    titulo: "Roxos e azuis",
    cores: [
      { nome: "lilás", fundo: "#c4a7dd" },
      { nome: "roxo", fundo: "#6d3f9a" },
      { nome: "azul bebê", fundo: "#b7d4f0" },
      { nome: "azul", fundo: "#5b8fd6" },
      { nome: "azul royal", fundo: "#2f55c4" },
      { nome: "azul marinho", fundo: "#25365c" },
      { nome: "turquesa", fundo: "#3cb8b0" },
    ],
  },
  {
    titulo: "Verdes",
    cores: [
      { nome: "verde menta", fundo: "#bfe5d0" },
      { nome: "verde", fundo: "#6f9b6a" },
      { nome: "verde esmeralda", fundo: "#1f7a57" },
      { nome: "verde-oliva", fundo: "#7e7b46" },
    ],
  },
  {
    titulo: "Tons quentes",
    cores: [
      { nome: "amarelo", fundo: "#f2cf5b" },
      { nome: "mostarda", fundo: "#d1a02e" },
      { nome: "laranja", fundo: "#ec8a3a" },
      { nome: "terracota", fundo: "#c0603f" },
    ],
  },
  {
    titulo: "Metalizados",
    cores: [
      { nome: "dourado", fundo: "linear-gradient(135deg,#f6e09a,#c9973a 55%,#f1d27f)" },
      { nome: "prata", fundo: "linear-gradient(135deg,#f7f7f7,#a8a8a8 55%,#e6e6e6)" },
      { nome: "champanhe", fundo: "linear-gradient(135deg,#f5e7cc,#d8bd8f 55%,#f1e2c4)" },
    ],
  },
  {
    titulo: "Estampas",
    cores: [
      {
        nome: "floral",
        fundo:
          "radial-gradient(circle at 30% 30%,#f1a9b9 0 22%,transparent 23%),radial-gradient(circle at 72% 64%,#c4a7dd 0 20%,transparent 21%),radial-gradient(circle at 70% 22%,#a9c0a0 0 14%,transparent 15%),radial-gradient(circle at 28% 74%,#f2cf5b 0 12%,transparent 13%),#fff8ef",
      },
      { nome: "poá", fundo: "radial-gradient(#3f3533 30%,transparent 33%) 0 0/9px 9px,#fdf9f3" },
      { nome: "listrado", fundo: "repeating-linear-gradient(90deg,#25365c 0 4px,#fdf9f3 4px 8px)" },
      {
        nome: "xadrez",
        fundo:
          "repeating-linear-gradient(0deg,rgb(199 54 63/.5) 0 5px,transparent 5px 10px),repeating-linear-gradient(90deg,rgb(199 54 63/.5) 0 5px,transparent 5px 10px),#fdf9f3",
      },
      {
        nome: "oncinha",
        fundo:
          "radial-gradient(circle at 28% 28%,#3b2a20 0 11%,transparent 12%),radial-gradient(circle at 70% 40%,#3b2a20 0 10%,transparent 11%),radial-gradient(circle at 40% 72%,#3b2a20 0 9%,transparent 10%),radial-gradient(circle at 78% 80%,#3b2a20 0 8%,transparent 9%),#d9a15c",
      },
      { nome: "colorido", fundo: "conic-gradient(#f1a9b9,#f2cf5b,#8fd3c4,#76a3d9,#c4a7dd,#f1a9b9)" },
    ],
  },
];

export const TODAS_AS_CORES: Cor[] = GRUPOS_CORES.flatMap((g) => g.cores);

/** Cores muito claras ganham um contorno para não sumir no fundo creme. */
export const CORES_CLARAS = new Set(["branco", "off-white", "bege", "rosa bebê", "azul bebê", "verde menta", "champanhe", "prata"]);

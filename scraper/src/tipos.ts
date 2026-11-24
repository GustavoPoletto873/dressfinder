/** Status possíveis de uma busca no scraper. */
export type StatusBusca = "ok" | "vazio" | "bloqueado" | "erro";

/** Produto normalizado devolvido pelo serviço. */
export interface Produto {
  titulo: string;
  /** Preço formatado para exibição, ex.: "R$ 89,90". */
  preco: string | null;
  /** Preço numérico em reais, para filtros. */
  precoNumero: number | null;
  /** URL https da imagem principal. */
  imagem: string | null;
  /** URL absoluta da página do produto na Shein Brasil. */
  url: string;
}

export interface ResultadoBusca {
  status: StatusBusca;
  produtos: Produto[];
}

/** De onde vieram os produtos (usado só nos logs). */
export type OrigemDados = "json" | "embutido" | "dom" | "cache" | "nenhuma";

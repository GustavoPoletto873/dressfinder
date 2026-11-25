/**
 * Gerador de buscas por regras (sem IA): escolhe o gerador do modo.
 * Pode rodar no servidor e no navegador (plano B se a API cair).
 */
import { gerarBuscasRoupas } from "./roupas/termosRegras";
import type { BuscaSugerida, Entrada } from "./tipos";
import { gerarBuscasVestidos } from "./vestidos/termosRegras";

export function gerarBuscasPorRegras(entrada: Entrada): BuscaSugerida[] {
  return entrada.modo === "roupas" ? gerarBuscasRoupas(entrada) : gerarBuscasVestidos(entrada);
}

/**
 * Limite simples de requisições por IP, em memória.
 *
 * Protege a cota da SerpAPI e o custo da API da Anthropic contra abuso
 * básico. Na Vercel cada instância tem a própria memória, então é uma
 * proteção de "melhor esforço", não uma garantia.
 */
import "server-only";

const JANELA_MS = 60_000;
const registros = new Map<string, number[]>();

export function limiteExcedido(ip: string): boolean {
  const maximo = Number(process.env.LIMITE_BUSCAS_POR_MINUTO ?? 6);
  const agora = Date.now();
  const recentes = (registros.get(ip) ?? []).filter((t) => agora - t < JANELA_MS);
  if (recentes.length >= maximo) {
    registros.set(ip, recentes);
    return true;
  }
  recentes.push(agora);
  registros.set(ip, recentes);

  // limpeza ocasional para a memória não crescer sem limite
  if (registros.size > 5_000) {
    for (const [chave, tempos] of registros) {
      if (tempos.every((t) => agora - t >= JANELA_MS)) registros.delete(chave);
    }
  }
  return false;
}

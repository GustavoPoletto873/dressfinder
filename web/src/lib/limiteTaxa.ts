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

/**
 * @param tipo separa os contadores (ex.: "escolhas" não gasta o limite de buscas)
 * @param maximo pedidos por minuto; padrão: LIMITE_BUSCAS_POR_MINUTO (6)
 */
export function limiteExcedido(ip: string, tipo = "buscas", maximo = Number(process.env.LIMITE_BUSCAS_POR_MINUTO ?? 6)): boolean {
  const chave = `${tipo}:${ip}`;
  const agora = Date.now();
  const recentes = (registros.get(chave) ?? []).filter((t) => agora - t < JANELA_MS);
  if (recentes.length >= maximo) {
    registros.set(chave, recentes);
    return true;
  }
  recentes.push(agora);
  registros.set(chave, recentes);

  // limpeza ocasional para a memória não crescer sem limite
  if (registros.size > 5_000) {
    for (const [chave, tempos] of registros) {
      if (tempos.every((t) => agora - t >= JANELA_MS)) registros.delete(chave);
    }
  }
  return false;
}

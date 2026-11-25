/**
 * Guarda as peças do "Qual eu levo?" no Upstash Redis, para o link curto
 * (/qual-eu-levo#c=<código>). Usa a API REST do Upstash com fetch (sem biblioteca).
 *
 * Variáveis (a integração da Vercel cria as KV_*; as UPSTASH_* também valem):
 *   KV_REST_API_URL + KV_REST_API_TOKEN, ou UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 * Sem elas, o app continua mandando o link longo (com as peças dentro do link).
 *
 * O código é tirado do próprio conteúdo (SHA-256): a mesma escolha gera o mesmo
 * código, sem acumular cópias, e não dá para adivinhar códigos de outras pessoas.
 */
import "server-only";

const NOVENTA_DIAS_S = 90 * 24 * 60 * 60;

const endereco = () => process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const token = () => process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

export function linksCurtosAtivos(): boolean {
  return Boolean(endereco() && token());
}

async function comando(args: (string | number)[]): Promise<unknown> {
  const resposta = await fetch(endereco()!, {
    method: "POST",
    headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
    body: JSON.stringify(args),
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });
  const dados = (await resposta.json().catch(() => ({}))) as { result?: unknown; error?: string };
  if (!resposta.ok || dados.error) throw new Error(dados.error ?? `HTTP ${resposta.status}`);
  return dados.result;
}

async function codigoDoConteudo(json: string): Promise<string> {
  const hash = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(json)));
  return Buffer.from(hash).toString("base64url").slice(0, 10);
}

/** Guarda por 90 dias e devolve o código. */
export async function guardarEscolha(dados: object): Promise<string> {
  const json = JSON.stringify(dados);
  const codigo = await codigoDoConteudo(json);
  await comando(["SET", `escolha:${codigo}`, json, "EX", NOVENTA_DIAS_S]);
  return codigo;
}

export async function lerEscolha(codigo: string): Promise<unknown | null> {
  const valor = await comando(["GET", `escolha:${codigo}`]);
  return typeof valor === "string" ? JSON.parse(valor) : null;
}

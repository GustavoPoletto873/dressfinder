/**
 * Servidor HTTP do scraper.
 *
 * POST /buscar  { termo, limite }  → { status, produtos }   (exige Bearer token)
 * GET  /saude                       → health check
 */
import { timingSafeEqual } from "node:crypto";
import Fastify from "fastify";
import { z } from "zod";
import { fecharNavegador, navegadorConectado, obterNavegador } from "./navegador.js";
import { LIMITE_MAXIMO, buscar, estadoServico } from "./servico.js";

const TOKEN = process.env.SCRAPER_TOKEN ?? "";
const PORTA = Number(process.env.PORT ?? 3001);

if (!TOKEN) {
  console.error("SCRAPER_TOKEN não configurado. Defina a variável de ambiente antes de iniciar.");
  process.exit(1);
}

const esquemaBusca = z.object({
  termo: z.string().trim().min(2, "termo muito curto").max(120, "termo muito longo"),
  limite: z.coerce
    .number()
    .int()
    .default(12)
    .transform((n) => Math.min(Math.max(n, 1), LIMITE_MAXIMO)),
});

function tokenValido(cabecalho: string | undefined): boolean {
  const recebido = Buffer.from(cabecalho?.replace(/^Bearer\s+/i, "") ?? "");
  const esperado = Buffer.from(TOKEN);
  return recebido.length === esperado.length && timingSafeEqual(recebido, esperado);
}

const app = Fastify({
  logger: { level: process.env.LOG_LEVEL ?? "info" },
});

app.get("/saude", async () => ({
  status: "ok",
  navegador: navegadorConectado() ? "aberto" : "fechado",
  ...estadoServico(),
}));

app.post("/buscar", async (requisicao, resposta) => {
  if (!tokenValido(requisicao.headers.authorization)) {
    return resposta.code(401).send({ erro: "Token inválido ou ausente" });
  }
  const entrada = esquemaBusca.safeParse(requisicao.body ?? {});
  if (!entrada.success) {
    return resposta.code(400).send({ erro: "Entrada inválida", detalhes: entrada.error.issues.map((i) => i.message) });
  }
  const { termo, limite } = entrada.data;
  return buscar(termo, limite, requisicao.log);
});

async function encerrar(sinal: string) {
  app.log.info(`recebido ${sinal}, encerrando`);
  await app.close().catch(() => undefined);
  await fecharNavegador();
  process.exit(0);
}
process.on("SIGTERM", () => void encerrar("SIGTERM"));
process.on("SIGINT", () => void encerrar("SIGINT"));

try {
  await app.listen({ port: PORTA, host: "0.0.0.0" });
  // abre o navegador já na subida para a primeira busca não pagar esse custo
  obterNavegador()
    .then(() => app.log.info("navegador pronto"))
    .catch((erro) => app.log.error(`falha ao abrir o navegador: ${(erro as Error).message}`));
} catch (erro) {
  app.log.error(erro);
  process.exit(1);
}

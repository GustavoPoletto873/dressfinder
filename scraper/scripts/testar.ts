/**
 * Testa o servidor do scraper rodando localmente com 3 termos diferentes.
 *
 * Uso (com o servidor já rodando em outro terminal via `npm run dev`):
 *   npm run testar
 *   npm run testar -- "vestido longo festa" "vestido branco praia"
 */
const url = process.env.SCRAPER_URL ?? "http://localhost:3001";
const token = process.env.SCRAPER_TOKEN ?? "";
const termos = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["vestido midi floral", "vestido longo festa noite", "vestido curto linho"];

async function testar(termo: string) {
  const inicio = Date.now();
  const resposta = await fetch(`${url}/buscar`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ termo, limite: 5 }),
  });
  const corpo = (await resposta.json()) as { status?: string; produtos?: { titulo: string; preco: string | null; url: string }[] };
  const segundos = ((Date.now() - inicio) / 1000).toFixed(1);
  console.log(`\n"${termo}" → HTTP ${resposta.status} | status=${corpo.status} | produtos=${corpo.produtos?.length ?? 0} | ${segundos}s`);
  for (const p of corpo.produtos ?? []) console.log(`  - ${p.titulo} | ${p.preco ?? "sem preço"} | ${p.url}`);
}

const saude = await fetch(`${url}/saude`).then((r) => r.json());
console.log("Saúde:", saude);
for (const termo of termos) await testar(termo);
console.log("\nRepetindo o primeiro termo (deve vir do cache):");
await testar(termos[0]!);

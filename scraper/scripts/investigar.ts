/**
 * Script de investigação: abre uma busca na Shein Brasil com o navegador
 * visível, registra no terminal todas as respostas JSON recebidas e salva
 * exemplos em arquivo para entender o formato real dos dados.
 *
 * Uso: npm run investigar -- "vestido midi floral"
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const termo = process.argv[2] ?? "vestido midi floral";
const url = `https://br.shein.com/pdsearch/${encodeURIComponent(termo)}/`;
const pastaSaida = path.resolve("investigacao");

async function principal() {
  await mkdir(pastaSaida, { recursive: true });

  const navegador = await chromium.launch({ headless: false });
  const contexto = await navegador.newContext({
    locale: "pt-BR",
    viewport: { width: 1366, height: 900 },
  });
  const pagina = await contexto.newPage();

  const respostasJson: { url: string; status: number; tamanho: number; arquivo: string }[] = [];
  let contador = 0;

  pagina.on("response", async (resposta) => {
    const tipo = resposta.headers()["content-type"] ?? "";
    if (!tipo.includes("json")) return;
    try {
      const corpo = await resposta.text();
      contador += 1;
      const arquivo = `resposta-${String(contador).padStart(3, "0")}.json`;
      await writeFile(path.join(pastaSaida, arquivo), corpo, "utf8");
      respostasJson.push({ url: resposta.url(), status: resposta.status(), tamanho: corpo.length, arquivo });
      console.log(`\n[JSON ${contador}] ${resposta.status()} ${resposta.url()}`);
      console.log(`  tamanho: ${corpo.length} | início: ${corpo.slice(0, 300).replace(/\s+/g, " ")}`);
    } catch {
      // corpo indisponível (redirecionamento, etc.)
    }
  });

  console.log(`Abrindo ${url}`);
  const inicio = Date.now();
  await pagina.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await pagina.waitForTimeout(12_000);
  // rola um pouco para disparar carregamentos tardios
  await pagina.mouse.wheel(0, 3000);
  await pagina.waitForTimeout(5_000);

  const urlFinal = pagina.url();
  const titulo = await pagina.title();
  const html = await pagina.content();
  await writeFile(path.join(pastaSaida, "pagina.html"), html, "utf8");
  await pagina.screenshot({ path: path.join(pastaSaida, "pagina.png"), fullPage: false });

  // Procura dados embutidos no HTML (comum em sites que renderizam no servidor)
  const indicios = ["gbRawData", "goods_name", "salePrice", "productListInfo", "__NEXT_DATA__", "captcha", "risk"];
  console.log("\n=== Resumo ===");
  console.log(`URL final: ${urlFinal}`);
  console.log(`Título: ${titulo}`);
  console.log(`Tempo: ${((Date.now() - inicio) / 1000).toFixed(1)}s`);
  console.log(`Respostas JSON: ${respostasJson.length}`);
  for (const ind of indicios) {
    const pos = html.indexOf(ind);
    console.log(`HTML contém "${ind}": ${pos >= 0 ? `sim (posição ${pos})` : "não"}`);
  }

  await writeFile(path.join(pastaSaida, "indice.json"), JSON.stringify({ termo, urlFinal, titulo, respostasJson }, null, 2));
  console.log(`\nArquivos salvos em ${pastaSaida}`);
  await navegador.close();
}

principal().catch((erro) => {
  console.error("Falha na investigação:", erro);
  process.exit(1);
});

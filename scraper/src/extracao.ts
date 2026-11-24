/**
 * Funções puras de extração e normalização de produtos.
 *
 * A Shein muda o formato das respostas com frequência, então em vez de
 * depender de um caminho fixo (ex.: info.products[]) percorremos qualquer
 * JSON procurando objetos com "cara" de produto (nome + id da Shein).
 */
import type { Produto } from "./tipos.js";

export const ORIGEM_SHEIN = "https://br.shein.com";

/** Converte "R$ 1.299,90", "89.90" ou 89.9 em número (reais). */
export function converterPreco(valor: unknown): number | null {
  if (typeof valor === "number") return Number.isFinite(valor) && valor > 0 ? valor : null;
  if (typeof valor !== "string") return null;
  const limpo = valor.replace(/[^\d.,]/g, "");
  if (!limpo) return null;
  let normalizado: string;
  if (limpo.includes(",")) {
    // formato brasileiro: ponto = milhar, vírgula = decimal
    normalizado = limpo.replace(/\./g, "").replace(",", ".");
  } else if (/^\d{1,3}(\.\d{3})+$/.test(limpo)) {
    // "1.299" sem centavos: ponto é milhar
    normalizado = limpo.replace(/\./g, "");
  } else {
    normalizado = limpo;
  }
  const numero = Number.parseFloat(normalizado);
  return Number.isFinite(numero) && numero > 0 ? numero : null;
}

/** Formata um número como moeda brasileira. */
export function formatarPreco(numero: number): string {
  return numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Garante URL absoluta e https para imagens. */
export function normalizarImagem(valor: unknown): string | null {
  if (typeof valor !== "string" || !valor.trim()) return null;
  let url = valor.trim();
  if (url.startsWith("data:")) return null;
  if (url.startsWith("//")) url = `https:${url}`;
  else if (url.startsWith("http://")) url = `https://${url.slice(7)}`;
  else if (url.startsWith("/")) url = `${ORIGEM_SHEIN}${url}`;
  else if (!url.startsWith("https://")) return null;
  return url;
}

/** Garante URL absoluta de produto em br.shein.com. */
export function normalizarUrlProduto(valor: string): string | null {
  try {
    const url = new URL(valor, ORIGEM_SHEIN);
    url.protocol = "https:";
    if (!url.hostname.endsWith("shein.com")) return null;
    url.hostname = "br.shein.com";
    return url.toString();
  } catch {
    return null;
  }
}

/** Monta a URL de produto no padrão da Shein: /<nome-do-produto>-p-<id>.html */
export function montarUrlProduto(id: string | number, nomeUrl?: string | null): string {
  const slug = (nomeUrl ?? "produto")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "produto";
  return `${ORIGEM_SHEIN}/${slug}-p-${id}.html`;
}

type Obj = Record<string, unknown>;

function ehObjeto(v: unknown): v is Obj {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function primeiroTexto(obj: Obj, chaves: string[]): string | null {
  for (const chave of chaves) {
    const v = obj[chave];
    if (typeof v === "string" && v.trim()) return v.trim();
    if (typeof v === "number") return String(v);
  }
  return null;
}

/** Lê preço de estruturas como { amount, amountWithSymbol } ou strings soltas. */
function lerPreco(obj: Obj): { preco: string | null; precoNumero: number | null } {
  const candidatos = ["salePrice", "sale_price", "retailPrice", "retail_price", "price", "salePriceAmount"];
  for (const chave of candidatos) {
    const v = obj[chave];
    if (ehObjeto(v)) {
      const texto = primeiroTexto(v, ["amountWithSymbol", "amount_with_symbol", "priceShowStyle"]);
      const numero = converterPreco(v.amount ?? v.usdAmount ?? texto);
      if (numero !== null) return { preco: texto ?? formatarPreco(numero), precoNumero: numero };
    } else if (v !== undefined) {
      const numero = converterPreco(v);
      if (numero !== null) return { preco: typeof v === "string" ? v : formatarPreco(numero), precoNumero: numero };
    }
  }
  return { preco: null, precoNumero: null };
}

/** Tenta transformar um objeto qualquer em Produto. Retorna null se não parecer produto. */
export function objetoParaProduto(obj: Obj): Produto | null {
  const titulo = primeiroTexto(obj, ["goods_name", "goodsName", "productName", "product_name"]);
  const id = primeiroTexto(obj, ["goods_id", "goodsId", "productId", "product_id"]);
  if (!titulo || !id || !/^\d+$/.test(id)) return null;

  const imagem = normalizarImagem(
    obj.goods_img ?? obj.goodsImg ?? obj.goods_thumb ?? obj.image ?? obj.imgUrl ??
      (Array.isArray(obj.detail_image) ? obj.detail_image[0] : undefined),
  );

  const urlInformada = primeiroTexto(obj, ["productUrl", "product_url", "goods_url", "url"]);
  const url =
    (urlInformada && /-p-\d+/.test(urlInformada) ? normalizarUrlProduto(urlInformada) : null) ??
    montarUrlProduto(id, primeiroTexto(obj, ["goods_url_name", "goodsUrlName"]) ?? titulo);

  return { titulo, imagem, url, ...lerPreco(obj) };
}

/**
 * Percorre um JSON arbitrário e coleta tudo que parece produto.
 * Também informa se encontrou uma lista de produtos vazia (útil para "vazio").
 */
export function extrairProdutosDeJson(raiz: unknown, profundidadeMaxima = 14): Produto[] {
  const encontrados: Produto[] = [];
  const visitar = (no: unknown, profundidade: number) => {
    if (profundidade > profundidadeMaxima || no === null || typeof no !== "object") return;
    if (Array.isArray(no)) {
      for (const item of no) visitar(item, profundidade + 1);
      return;
    }
    const produto = objetoParaProduto(no as Obj);
    if (produto) {
      encontrados.push(produto);
      return; // não desce dentro de um produto (evita variações de cor duplicadas)
    }
    for (const valor of Object.values(no as Obj)) visitar(valor, profundidade + 1);
  };
  visitar(raiz, 0);
  return encontrados;
}

/** Remove duplicados (mesma URL) mantendo a ordem. */
export function deduplicar(produtos: Produto[]): Produto[] {
  const vistos = new Set<string>();
  return produtos.filter((p) => {
    const chave = p.url.match(/-p-(\d+)/)?.[1] ?? p.url;
    if (vistos.has(chave)) return false;
    vistos.add(chave);
    return true;
  });
}

/** Indícios de página de verificação/captcha no HTML ou na URL. */
export function pareceBloqueio(url: string, html = ""): boolean {
  if (/\/risk\/(challenge|verify)|captcha/i.test(url)) return true;
  return /captcha_type|anti_crawler|geetest|verifique que você é humano|verify you are human/i.test(html);
}

/** Indícios de busca legítima sem resultados. */
export function pareceSemResultados(html: string): boolean {
  return /n[ãa]o encontramos|nenhum resultado|sem resultados|no results found/i.test(html);
}

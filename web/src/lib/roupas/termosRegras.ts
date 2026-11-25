/**
 * Gerador de buscas por regras (sem IA) do modo Roupas.
 *
 * Toda busca inclui o tipo de peça e, quando informado, o público, com
 * concordância de gênero ("calça wide leg linho feminina", "short jeans
 * feminino"). O meio do termo (modelagem, cor, tecido...) é cortado se
 * passar de 6 palavras; a peça e o público nunca saem.
 */
import { normalizarTermo } from "../links";
import type { BuscaSugerida, EntradaRoupas } from "../tipos";
import { extrairDetalhes, listar } from "../vestidos/termosRegras";
import { GENERO_PECA } from "./opcoes";

type Genero = "f" | "m";

/**
 * Adjetivos que mudam com o gênero da peça (forma masculina).
 * Inclui as cores que flexionam ("calça preta"); cores invariáveis como
 * rosa, vinho, bege, lilás e caramelo ficam de fora de propósito.
 */
const FLEXIVEIS = new Set([
  "básico", "estampado", "listrado", "alongado", "plissado", "térmico", "forrado", "romântico",
  "liso", "esportivo", "feminino", "masculino", "justo", "curto", "longo", "soltinho", "canelado",
  "acolchoado", "clássico",
  "preto", "branco", "vermelho", "amarelo", "roxo", "dourado", "colorido",
]);

/** Ajusta os adjetivos ao gênero da peça: "básico" → "básica" para blusa. */
export function concordar(texto: string, genero: Genero): string {
  return texto
    .split(" ")
    .map((palavra) => {
      const masculina = palavra.replace(/a$/, "o");
      if (!FLEXIVEIS.has(palavra) && !FLEXIVEIS.has(masculina)) return palavra;
      return genero === "f" ? masculina.replace(/o$/, "a") : masculina;
    })
    .join(" ");
}

/** Termo do público concordando com a peça. */
function termoPublico(publico: EntradaRoupas["publico"], genero: Genero): string | undefined {
  if (!publico) return undefined;
  if (publico === "feminino" || publico === "masculino") return concordar(publico, genero);
  return publico; // "unissex", "plus size"
}

/** Monta o termo: peça + meio + público, com no máximo 6 palavras. */
function montar(peca: string, publico: string | undefined, meio: (string | undefined)[], genero: Genero): string {
  const palavras = (t: string | undefined) => (t ? t.toLowerCase().split(/\s+/).filter(Boolean) : []);
  const fixas = palavras(peca).length + palavras(publico).length;
  const vistas = new Set([...palavras(peca), ...palavras(publico)].filter((p) => p.length >= 4));
  const doMeio: string[] = [];
  for (const parte of meio) {
    // cada parte é uma expressão ("ombro a ombro", "wide leg"): entra inteira ou não entra
    const novas = palavras(parte ? concordar(parte, genero) : undefined);
    if (!novas.length || novas.every((p) => p.length >= 4 && vistas.has(p))) continue; // já está no termo
    if (fixas + doMeio.length + novas.length > 6) continue;
    novas.filter((p) => p.length >= 4).forEach((p) => vistas.add(p));
    doMeio.push(...novas);
  }
  return normalizarTermo([peca, ...doMeio, publico ?? ""].join(" "));
}

/** Ocasiões → palavra de busca, título e explicação. */
const OCASIOES: { padrao: RegExp; termo: string; titulo: string; motivo: string }[] = [
  { padrao: /dia a dia|casual|passeio|faculdade|escola/, termo: "básico", titulo: "Para o dia a dia", motivo: "Peças básicas combinam com tudo e saem do armário toda semana." },
  { padrao: /trabalh|escrit[óo]rio|reuni|entrevista|est[áa]gio/, termo: "social", titulo: "Para o trabalho", motivo: "Um toque social deixa o look profissional sem perder o conforto." },
  { padrao: /academia|treino|corrida|esporte|yoga|pilates/, termo: "fitness", titulo: "Para treinar", motivo: "Tecidos com elastano acompanham o movimento." },
  { padrao: /viagem|f[ée]rias|turismo|aeroporto/, termo: "confortável", titulo: "Para viajar", motivo: "Peças confortáveis e que amassam pouco são ótimas na mala." },
  { padrao: /frio|inverno|neve|serra/, termo: "térmico", titulo: "Para o frio", motivo: "Peças térmicas e forradas seguram o calor do corpo." },
  { padrao: /praia|ver[ãa]o|piscina|calor/, termo: "leve", titulo: "Para o calor", motivo: "Tecidos leves e frescos deixam o calor mais gostoso." },
  { padrao: /balada|festa|noite|show|anivers/, termo: "brilho", titulo: "Para a balada", motivo: "Brilho e recortes chamam atenção à noite." },
  { padrao: /encontro|jantar|date/, termo: "elegante", titulo: "Para um encontro", motivo: "Um toque elegante para uma ocasião especial." },
];

/** Estilos → palavras que aparecem nos títulos da Shein. */
const ESTILOS: { padrao: RegExp; termo: string; motivo: string }[] = [
  { padrao: /b[áa]sic/, termo: "básico", motivo: "Peças básicas são coringas e combinam com tudo." },
  { padrao: /street|urban/, termo: "streetwear oversized", motivo: "Modelagem larguinha e atitude de rua." },
  { padrao: /social|formal|executiv/, termo: "social", motivo: "Cortes retos e tecidos estruturados passam seriedade." },
  { padrao: /vintage|retr[ôo]/, termo: "vintage retrô", motivo: "Detalhes retrô dão personalidade ao look." },
  { padrao: /esport|fitness|atl[ée]tic/, termo: "esportivo", motivo: "Conforto e liberdade de movimento." },
  { padrao: /casual|despojad/, termo: "casual", motivo: "Fácil de usar e confortável." },
  { padrao: /rom[âa]ntic|delicad/, termo: "romântico babado", motivo: "Babados e detalhes delicados deixam o look romântico." },
  { padrao: /minimal|clean|simples/, termo: "liso básico", motivo: "Peças lisas e de corte simples são a base do minimalismo." },
  { padrao: /elegant|chique|sofisticad/, termo: "elegante", motivo: "Cortes limpos e cores sóbrias passam elegância." },
  { padrao: /boho|hippie/, termo: "boho estampado", motivo: "Estampas e tecidos fluidos são a marca do boho." },
];

/** Três ideias por tipo de peça: [complemento do termo, título, explicação]. */
const IDEIAS: Record<string, [string, string, string][]> = {
  blusa: [["manga bufante", "Manga bufante", "A manga bufante deixa a blusa romântica e atual."], ["cetim", "De cetim", "O cetim dá um toque elegante e vai bem com calça ou saia."], ["ombro a ombro", "Ombro a ombro", "Valoriza o colo e fica leve no calor."]],
  camiseta: [["oversized", "Oversized", "Larguinha, confortável e combina com tudo."], ["básico algodão", "Básica de algodão", "Peça coringa para o dia a dia."], ["estampado", "Estampada", "Uma estampa dá personalidade ao look simples."]],
  camisa: [["linho", "De linho", "Fresca e elegante para os dias quentes."], ["social slim", "Social", "Ideal para o trabalho e ocasiões mais arrumadas."], ["oversized listrado", "Listrada oversized", "Larguinha e listrada: moderna e versátil."]],
  regata: [["canelado", "Canelada", "Básica, confortável e justinha."], ["cetim", "De cetim", "Vai bem com blazer ou saia para sair."], ["básico", "Básica", "Coringa para o calor e para usar por baixo."]],
  cropped: [["canelado", "Canelado", "Confortável e combina com cintura alta."], ["manga longa", "Manga longa", "Bom para a meia-estação."], ["amarração", "Com amarração", "A amarração dá um toque charmoso."]],
  calça: [["wide leg", "Wide leg", "A perna larga alonga a silhueta e é confortável."], ["alfaiataria", "Alfaiataria", "Deixa o look arrumado na hora."], ["cargo", "Cargo", "Bolsos e estilo despojado."]],
  jeans: [["mom", "Mom jeans", "Cintura alta e corte reto: confortável e atual."], ["wide leg", "Wide leg", "Perna larga que alonga a silhueta."], ["skinny", "Skinny", "Justinha, combina com blusas mais soltas."]],
  saia: [["midi plissado", "Midi plissada", "Elegante e com movimento."], ["jeans", "Jeans", "Coringa para o dia a dia."], ["longo fenda", "Longa com fenda", "Fluida e com charme."]],
  short: [["jeans cintura alta", "Jeans cintura alta", "O clássico do verão."], ["alfaiataria", "Alfaiataria", "Mais arrumado para o dia."], ["linho", "De linho", "Fresquinho para o calor."]],
  bermuda: [["jeans", "Jeans", "Básica e confortável."], ["ciclista", "Ciclista", "Justinha e esportiva."], ["alfaiataria", "Alfaiataria", "Mais arrumada para o dia a dia."]],
  macacão: [["longo", "Longo", "Uma peça só e o look está pronto."], ["jeans", "Jeans", "Despojado e cheio de estilo."], ["pantacourt", "Pantacourt", "Na altura da canela: fresco e elegante."]],
  conjunto: [["alfaiataria", "De alfaiataria", "Combinação pronta para trabalhar ou sair."], ["moletom", "De moletom", "Conforto total para o frio."], ["cropped saia", "Cropped e saia", "Look pronto para passeios e festas de dia."]],
  jaqueta: [["jeans", "Jeans", "Clássica e combina com tudo."], ["couro sintético", "Couro sintético", "Dá atitude ao look à noite."], ["bomber", "Bomber", "Esportiva e moderna."]],
  casaco: [["lã", "De lã", "Quentinho para os dias frios."], ["trench coat", "Trench coat", "Elegante e atemporal."], ["puffer", "Puffer", "Acolchoado e muito quente."]],
  blazer: [["alfaiataria", "Alfaiataria", "Deixa qualquer look mais arrumado."], ["oversized", "Oversized", "Moderno e fácil de combinar."], ["linho", "De linho", "Mais leve para dias quentes."]],
  moletom: [["com capuz", "Com capuz", "Clássico, quentinho e confortável."], ["oversized", "Oversized", "Larguinho e aconchegante."], ["careca", "Careca", "Gola redonda: básico e versátil."]],
  cardigã: [["tricô", "De tricô", "Quentinho e delicado."], ["cropped", "Cropped", "Combina com cintura alta."], ["alongado", "Alongado", "Elegante e aconchegante."]],
  suéter: [["tricô", "De tricô", "Quentinho para o inverno."], ["gola alta", "Gola alta", "Protege do frio com elegância."], ["listrado", "Listrado", "Clássico e cheio de estilo."]],
  colete: [["alfaiataria", "Alfaiataria", "Vai do trabalho ao passeio."], ["tricô", "De tricô", "Fica lindo sobre camisas."], ["puffer", "Puffer", "Aquece sem pesar."]],
};
// títulos neutros: servem para qualquer peça (inclusive as digitadas em "outra")
const IDEIAS_GENERICAS: [string, string, string][] = [
  ["básico", "Opção básica", "Uma opção coringa, fácil de combinar."],
  ["oversized", "Mais larguinha", "Modelagem oversized, solta e confortável."],
  ["estampado", "Com estampa", "Uma estampa dá mais personalidade."],
];

function capitalizar(texto: string): string {
  return texto ? texto[0]!.toUpperCase() + texto.slice(1) : texto;
}

/** Nome da peça para a busca, gênero gramatical e público concordando ("calça", "f", "feminina"). */
export function pecaEPublico(entrada: EntradaRoupas): { peca: string; genero: Genero; publico: string | undefined } {
  const { tipoPeca, tipoOutro } = entrada;
  // "jeans" vira "calça jeans"; "outra" usa o que a pessoa escreveu
  const peca = tipoPeca === "outra" ? normalizarTermo(tipoOutro ?? "roupa") || "roupa" : tipoPeca === "jeans" ? "calça jeans" : tipoPeca;
  const genero: Genero = tipoPeca === "jeans" ? "f" : (GENERO_PECA[tipoPeca] ?? (/a$/.test(peca.split(" ")[0]!) ? "f" : "m"));
  return { peca, genero, publico: termoPublico(entrada.publico, genero) };
}

/** Garante que um termo (vindo da IA, por exemplo) tenha a peça e o público. */
export function garantirPecaEPublico(termo: string, entrada: EntradaRoupas): string {
  const { peca, genero, publico } = pecaEPublico(entrada);
  const tem = (t: string) => ` ${termo} `.includes(` ${t.split(" ")[0]} `);
  const meio = termo.split(" ").filter((p) => !` ${peca} ${publico ?? ""} `.includes(` ${p} `));
  if (tem(peca) && (!publico || tem(publico))) return normalizarTermo(termo);
  return montar(peca, publico, meio, genero);
}

export function gerarBuscasRoupas(entrada: EntradaRoupas): BuscaSugerida[] {
  const { tipoPeca, ocasiao, estilo, tecido, observacoes } = entrada;
  const { peca, genero, publico: pub } = pecaEPublico(entrada);

  const cores = [...new Set((entrada.cor ?? "").split(",").map((c) => c.trim().toLowerCase()).filter(Boolean))];
  const corN = (i: number) => (cores.length ? cores[i % cores.length] : undefined);
  const modelagens = (entrada.modelagem ?? "").split(",").map((m) => m.trim().toLowerCase()).filter(Boolean);
  const detalhes = extrairDetalhes(observacoes).slice(0, 2);
  const perfilOcasiao = ocasiao ? OCASIOES.find((o) => o.padrao.test(ocasiao.toLowerCase())) : undefined;
  const perfilEstilo = estilo ? ESTILOS.find((e) => e.padrao.test(estilo.toLowerCase())) : undefined;
  const pedidos = [modelagens[0], cores[0], tecido].filter((v): v is string => Boolean(v));
  const t = (meio: (string | undefined)[]) => montar(peca, pub, meio, genero);

  const candidatas: BuscaSugerida[] = [
    {
      termo: pedidos.length || detalhes.length ? t([modelagens[0], tecido, cores[0], detalhes[0]]) : "",
      titulo: "Do jeito que você descreveu",
      motivo: pedidos.length ? `Junta ${listar(pedidos)}, como você pediu.` : "Junta os detalhes que você contou.",
    },
    {
      termo: ocasiao ? t([perfilOcasiao?.termo ?? normalizarTermo(ocasiao).split(" ").slice(0, 2).join(" ")]) : "",
      titulo: perfilOcasiao?.titulo ?? `Para ${ocasiao}`,
      motivo: perfilOcasiao?.motivo ?? `Pensado para ${ocasiao}.`,
    },
    ...cores.slice(1, 4).map((c) => ({
      termo: t([c, modelagens[0]]),
      titulo: `Em ${c}`,
      motivo: `Outra cor que você escolheu: ${c}.`,
    })),
    {
      termo: estilo ? t([perfilEstilo?.termo ?? estilo, corN(1)]) : "",
      titulo: `Estilo ${estilo ?? ""}`.trim(),
      motivo: perfilEstilo?.motivo ?? "Prioriza o estilo que você indicou.",
    },
    {
      termo: modelagens[1] ? t([modelagens[1], corN(2)]) : "",
      titulo: capitalizar(modelagens[1] ?? ""),
      motivo: "Outra modelagem que você escolheu.",
    },
    {
      termo: tecido ? t([tecido, perfilEstilo?.termo.split(" ")[0]]) : "",
      titulo: `Em ${tecido ?? ""}`.trim(),
      motivo: `Mostra opções em ${tecido?.toLowerCase() ?? ""}.`,
    },
    {
      termo: detalhes.length ? t(detalhes) : "",
      titulo: "Do jeito das suas observações",
      motivo: `Leva em conta o que você escreveu: ${listar(detalhes)}.`,
    },
    ...(IDEIAS[tipoPeca] ?? IDEIAS_GENERICAS).map(([complemento, titulo, motivo], i) => ({
      termo: t([corN(i), complemento]),
      titulo,
      motivo,
    })),
  ];

  // garante pelo menos 5 buscas: peça + público e variações coringa
  const reservas: BuscaSugerida[] = [
    { termo: t([]), titulo: "Todas as opções", motivo: `Uma busca ampla por ${[peca, pub].filter(Boolean).join(" ")}.` },
    ...IDEIAS_GENERICAS.map(([complemento, titulo, motivo]) => ({ termo: t([complemento]), titulo, motivo })),
  ];

  const assinatura = (termo: string) => termo.split(" ").sort().join(" ");
  const vistos = new Set<string>();
  const buscas: BuscaSugerida[] = [];
  for (const b of [...candidatas, ...reservas]) {
    if (!b.termo || vistos.has(assinatura(b.termo))) continue;
    if (buscas.length >= 5 && reservas.includes(b)) break;
    vistos.add(assinatura(b.termo));
    buscas.push(b);
    if (buscas.length === 8) break;
  }
  return buscas;
}

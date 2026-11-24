/**
 * Gerador de buscas por regras (sem IA).
 *
 * Usado quando a API da Anthropic não está configurada ou falha, e também
 * no navegador caso a própria API do app fique fora do ar. Garante que o
 * usuário sempre receba alguma resposta.
 */
import { contarPalavras, normalizarTermo } from "./links";
import type { BuscaSugerida, Entrada } from "./tipos";

interface PerfilOcasiao {
  /** Palavras que descrevem a ocasião numa busca. */
  chave: string;
  /** Combinações típicas para essa ocasião: [complemento do termo, título, motivo]. */
  ideias: [string, string, string][];
}

const PERFIS: { padrao: RegExp; perfil: PerfilOcasiao }[] = [
  // ocasiões mais específicas primeiro (ex.: "madrinha de casamento" antes de "casamento")
  {
    padrao: /madrinha/,
    perfil: {
      chave: "madrinha casamento",
      ideias: [
        ["longo madrinha elegante", "Longo para madrinha", "Madrinhas costumam usar longos elegantes, combinando entre si."],
        ["longo cetim madrinha", "Cetim para madrinha", "O cetim dá um caimento nobre e fica lindo nas fotos do altar."],
        ["longo tule madrinha", "Tule leve", "O tule traz leveza e movimento para a cerimônia."],
      ],
    },
  },
  {
    padrao: /noivado/,
    perfil: {
      chave: "noivado elegante",
      ideias: [
        ["midi elegante festa", "Midi elegante", "O noivado pede um visual elegante, mas sem a formalidade do casamento."],
        ["midi branco renda", "Branco com renda", "Se a noiva for você, branco e renda são a escolha clássica."],
        ["longo fluido elegante", "Longo fluido", "Um longo fluido é sofisticado e confortável para a festa."],
      ],
    },
  },
  {
    padrao: /ch[áa] (de )?(beb[êe]|revela[çc][ãa]o|fralda|panela|cozinha|lingerie)/,
    perfil: {
      chave: "chá de bebê",
      ideias: [
        ["midi floral delicado", "Floral delicado", "Florais delicados combinam com o clima leve de um chá."],
        ["midi tons pastel", "Tons pastel", "Cores suaves são a cara de chá de bebê e chá revelação."],
        ["soltinho manga bufante", "Soltinho com manga", "Modelos soltinhos são confortáveis para passar a tarde."],
      ],
    },
  },
  {
    padrao: /r[ée]veillon|ano novo|virada/,
    perfil: {
      chave: "réveillon branco",
      ideias: [
        ["branco réveillon", "Branco para a virada", "O branco é a tradição do Ano Novo no Brasil."],
        ["branco renda", "Branco com renda", "A renda deixa o branco mais especial para a festa."],
        ["dourado brilho festa", "Brilho dourado", "Dourado e brilho combinam com a celebração da virada."],
      ],
    },
  },
  {
    padrao: /junina|julina|arrai[áa]|s[ãa]o jo[ãa]o/,
    perfil: {
      chave: "festa junina",
      ideias: [
        ["xadrez festa junina", "Xadrez", "O xadrez é o clássico das festas juninas."],
        ["floral babado caipira", "Floral com babado", "Babados e florais dão o toque caipira sem fantasia."],
        ["xadrez manga bufante", "Xadrez com manga bufante", "A manga bufante deixa o xadrez mais charmoso."],
      ],
    },
  },
  {
    padrao: /carnaval|bloco/,
    perfil: {
      chave: "carnaval",
      ideias: [
        ["curto brilho paetê", "Brilho e paetê", "Paetê e brilho são a cara do carnaval."],
        ["curto colorido estampado", "Colorido", "Cores fortes e estampas combinam com a folia."],
        ["curto soltinho leve", "Leve e soltinho", "Tecidos leves ajudam a aguentar o calor do bloco."],
      ],
    },
  },
  {
    padrao: /festival|show|rock in rio|lollapalooza/,
    perfil: {
      chave: "festival boho",
      ideias: [
        ["boho estampado curto", "Boho", "O estilo boho é o clássico dos festivais."],
        ["jeans casual curto", "Jeans", "Vestido jeans é prático e combina com tênis e bota."],
        ["preto casual soltinho", "Pretinho casual", "O preto soltinho é confortável e vai bem em qualquer show."],
      ],
    },
  },
  {
    padrao: /viagem|passeio|turismo|f[ée]rias/,
    perfil: {
      chave: "casual viagem",
      ideias: [
        ["midi malha confortável", "Malha confortável", "A malha não amassa na mala e é confortável para andar."],
        ["soltinho estampado casual", "Estampado soltinho", "Estampas disfarçam amassados e combinam com tênis."],
        ["chemise linho", "Chemise", "O chemise é versátil: vai do passeio ao jantar."],
      ],
    },
  },
  {
    padrao: /casamento.*(noite|noturno)|noite.*casamento/,
    perfil: {
      chave: "festa noite",
      ideias: [
        ["longo cetim festa", "Longo de cetim", "Cetim e comprimento longo são a escolha clássica para casamentos à noite."],
        ["longo fenda elegante", "Longo com fenda", "A fenda deixa o longo mais leve para dançar sem perder a elegância."],
        ["midi brilho festa", "Midi com brilho", "Um toque de brilho funciona bem à noite sem roubar a cena dos noivos."],
      ],
    },
  },
  {
    padrao: /casamento/,
    perfil: {
      chave: "convidada casamento",
      ideias: [
        ["midi floral convidada", "Midi floral", "Estampas florais e comprimento midi são ideais para casamentos durante o dia."],
        ["midi tons pastel", "Tons pastel", "Cores suaves combinam com a luz do dia e evitam o branco da noiva."],
        ["longo leve fluido", "Longo fluido", "Tecidos leves deixam o longo confortável em cerimônias de dia."],
      ],
    },
  },
  {
    padrao: /formatura|baile/,
    perfil: {
      chave: "formatura",
      ideias: [
        ["longo formatura elegante", "Longo para formatura", "Formatura pede um visual marcante, e o longo é o mais tradicional."],
        ["longo brilho festa", "Longo com brilho", "Brilho e paetê aparecem bem nas fotos da festa."],
        ["midi festa sofisticado", "Midi sofisticado", "O midi é uma alternativa elegante para colação e jantar."],
      ],
    },
  },
  {
    padrao: /trabalho|escrit[óo]rio|reuni[ãa]o|entrevista/,
    perfil: {
      chave: "trabalho",
      ideias: [
        ["midi social trabalho", "Midi social", "Comprimento midi e corte social funcionam bem no ambiente profissional."],
        ["alfaiataria elegante", "Alfaiataria", "Tecidos estruturados passam seriedade sem perder o estilo."],
        ["chemise manga", "Chemise", "O vestido chemise é prático, confortável e adequado para o dia a dia de trabalho."],
      ],
    },
  },
  {
    padrao: /praia|piscina|ver[ãa]o|resort/,
    perfil: {
      chave: "praia",
      ideias: [
        ["praia leve verão", "Leve para praia", "Tecidos leves e soltinhos são confortáveis no calor."],
        ["longo boho praia", "Longo boho", "O estilo boho é a cara da praia e fica lindo em fotos ao ar livre."],
        ["curto linho verão", "Curto de linho", "Linho é fresco e combina com dias quentes."],
      ],
    },
  },
  {
    padrao: /jantar|encontro|date/,
    perfil: {
      chave: "jantar elegante",
      ideias: [
        ["slip dress cetim", "Slip dress", "O slip dress de cetim é elegante e versátil para um jantar."],
        ["midi elegante jantar", "Midi elegante", "O midi equilibra charme e conforto para uma noite à mesa."],
        ["curto preto elegante", "Pretinho básico", "O pretinho é a aposta segura para jantares."],
      ],
    },
  },
  {
    padrao: /batizado|missa|igreja|religios/,
    perfil: {
      chave: "batizado",
      ideias: [
        ["midi delicado manga", "Midi delicado", "Cerimônias religiosas pedem um visual mais discreto, com mangas e comprimento midi."],
        ["midi floral delicado", "Floral delicado", "Florais suaves combinam com cerimônias de dia em família."],
        ["longo leve manga", "Longo com manga", "O longo leve com manga é elegante e respeitoso para a igreja."],
      ],
    },
  },
  {
    padrao: /festa|anivers[áa]rio|balada/,
    perfil: {
      chave: "festa",
      ideias: [
        ["curto festa brilho", "Curto com brilho", "Vestidos curtos com brilho são clássicos de festa."],
        ["midi festa elegante", "Midi de festa", "O midi é elegante e confortável para curtir a festa."],
        ["festa cetim decote", "Cetim com decote", "Cetim e decote marcante dão um ar sofisticado."],
      ],
    },
  },
  {
    padrao: /dia a dia|casual|passeio|faculdade/,
    perfil: {
      chave: "casual",
      ideias: [
        ["casual dia a dia", "Casual", "Modelos casuais são práticos para usar várias vezes."],
        ["midi malha confortável", "Malha confortável", "A malha é confortável e fácil de combinar."],
        ["curto soltinho casual", "Curto soltinho", "O vestido soltinho é fresco e combina com tênis ou sandália."],
      ],
    },
  },
];

const PERFIL_GENERICO: PerfilOcasiao = {
  chave: "",
  ideias: [
    ["midi elegante", "Midi elegante", "O midi é versátil e funciona em muitas ocasiões."],
    ["longo fluido", "Longo fluido", "Um longo fluido é elegante e confortável."],
    ["curto estiloso", "Curto estiloso", "Uma opção mais curta e descontraída."],
  ],
};

/**
 * Estilos descritos pela pessoa → palavras que aparecem em títulos da Shein.
 * [padrão, palavras para a busca, explicação]
 */
const ESTILOS: [RegExp, string, string][] = [
  [/rom[âa]ntic|delicad|fofo|meig|princesa/, "floral babado", "Babados e florais dão o ar romântico que você quer."],
  [/minimalist|b[áa]sic|clean|simples|neutro/, "liso básico", "Peças lisas e de corte simples são a base do estilo minimalista."],
  [/sexy|sensual|ousad|provocante/, "fenda decote", "Fenda e decote valorizam o corpo com um toque ousado."],
  [/boho|hippie|bo[êe]mi|natureba/, "boho estampado", "Estampas e tecidos fluidos são a marca do estilo boho."],
  [/elegant|sofisticad|chique|chic|cl[áa]ssic|requintad/, "elegante liso", "Cortes limpos e cores sóbrias passam elegância."],
  [/vintage|retr[ôo]|anos (50|60|70|80|90)/, "vintage retrô", "Detalhes retrô deixam o visual com personalidade."],
  [/casual|despojad|confort/, "casual soltinho", "Modelos soltinhos são confortáveis e fáceis de usar."],
  [/moderno|fashion|tend[êe]ncia|diferente/, "assimétrico moderno", "Recortes assimétricos deixam o visual atual."],
  [/g[óo]tic|dark|rock|punk/, "preto renda", "Preto e renda combinam com um estilo mais dark."],
  [/tropical|praian|ver[ãa]o/, "estampa tropical", "Estampas tropicais trazem o clima de verão."],
];

/**
 * Detalhes que a pessoa pode citar nas observações → termos de busca da Shein.
 * A ordem importa: padrões mais específicos vêm antes dos genéricos.
 */
const DETALHES: [RegExp, string][] = [
  [/sem mangas?|regata|alcinhas?/, "sem manga"],
  [/manga (comprida|longa)/, "manga longa"],
  [/manga curta/, "manga curta"],
  [/bufante/, "manga bufante"],
  [/ombro a ombro|ciganinha/, "ombro a ombro"],
  [/um ombro s[óo]|ombro s[óo]|assim[ée]tric/, "um ombro"],
  [/tomara que caia/, "tomara que caia"],
  [/frente [úu]nica/, "frente única"],
  [/decote (em )?v\b/, "decote v"],
  [/decote (de )?cora[çc][ãa]o/, "decote coração"],
  [/decote quadrado/, "decote quadrado"],
  [/gola alta|sem decote|fechad/, "gola alta"],
  [/costas? (abertas?|nuas?|de fora)|decote nas costas/, "costas abertas"],
  [/fenda/, "fenda"],
  [/babados?/, "babado"],
  [/la[çc]o|amarra[çc][ãa]o/, "laço"],
  [/renda/, "renda"],
  [/plissad/, "plissado"],
  [/transpassad|envelope|tran[çc]ad/, "transpassado"],
  [/bolsos?/, "com bolso"],
  [/cinto/, "com cinto"],
  [/brilho|paet[êe]|lantejoula|glitter/, "brilho"],
  [/barriga|disfar[çc]|solt[oa]|larg[oa]|n[ãa]o marque/, "evasê"],
  [/suti[ãa]|alça larga/, "alça larga"],
  [/just[oa]|colad[oa]|marcando o corpo|marque o corpo/, "justo"],
  [/cintura (marcada|alta|fina)/, "cintura marcada"],
  [/estampad|estampa/, "estampado"],
  [/\bliso\b|sem estampa/, "liso"],
  [/transparen/, "transparente"],
];

/** Palavras de negação logo antes de um detalhe ("não quero fenda", "nada de babado"). */
const NEGACAO = /\b(n[ãa]o|nada de|nem|evitar|evite|odeio|sem)\b[^,.;]{0,15}$/;

function extrairDetalhes(texto: string | undefined): string[] {
  if (!texto) return [];
  const minusculo = texto.toLowerCase();
  const encontrados: string[] = [];
  for (const [padrao, termo] of DETALHES) {
    const achado = padrao.exec(minusculo);
    if (!achado) continue;
    // ignora detalhes negados logo antes ("não quero fenda")
    const antes = minusculo.slice(Math.max(0, achado.index - 20), achado.index);
    if (NEGACAO.test(antes)) continue;
    if (!encontrados.includes(termo)) encontrados.push(termo);
  }
  return encontrados;
}

function estiloDaPessoa(estilo: string | undefined): { termo: string; motivo: string } | null {
  if (!estilo) return null;
  const texto = estilo.toLowerCase();
  const achado = ESTILOS.find(([padrao]) => padrao.test(texto));
  return achado ? { termo: achado[1], motivo: achado[2] } : null;
}

/** Comprimento sugerido nas observações quando a pessoa não escolheu um. */
function comprimentoDasObservacoes(texto: string | undefined): string | undefined {
  if (!texto) return undefined;
  const t = texto.toLowerCase();
  if (/n[ãa]o (muito )?curto|abaixo do joelho|na canela/.test(t)) return "midi";
  if (/at[ée] o p[ée]|bem longo|arrastando/.test(t)) return "longo";
  if (/acima do joelho|curtinho/.test(t)) return "curto";
  return undefined;
}

/** Junta itens numa frase: "a", "a e b", "a, b e c". */
function listar(itens: string[]): string {
  if (itens.length <= 1) return itens[0] ?? "";
  return `${itens.slice(0, -1).join(", ")} e ${itens.at(-1)}`;
}

function perfilDaOcasiao(ocasiao: string): PerfilOcasiao {
  const texto = ocasiao.toLowerCase();
  return PERFIS.find((p) => p.padrao.test(texto))?.perfil ?? PERFIL_GENERICO;
}

/**
 * Se a pessoa escolheu um comprimento, troca o comprimento sugerido pela ideia
 * (ex.: "longo leve fluido" vira "midi leve fluido" quando o pedido é midi).
 */
function respeitarComprimento(texto: string, comprimento: string | undefined, maiuscula = false): string {
  if (!comprimento) return texto;
  return texto.replace(/\b(curto|midi|longo)\b/gi, (achado) => {
    const primeiraMaiuscula = maiuscula && achado[0] === achado[0]?.toUpperCase();
    return primeiraMaiuscula ? comprimento[0]!.toUpperCase() + comprimento.slice(1) : comprimento;
  });
}

function juntar(...partes: (string | undefined)[]): string {
  // remove palavras repetidas (ex.: "longo" vindo do comprimento e da ideia),
  // mas só as de 4+ letras, para não quebrar expressões como "dia a dia"
  const palavras = ["vestido", ...partes.filter(Boolean)]
    .join(" ")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
  const vistas = new Set<string>();
  const unicas = palavras.filter((p) => {
    if (p.length < 4) return true;
    if (vistas.has(p)) return false;
    vistas.add(p);
    return true;
  });
  // normalizarTermo corta em 6 palavras depois de tirar as repetidas
  return normalizarTermo(unicas.join(" "));
}

export function gerarBuscasPorRegras(entrada: Entrada): BuscaSugerida[] {
  const { cor, tecido, decoteManga, estilo, tamanho, observacoes, ocasiao } = entrada;
  const comprimento = entrada.comprimento ?? comprimentoDasObservacoes(observacoes);
  const perfil = perfilDaOcasiao(ocasiao);
  const plus = tamanho === "Plus size" ? "plus size" : undefined;
  const ocasiaoCurta = normalizarTermo(ocasiao).split(" ").slice(0, 3).join(" ");
  const estiloTraduzido = estiloDaPessoa(estilo);
  const detalhesObs = extrairDetalhes(observacoes).slice(0, 2);
  const detalhesModelo = extrairDetalhes(decoteManga).slice(0, 2);
  const pedidos = [comprimento, cor, tecido].filter((v): v is string => Boolean(v));

  const candidatas: BuscaSugerida[] = [
    {
      // só existe se a pessoa descreveu alguma característica
      termo: pedidos.length || detalhesObs.length ? juntar(plus, comprimento, cor, tecido, detalhesObs[0]) : "",
      titulo: "Do jeito que você descreveu",
      motivo: pedidos.length
        ? `Junta ${listar(pedidos)}, como você pediu para ${ocasiao}.`
        : `Junta as características que você pediu para ${ocasiao}.`,
    },
    {
      termo: juntar(plus, comprimento, perfil.chave || ocasiaoCurta),
      titulo: "Pensado para a ocasião",
      motivo: `Foca no que costuma funcionar bem para ${ocasiao}.`,
    },
    {
      // estilo traduzido para termos da Shein ("romântico" → "floral babado")
      termo: estiloTraduzido
        ? juntar(plus, comprimento, estiloTraduzido.termo, cor)
        : juntar(plus, estilo, cor, comprimento),
      titulo: estilo ? `Estilo ${estilo}` : "Na cor escolhida",
      motivo: estiloTraduzido?.motivo ?? "Prioriza o estilo e a cor que você indicou.",
    },
    {
      // detalhes tirados das observações ("quero manga e que disfarce a barriga")
      termo: detalhesObs.length ? juntar(plus, comprimento, ...detalhesObs) : "",
      titulo: "Do jeito das suas observações",
      motivo: `Leva em conta o que você escreveu: ${listar(detalhesObs)}.`,
    },
    {
      termo: juntar(plus, detalhesModelo.length ? detalhesModelo.join(" ") : decoteManga, comprimento, cor),
      titulo: decoteManga ? "Decote e manga do seu jeito" : "Variação de modelo",
      motivo: decoteManga
        ? `Destaca o recorte que você descreveu: ${decoteManga.toLowerCase()}.`
        : "Destaca o recorte e o caimento que você descreveu.",
    },
    {
      termo: juntar(plus, tecido, estiloTraduzido?.termo.split(" ")[0] ?? estilo, perfil.chave),
      titulo: tecido ? `Em ${tecido}` : "Outra combinação",
      motivo: tecido
        ? `Mostra opções em ${tecido.toLowerCase()} que combinam com a ocasião.`
        : "Explora o tecido e o estilo para dar outras opções.",
    },
    ...perfil.ideias.map(([complemento, titulo, motivo]) => ({
      termo: juntar(plus, cor, respeitarComprimento(complemento, comprimento)),
      titulo: respeitarComprimento(titulo, comprimento, true),
      motivo,
    })),
  ];

  // remove termos curtos demais (menos de 3 palavras) e repetidos;
  // "vestido longo azul" e "vestido azul longo" contam como a mesma busca
  const assinatura = (termo: string) => termo.split(" ").sort().join(" ");
  // busca curta demais ("vestido brilho") ganha a palavra da ocasião: "vestido brilho festa"
  const completar = (termo: string) => {
    if (!termo || contarPalavras(termo) >= 3) return termo;
    const comOcasiao = juntar(termo.replace(/^vestido\s*/, ""), perfil.chave);
    return contarPalavras(comOcasiao) >= 3 ? comOcasiao : juntar(comOcasiao.replace(/^vestido\s*/, ""), "elegante");
  };
  const vistos = new Set<string>();
  const buscas: BuscaSugerida[] = [];
  for (const candidata of candidatas) {
    const busca = { ...candidata, termo: completar(candidata.termo) };
    if (contarPalavras(busca.termo) < 3 || vistos.has(assinatura(busca.termo))) continue;
    vistos.add(assinatura(busca.termo));
    buscas.push(busca);
    if (buscas.length === 8) break;
  }

  // garante pelo menos 5 buscas, completando com ideias genéricas
  for (const [complemento, titulo, motivo] of PERFIL_GENERICO.ideias) {
    if (buscas.length >= 5) break;
    const termo = juntar(plus, respeitarComprimento(complemento, comprimento));
    if (!vistos.has(assinatura(termo)) && contarPalavras(termo) >= 3) {
      vistos.add(assinatura(termo));
      buscas.push({ termo, titulo: respeitarComprimento(titulo, comprimento, true), motivo });
    }
  }
  return buscas;
}

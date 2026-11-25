/**
 * Guia de tecidos: o que é cada um, como é ao toque, para que ocasiões serve
 * e o que observar. Pensado para quem não conhece os nomes dos tecidos.
 *
 * As escalas vão de 1 a 5 e aparecem como bolinhas na ficha do tecido.
 */
import { useId, type ReactNode } from "react";

export interface Tecido {
  nome: string;
  /** Frase curtinha que aparece no cartão. */
  resumo: string;
  /** Como é ao toque e à vista. */
  toque: string;
  idealPara: string;
  atencao: string;
  /** 1 = fosco, 5 = muito brilhante */
  brilho: number;
  /** 1 = estruturado (fica no lugar), 5 = fluido (cai solto) */
  caimento: number;
  /** 1 = fresquinho, 5 = quentinho */
  temperatura: number;
  /** 1 = não estica, 5 = estica bastante */
  elasticidade: number;
}

export const TECIDOS: Tecido[] = [
  {
    nome: "cetim",
    resumo: "liso, brilhante e fluido",
    toque: "Liso e escorregadio, com brilho de um lado e fosco do outro. Escorre pelo corpo.",
    idealPara: "festas à noite, casamentos, formaturas e jantares especiais",
    atencao: "Marca o corpo e mostra amassados. Na Shein costuma ser poliéster acetinado, não seda pura.",
    brilho: 5, caimento: 4, temperatura: 3, elasticidade: 2,
  },
  {
    nome: "chiffon",
    resumo: "leve, transparente e esvoaçante",
    toque: "Fininho, levemente áspero e quase transparente. Balança com o vento, por isso costuma ter forro.",
    idealPara: "festas de dia, madrinhas, vestidos longos e praia",
    atencao: "É delicado e desfia com facilidade. Confira se a peça tem forro.",
    brilho: 2, caimento: 5, temperatura: 1, elasticidade: 1,
  },
  {
    nome: "crepe",
    resumo: "fosco, encorpado e elegante",
    toque: "Levemente granulado e seco ao toque, sem brilho. Tem um caimento bonito e sóbrio.",
    idealPara: "trabalho, eventos formais, jantares e cerimônias",
    atencao: "Os mais finos podem marcar a roupa íntima.",
    brilho: 1, caimento: 3, temperatura: 3, elasticidade: 2,
  },
  {
    nome: "linho",
    resumo: "natural, fresco e com textura",
    toque: "Fios aparentes e um pouco irregulares, toque seco e rústico. Deixa o ar passar.",
    idealPara: "calor, praia, casamento de dia, almoços e viagens",
    atencao: "Amassa com facilidade, e isso faz parte do charme. Na Shein muitas peças são mistura ou \"efeito linho\".",
    brilho: 1, caimento: 2, temperatura: 1, elasticidade: 1,
  },
  {
    nome: "algodão",
    resumo: "macio, respirável e fácil de cuidar",
    toque: "Macio e fosco, parecido com uma camisa ou uma camiseta mais firme.",
    idealPara: "dia a dia, passeios e dias quentes",
    atencao: "Se for 100% algodão, pode encolher na primeira lavagem.",
    brilho: 1, caimento: 2, temperatura: 2, elasticidade: 1,
  },
  {
    nome: "viscose",
    resumo: "leve, molinha e fresquinha",
    toque: "Macia e geladinha ao toque. Cai solta, sem grudar no corpo.",
    idealPara: "verão, dia a dia e vestidos estampados",
    atencao: "Amassa e pode encolher. Lave com água fria e seque à sombra.",
    brilho: 2, caimento: 5, temperatura: 1, elasticidade: 1,
  },
  {
    nome: "malha",
    resumo: "elástica, confortável e prática",
    toque: "Como uma camiseta: macia, estica e volta ao lugar.",
    idealPara: "dia a dia, viagens e trabalho mais casual",
    atencao: "Abraça o corpo e marca mais as curvas.",
    brilho: 1, caimento: 3, temperatura: 2, elasticidade: 5,
  },
  {
    nome: "canelado",
    resumo: "malha com listrinhas em relevo",
    toque: "Malha macia com nervurinhas verticais em relevo. Estica bastante e veste justinho.",
    idealPara: "looks casuais, vestidos justos e meia-estação",
    atencao: "Fica bem colado ao corpo. Escolha o tamanho com atenção.",
    brilho: 1, caimento: 3, temperatura: 3, elasticidade: 5,
  },
  {
    nome: "tricô",
    resumo: "quentinho e aconchegante",
    toque: "Pontos de tricô aparentes, macio e mais grossinho.",
    idealPara: "inverno, dias frios e passeios",
    atencao: "Pode soltar bolinhas com o uso. Os mais finos podem marcar.",
    brilho: 1, caimento: 3, temperatura: 5, elasticidade: 4,
  },
  {
    nome: "tule",
    resumo: "redinha leve que dá volume",
    toque: "Uma redinha fina e transparente, usada em camadas para dar volume e leveza.",
    idealPara: "festas, formaturas, madrinhas e saias rodadas",
    atencao: "Sempre vem com forro. Pode enroscar em bijuterias.",
    brilho: 2, caimento: 3, temperatura: 1, elasticidade: 1,
  },
  {
    nome: "renda",
    resumo: "delicada e romântica",
    toque: "Desenhos vazados em relevo, geralmente florais, aplicados sobre um forro.",
    idealPara: "casamentos, noivados, batizados e ocasiões românticas",
    atencao: "As bordas podem enroscar. Prefira lavar à mão.",
    brilho: 1, caimento: 3, temperatura: 2, elasticidade: 2,
  },
  {
    nome: "laise",
    resumo: "algodão bordado com furinhos",
    toque: "Tecido leve com bordados vazados (furinhos) formando desenhos. Ar fresco e delicado.",
    idealPara: "dias quentes, réveillon, almoços e looks românticos de dia",
    atencao: "Os furinhos podem deixar a peça transparente. Veja se tem forro.",
    brilho: 1, caimento: 2, temperatura: 1, elasticidade: 1,
  },
  {
    nome: "veludo",
    resumo: "macio, encorpado e luxuoso",
    toque: "Pelinhos curtos e macios, com brilho profundo que muda com a luz.",
    idealPara: "festas no inverno, eventos à noite e fim de ano",
    atencao: "Esquenta bastante e marca onde foi amassado ou sentado.",
    brilho: 4, caimento: 4, temperatura: 5, elasticidade: 3,
  },
  {
    nome: "jeans",
    resumo: "firme, resistente e casual",
    toque: "Tecido grosso, com linhas diagonais aparentes. Fica bem no lugar.",
    idealPara: "passeios, festivais e dia a dia",
    atencao: "É mais firme. Os com elastano são bem mais confortáveis.",
    brilho: 1, caimento: 1, temperatura: 3, elasticidade: 2,
  },
  {
    nome: "paetê",
    resumo: "todo bordado com brilhos",
    toque: "Plaquinhas brilhantes costuradas sobre o tecido. Reflete muita luz.",
    idealPara: "réveillon, festas à noite, formaturas e carnaval",
    atencao: "Pode pinicar por dentro se não tiver forro, e é mais pesado.",
    brilho: 5, caimento: 3, temperatura: 3, elasticidade: 1,
  },
  // --- tecidos mais comuns em roupas do dia a dia ---
  {
    nome: "moletom",
    resumo: "macio, quentinho e confortável",
    toque: "Liso por fora e felpudo por dentro (flanelado). Abraça sem apertar.",
    idealPara: "dias frios, casa, viagens e looks esportivos",
    atencao: "Esquenta bastante, e os mais grossos dão volume.",
    brilho: 1, caimento: 2, temperatura: 5, elasticidade: 3,
  },
  {
    nome: "sarja",
    resumo: "firme, com linhas diagonais",
    toque: "Encorpado, com diagonais bem fininhas. Parece jeans, mas é mais leve e vem em várias cores.",
    idealPara: "calças, shorts, saias e jaquetas do dia a dia",
    atencao: "É firme. Com elastano fica bem mais confortável.",
    brilho: 1, caimento: 1, temperatura: 3, elasticidade: 2,
  },
  {
    nome: "alfaiataria",
    resumo: "estruturado e elegante",
    toque: "Liso, encorpado e de toque seco. Mantém o vinco e o formato da peça.",
    idealPara: "trabalho, reuniões, eventos e looks mais arrumados",
    atencao: "Amassa pouco, mas costuma pedir ferro de passar para ficar perfeito.",
    brilho: 1, caimento: 2, temperatura: 3, elasticidade: 2,
  },
  {
    nome: "couro sintético",
    resumo: "liso, com brilho e atitude",
    toque: "Imita couro: superfície lisa e um pouco brilhante. Não deixa o ar passar.",
    idealPara: "jaquetas, saias, calças e looks à noite",
    atencao: "Esquenta e não respira. Evite em dias muito quentes.",
    brilho: 4, caimento: 1, temperatura: 4, elasticidade: 1,
  },
];

const porNome = (nomes: string[]) => nomes.map((n) => TECIDOS.find((t) => t.nome === n)!);

/** Tecidos do modo Vestidos (mesma lista e ordem de sempre). */
export const TECIDOS_VESTIDOS = porNome([
  "cetim", "chiffon", "crepe", "linho", "algodão", "viscose", "malha", "canelado",
  "tricô", "tule", "renda", "laise", "veludo", "jeans", "paetê",
]);

/** Tecidos do modo Roupas (os que mais aparecem em peças do dia a dia). */
export const TECIDOS_ROUPAS = porNome([
  "algodão", "malha", "canelado", "moletom", "tricô", "jeans", "sarja",
  "alfaiataria", "linho", "viscose", "crepe", "cetim", "veludo", "couro sintético",
]);

export const ESCALAS: { chave: "brilho" | "caimento" | "temperatura" | "elasticidade"; rotulo: string; min: string; max: string }[] = [
  { chave: "brilho", rotulo: "Brilho", min: "fosco", max: "brilhante" },
  { chave: "caimento", rotulo: "Caimento", min: "estruturado", max: "fluido" },
  { chave: "temperatura", rotulo: "Temperatura", min: "fresquinho", max: "quentinho" },
  { chave: "elasticidade", rotulo: "Elasticidade", min: "não estica", max: "estica bem" },
];

// ---------------------------------------------------------------------------
// Amostras de textura em SVG

/** Desenha uma amostra quadrada da textura do tecido. */
export function AmostraTecido({ nome, className = "" }: { nome: string; className?: string }) {
  const id = useId().replace(/:/g, "");
  const p = (sufixo: string) => `${id}-${sufixo}`;
  let conteudo: ReactNode;

  switch (nome) {
    case "cetim":
      conteudo = (
        <>
          <defs>
            <linearGradient id={p("g")} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#e7bfc8" />
              <stop offset="0.35" stopColor="#fcf1f3" />
              <stop offset="0.55" stopColor="#dfaab6" />
              <stop offset="0.8" stopColor="#f7e3e7" />
              <stop offset="1" stopColor="#e3b5bf" />
            </linearGradient>
          </defs>
          <rect width="60" height="60" fill={`url(#${p("g")})`} />
          <path d="M-5 42 C 15 30, 30 46, 65 24" stroke="#fff" strokeOpacity="0.55" strokeWidth="5" fill="none" />
        </>
      );
      break;
    case "chiffon":
      conteudo = (
        <>
          <rect width="60" height="60" fill="#fcf5f6" />
          {[10, 24, 38, 52].map((y, i) => (
            <path key={y} d={`M-5 ${y} C 10 ${y - 9}, 25 ${y + 9}, 40 ${y} S 60 ${y - 6}, 70 ${y}`} stroke="#efc3cc" strokeOpacity={0.55 - i * 0.06} strokeWidth="9" fill="none" />
          ))}
        </>
      );
      break;
    case "crepe":
      conteudo = (
        <>
          <defs>
            <pattern id={p("p")} width="6" height="6" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1.5" r="0.7" fill="#cfc2b0" />
              <circle cx="4" cy="3.5" r="0.6" fill="#d8ccbc" />
              <circle cx="2.5" cy="5" r="0.5" fill="#f6f0e7" />
            </pattern>
          </defs>
          <rect width="60" height="60" fill="#e8dfd2" />
          <rect width="60" height="60" fill={`url(#${p("p")})`} />
        </>
      );
      break;
    case "linho":
      conteudo = (
        <>
          <defs>
            <pattern id={p("p")} width="7" height="7" patternUnits="userSpaceOnUse">
              <path d="M0 2 H7" stroke="#cbb994" strokeWidth="0.9" />
              <path d="M0 5.5 H7" stroke="#d9cba9" strokeWidth="0.6" />
              <path d="M3 0 V7" stroke="#f3ead8" strokeWidth="0.8" />
              <path d="M6 0 V7" stroke="#d2c29f" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="60" height="60" fill="#e6dac3" />
          <rect width="60" height="60" fill={`url(#${p("p")})`} />
          <path d="M0 17 H60 M0 41 H60" stroke="#c4b086" strokeWidth="1.3" strokeOpacity="0.6" />
        </>
      );
      break;
    case "algodão":
      conteudo = (
        <>
          <defs>
            <pattern id={p("p")} width="4" height="4" patternUnits="userSpaceOnUse">
              <path d="M0 0.5 H4 M0.5 0 V4" stroke="#e4dccd" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect width="60" height="60" fill="#f6f1e8" />
          <rect width="60" height="60" fill={`url(#${p("p")})`} />
        </>
      );
      break;
    case "viscose":
      conteudo = (
        <>
          <rect width="60" height="60" fill="#f1e3ec" />
          {[6, 18, 30, 42, 54].map((x) => (
            <path key={x} d={`M${x} -5 C ${x + 8} 15, ${x - 8} 35, ${x + 4} 65`} stroke="#e0c4d6" strokeWidth="3" fill="none" />
          ))}
        </>
      );
      break;
    case "malha":
      conteudo = (
        <>
          <defs>
            <pattern id={p("p")} width="6" height="6" patternUnits="userSpaceOnUse">
              <path d="M0.5 0.5 L3 5 L5.5 0.5" stroke="#cdc5da" strokeWidth="1" fill="none" strokeLinejoin="round" />
            </pattern>
          </defs>
          <rect width="60" height="60" fill="#e9e5ef" />
          <rect width="60" height="60" fill={`url(#${p("p")})`} />
        </>
      );
      break;
    case "canelado":
      conteudo = (
        <>
          <defs>
            <pattern id={p("p")} width="6" height="6" patternUnits="userSpaceOnUse">
              <rect width="3" height="6" fill="#dccbd4" />
              <rect x="3" width="0.8" height="6" fill="#f7eef2" />
            </pattern>
          </defs>
          <rect width="60" height="60" fill="#ece0e6" />
          <rect width="60" height="60" fill={`url(#${p("p")})`} />
        </>
      );
      break;
    case "tricô":
      conteudo = (
        <>
          <defs>
            <pattern id={p("p")} width="10" height="9" patternUnits="userSpaceOnUse">
              <path d="M1 0.5 C 1.5 5, 4 7, 5 8.5 C 6 7, 8.5 5, 9 0.5" stroke="#d6c2a5" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            </pattern>
          </defs>
          <rect width="60" height="60" fill="#efe3d2" />
          <rect width="60" height="60" fill={`url(#${p("p")})`} />
        </>
      );
      break;
    case "tule":
      conteudo = (
        <>
          <defs>
            <pattern id={p("p")} width="6" height="5.2" patternUnits="userSpaceOnUse">
              <path d="M1.5 0 L4.5 0 L6 2.6 L4.5 5.2 L1.5 5.2 L0 2.6 Z" stroke="#e5bfc8" strokeWidth="0.6" fill="none" />
            </pattern>
          </defs>
          <rect width="60" height="60" fill="#fcf4f5" />
          <rect width="60" height="60" fill={`url(#${p("p")})`} />
        </>
      );
      break;
    case "renda":
      conteudo = (
        <>
          <defs>
            <pattern id={p("p")} width="20" height="20" patternUnits="userSpaceOnUse">
              {[0, 72, 144, 216, 288].map((a) => (
                <ellipse key={a} cx="10" cy="5.5" rx="2.4" ry="4" stroke="#cdb8a3" strokeWidth="0.8" fill="none" transform={`rotate(${a} 10 10)`} />
              ))}
              <circle cx="10" cy="10" r="1.6" fill="#d9c7b5" />
              <circle cx="0" cy="0" r="2.2" stroke="#d9c7b5" strokeWidth="0.7" fill="none" />
              <circle cx="20" cy="20" r="2.2" stroke="#d9c7b5" strokeWidth="0.7" fill="none" />
              <path d="M0 20 Q 5 15 10 20 M10 0 Q 15 5 20 0" stroke="#e3d5c6" strokeWidth="0.6" fill="none" />
            </pattern>
          </defs>
          <rect width="60" height="60" fill="#f8f2ea" />
          <rect width="60" height="60" fill={`url(#${p("p")})`} />
        </>
      );
      break;
    case "laise":
      conteudo = (
        <>
          <defs>
            <pattern id={p("p")} width="14" height="14" patternUnits="userSpaceOnUse">
              <ellipse cx="7" cy="7" rx="2.2" ry="3" fill="#e7dccb" stroke="#d3c4ab" strokeWidth="0.8" />
              <ellipse cx="0" cy="0" rx="1.3" ry="1.8" fill="#e7dccb" stroke="#d3c4ab" strokeWidth="0.6" />
              <ellipse cx="14" cy="14" rx="1.3" ry="1.8" fill="#e7dccb" stroke="#d3c4ab" strokeWidth="0.6" />
              <path d="M3 11 Q 4.5 9.5 6 11 M8 3 Q 9.5 1.5 11 3" stroke="#dccfbb" strokeWidth="0.6" fill="none" />
            </pattern>
          </defs>
          <rect width="60" height="60" fill="#fdfaf4" />
          <rect width="60" height="60" fill={`url(#${p("p")})`} />
        </>
      );
      break;
    case "veludo":
      conteudo = (
        <>
          <defs>
            <radialGradient id={p("g")} cx="0.35" cy="0.3" r="0.9">
              <stop offset="0" stopColor="#a8445c" />
              <stop offset="0.55" stopColor="#7c2a40" />
              <stop offset="1" stopColor="#521729" />
            </radialGradient>
          </defs>
          <rect width="60" height="60" fill={`url(#${p("g")})`} />
          <path d="M-5 50 C 20 38, 35 56, 65 40" stroke="#c46a80" strokeOpacity="0.35" strokeWidth="6" fill="none" />
        </>
      );
      break;
    case "jeans":
      conteudo = (
        <>
          <defs>
            <pattern id={p("p")} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="2" height="4" fill="#4d6f9e" />
              <rect x="2" width="0.8" height="4" fill="#8aa8cf" />
            </pattern>
          </defs>
          <rect width="60" height="60" fill="#5e82b3" />
          <rect width="60" height="60" fill={`url(#${p("p")})`} />
        </>
      );
      break;
    case "paetê":
      conteudo = (
        <>
          <defs>
            <radialGradient id={p("g")} cx="0.35" cy="0.35" r="0.7">
              <stop offset="0" stopColor="#fff6d6" />
              <stop offset="0.5" stopColor="#e7c46e" />
              <stop offset="1" stopColor="#b88a2e" />
            </radialGradient>
            <pattern id={p("p")} width="8" height="7" patternUnits="userSpaceOnUse">
              <circle cx="4" cy="3.5" r="3.4" fill={`url(#${p("g")})`} stroke="#a77a26" strokeWidth="0.3" />
              <circle cx="0" cy="0" r="3.4" fill={`url(#${p("g")})`} stroke="#a77a26" strokeWidth="0.3" />
              <circle cx="8" cy="0" r="3.4" fill={`url(#${p("g")})`} stroke="#a77a26" strokeWidth="0.3" />
              <circle cx="0" cy="7" r="3.4" fill={`url(#${p("g")})`} stroke="#a77a26" strokeWidth="0.3" />
              <circle cx="8" cy="7" r="3.4" fill={`url(#${p("g")})`} stroke="#a77a26" strokeWidth="0.3" />
            </pattern>
          </defs>
          <rect width="60" height="60" fill="#c99b3f" />
          <rect width="60" height="60" fill={`url(#${p("p")})`} />
        </>
      );
      break;
    case "moletom":
      conteudo = (
        <>
          <defs>
            <pattern id={p("p")} width="5" height="5" patternUnits="userSpaceOnUse">
              <circle cx="1.2" cy="1.4" r="0.9" fill="#d5d9e2" />
              <circle cx="3.8" cy="3.6" r="0.8" fill="#eef0f5" />
            </pattern>
          </defs>
          <rect width="60" height="60" fill="#c9ced9" />
          <rect width="60" height="60" fill={`url(#${p("p")})`} />
          <rect y="44" width="60" height="16" fill="#bcc2cf" />
          <path d="M0 44 H60" stroke="#aeb5c4" strokeWidth="1.2" />
          {[4, 10, 16, 22, 28, 34, 40, 46, 52, 58].map((x) => (
            <path key={x} d={`M${x} 46 V58`} stroke="#b1b8c6" strokeWidth="1.4" />
          ))}
        </>
      );
      break;
    case "sarja":
      conteudo = (
        <>
          <defs>
            <pattern id={p("p")} width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
              <rect width="1.6" height="3" fill="#b8a77f" />
            </pattern>
          </defs>
          <rect width="60" height="60" fill="#cbbd96" />
          <rect width="60" height="60" fill={`url(#${p("p")})`} opacity="0.75" />
        </>
      );
      break;
    case "alfaiataria":
      conteudo = (
        <>
          <defs>
            <pattern id={p("p")} width="8" height="8" patternUnits="userSpaceOnUse">
              <path d="M0 4 L4 0 M4 8 L8 4" stroke="#7d8597" strokeWidth="0.9" />
              <path d="M0 4 L4 8 M4 0 L8 4" stroke="#9aa1b1" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect width="60" height="60" fill="#8e96a8" />
          <rect width="60" height="60" fill={`url(#${p("p")})`} />
          <path d="M30 0 V60" stroke="#c9cfdb" strokeWidth="0.8" strokeDasharray="2 2" />
        </>
      );
      break;
    case "couro sintético":
      conteudo = (
        <>
          <defs>
            <linearGradient id={p("g")} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#3a3236" />
              <stop offset="0.45" stopColor="#5a5055" />
              <stop offset="0.6" stopColor="#2d272a" />
              <stop offset="1" stopColor="#403739" />
            </linearGradient>
            <pattern id={p("p")} width="6" height="6" patternUnits="userSpaceOnUse">
              <path d="M0 3 Q 1.5 1.5 3 3 T 6 3" stroke="#000" strokeOpacity="0.18" strokeWidth="0.5" fill="none" />
            </pattern>
          </defs>
          <rect width="60" height="60" fill={`url(#${p("g")})`} />
          <rect width="60" height="60" fill={`url(#${p("p")})`} />
          <path d="M-5 20 C 15 12, 30 26, 65 10" stroke="#fff" strokeOpacity="0.22" strokeWidth="5" fill="none" />
        </>
      );
      break;
    default:
      conteudo = <rect width="60" height="60" fill="#efe7dc" />;
  }

  return (
    <svg viewBox="0 0 60 60" className={className} aria-hidden preserveAspectRatio="xMidYMid slice">
      {conteudo}
    </svg>
  );
}

/** Escala de 1 a 5 em bolinhas, com as pontas descritas em palavras. */
export function Escala({ rotulo, valor, min, max }: { rotulo: string; valor: number; min: string; max: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium">{rotulo}</span>
        <span className="sr-only">
          {valor} de 5, de {min} a {max}
        </span>
      </div>
      <div className="mt-1.5 flex gap-1.5" aria-hidden>
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={"h-2 flex-1 rounded-full " + (n <= valor ? "bg-destaque" : "bg-borda")} />
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-texto-suave" aria-hidden>
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

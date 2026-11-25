/**
 * Guia de trajes (dress codes) usados em convites no Brasil, do mais
 * descontraído ao mais formal. Conteúdo fixo, sem IA.
 * O "nome" também entra na ocasião da busca ("casamento à noite, traje passeio completo"),
 * e o gerador por regras (lib/vestidos/termosRegras.ts) reconhece cada um.
 */

export interface Traje {
  id: string;
  nome: string;
  /** Uma linha: o que o traje pede. */
  resumo: string;
  /** Onde costuma aparecer. */
  quando: string;
  /** Como se vestir, pensando em vestido. */
  como: string;
  evite: string;
  /** 1 (mais descontraído) a 5 (mais formal). */
  formalidade: number;
}

export const TRAJES: Traje[] = [
  {
    id: "casual",
    nome: "esporte",
    resumo: "Confortável e descontraído.",
    quando: "Churrascos, almoços em família, aniversários em casa ou ao ar livre.",
    como: "Vestido de malha, chemise, jeans ou soltinho estampado, com tênis, rasteirinha ou sandália baixa.",
    evite: "Brilho, paetê e tecidos de festa, como cetim e tule.",
    formalidade: 1,
  },
  {
    id: "praia",
    nome: "praia",
    resumo: "Leve e fresco, para a areia e o calor.",
    quando: "Casamentos pé na areia, festas em resort e eventos ao ar livre no verão.",
    como: "Midi ou longo fluido, em linho, viscose ou chiffon, com rasteira ou anabela.",
    evite: "Salto fino (afunda na areia), cetim pesado e tecidos que esquentam.",
    formalidade: 2,
  },
  {
    id: "esporte-fino",
    nome: "esporte fino",
    resumo: "Arrumado, mas sem formalidade.",
    quando: "Aniversários, almoços especiais, eventos de empresa e casamentos de dia mais simples.",
    como: "Midi ou curto elegante (na altura do joelho), em crepe, linho ou viscose, com sandália ou scarpin.",
    evite: "Longos de festa, brilho em excesso e peças muito esportivas.",
    formalidade: 2,
  },
  {
    id: "passeio",
    nome: "passeio",
    resumo: "Elegante, sem ser de gala. Também chamado de traje social.",
    quando: "Casamentos de dia, batizados, colação de grau e jantares.",
    como: "Midi ou curto na altura do joelho, em crepe, seda ou renda leve. À noite, pode ter um pouco de brilho.",
    evite: "Longos muito armados, decotes e fendas exagerados em cerimônia religiosa.",
    formalidade: 3,
  },
  {
    id: "passeio-completo",
    nome: "passeio completo",
    resumo: "Mais formal que o passeio, pensado para a noite.",
    quando: "Casamentos à noite, bailes de formatura e festas de 15 anos.",
    como: "Longo ou midi sofisticado, em tecido nobre (cetim, seda, renda, crepe encorpado), com salto.",
    evite: "Tecidos casuais (malha, jeans, moletinho) e vestidos curtos.",
    formalidade: 4,
  },
  {
    id: "black-tie",
    nome: "black tie",
    resumo: "O mais formal de todos. Também aparece como traje a rigor ou de gala.",
    quando: "Casamentos de gala, bailes, premiações e grandes eventos à noite.",
    como: "Vestido longo, até o chão, em tecido nobre. Brilho, bordado e paetê são bem-vindos.",
    evite: "Midi, curto e tecidos leves de dia, como linho e algodão.",
    formalidade: 5,
  },
];

/** Dicas de convidada de casamento, independentes do traje. */
export const DICAS_CONVIDADA = [
  "Branco, off-white e tons muito claros ficam para a noiva.",
  "Pergunte se as madrinhas terão uma cor, para não usar a mesma.",
  "Em cerimônia religiosa, prefira decotes e fendas discretos (um xale resolve).",
  "Casamento no campo ou na praia: salto grosso, anabela ou rasteira.",
  "Preto total é aceito à noite; de dia, prefira cores e estampas.",
];

/** A ocasião sem o traje: "casamento à noite, traje black tie" → "casamento à noite". */
export function ocasiaoSemTraje(ocasiao: string): string {
  return ocasiao.replace(/,?\s*traje\s.*$/i, "").trim();
}

/** Junta o traje à ocasião já escolhida: "casamento à noite" → "casamento à noite, traje black tie". */
export function ocasiaoComTraje(ocasiao: string, traje: Traje): string {
  const base = ocasiaoSemTraje(ocasiao);
  return (base ? `${base}, traje ${traje.nome}` : `traje ${traje.nome}`).slice(0, 100);
}

/** Traje que já está na ocasião, se houver. */
export function trajeDaOcasiao(ocasiao: string): Traje | undefined {
  const texto = ocasiao.toLowerCase();
  // o mais longo primeiro: "passeio completo" antes de "passeio"
  return [...TRAJES].sort((a, b) => b.nome.length - a.nome.length).find((t) => texto.includes(`traje ${t.nome}`));
}

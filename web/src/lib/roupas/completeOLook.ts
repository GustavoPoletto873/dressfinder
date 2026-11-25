/**
 * "Complete o look" do modo Roupas (por regras, sem IA e sem gastar créditos):
 * a partir da peça procurada, sugere buscas de peças que combinam
 * (parte de cima ou de baixo, algo para usar por cima e o calçado).
 * Viram só links de busca nas lojas escolhidas.
 */
import type { EntradaRoupas } from "../tipos";
import { GRUPOS_PECAS } from "./opcoes";
import { concordar } from "./termosRegras";

type Contexto = "trabalho" | "academia" | "praia" | "frio" | "festa" | "casual";
type Categoria = "cima" | "baixo" | "cobrir" | "pes";
type Genero = "f" | "m";
/** [termo, gênero gramatical] para público feminino e para masculino/unissex. */
type Item = { f: [string, Genero]; m: [string, Genero] | null };

export interface SugestaoLook {
  categoria: Categoria;
  /** Rótulo da categoria ("Parte de baixo", "Nos pés"...). */
  rotulo: string;
  /** Nome curto mostrado no cartão ("Calça alfaiataria"). */
  titulo: string;
  /** Termo de busca completo ("calça alfaiataria feminina"). */
  termo: string;
}

const ROTULOS: Record<Categoria, string> = {
  cima: "Parte de cima",
  baixo: "Parte de baixo",
  cobrir: "Por cima",
  pes: "Nos pés",
};

const ITENS: Record<Categoria, Record<Contexto, Item>> = {
  cima: {
    trabalho: { f: ["camisa social", "f"], m: ["camisa social", "f"] },
    academia: { f: ["top esportivo", "m"], m: ["camiseta dry fit", "f"] },
    praia: { f: ["regata", "f"], m: ["regata", "f"] },
    frio: { f: ["suéter tricô", "m"], m: ["suéter tricô", "m"] },
    festa: { f: ["cropped", "m"], m: ["camisa", "f"] },
    casual: { f: ["camiseta básica", "f"], m: ["camiseta básica", "f"] },
  },
  baixo: {
    trabalho: { f: ["calça alfaiataria", "f"], m: ["calça alfaiataria", "f"] },
    academia: { f: ["legging", "f"], m: ["bermuda esportiva", "f"] },
    praia: { f: ["short", "m"], m: ["bermuda", "f"] },
    frio: { f: ["calça jeans", "f"], m: ["calça jeans", "f"] },
    festa: { f: ["saia midi", "f"], m: ["calça", "f"] },
    casual: { f: ["calça jeans", "f"], m: ["calça jeans", "f"] },
  },
  cobrir: {
    trabalho: { f: ["blazer", "m"], m: ["blazer", "m"] },
    academia: { f: ["jaqueta corta vento", "f"], m: ["jaqueta corta vento", "f"] },
    praia: { f: ["saída de praia", "f"], m: null },
    frio: { f: ["casaco", "m"], m: ["casaco", "m"] },
    festa: { f: ["jaqueta de couro", "f"], m: ["jaqueta", "f"] },
    casual: { f: ["jaqueta jeans", "f"], m: ["jaqueta jeans", "f"] },
  },
  pes: {
    trabalho: { f: ["scarpin", "m"], m: ["sapato social", "m"] },
    academia: { f: ["tênis de corrida", "m"], m: ["tênis de corrida", "m"] },
    praia: { f: ["rasteirinha", "f"], m: ["chinelo", "m"] },
    frio: { f: ["bota", "f"], m: ["bota", "f"] },
    festa: { f: ["sandália de salto", "f"], m: ["sapatênis", "m"] },
    casual: { f: ["tênis branco", "m"], m: ["tênis branco", "m"] },
  },
};

function contextoDe(ocasiao = "", estilo = ""): Contexto {
  const t = `${ocasiao} ${estilo}`.toLowerCase();
  if (/trabalho|escrit[óo]rio|entrevista|social|reuni[ãa]o/.test(t)) return "trabalho";
  if (/academia|treino|corrida|esportiv|yoga|pilates/.test(t)) return "academia";
  if (/praia|piscina|ver[ãa]o/.test(t)) return "praia";
  if (/frio|inverno|serra|neve/.test(t)) return "frio";
  if (/balada|festa|encontro|date|show/.test(t)) return "festa";
  return "casual";
}

function categoriaDaPeca(tipo: string): Categoria | "inteira" | null {
  const grupo = GRUPOS_PECAS.find((g) => (g.pecas as readonly string[]).includes(tipo))?.titulo;
  if (grupo === "Parte de cima") return "cima";
  if (grupo === "Parte de baixo") return "baixo";
  if (grupo === "Para cobrir") return "cobrir";
  if (grupo === "Peça inteira") return "inteira";
  return null;
}

/** Até 3 sugestões que combinam com a peça procurada. */
export function sugestoesParaCompletar(entrada: Pick<EntradaRoupas, "tipoPeca" | "publico" | "ocasiao" | "estilo">): SugestaoLook[] {
  const contexto = contextoDe(entrada.ocasiao, entrada.estilo);
  const propria = categoriaDaPeca(entrada.tipoPeca);
  const categorias: Categoria[] =
    propria === "cima"
      ? ["baixo", "cobrir", "pes"]
      : propria === "baixo"
        ? ["cima", "cobrir", "pes"]
        : propria === "cobrir"
          ? ["cima", "baixo", "pes"]
          : propria === "inteira"
            ? ["cobrir", "pes"]
            : ["cima", "baixo", "pes"]; // "outra peça": sugestões gerais

  const masculino = entrada.publico === "masculino" || entrada.publico === "unissex";
  const sufixo = (genero: Genero) =>
    entrada.publico === "feminino" || entrada.publico === "masculino"
      ? concordar(entrada.publico, genero)
      : entrada.publico === "plus size"
        ? "plus size"
        : "";

  return categorias.flatMap((categoria) => {
    const item = ITENS[categoria][contexto];
    const escolhido = masculino ? item.m : item.f;
    if (!escolhido) return [];
    const [nome, genero] = escolhido;
    // calçado não tem "plus size"
    const publico = categoria === "pes" && entrada.publico === "plus size" ? "" : sufixo(genero);
    return [
      {
        categoria,
        rotulo: ROTULOS[categoria],
        titulo: nome[0]!.toUpperCase() + nome.slice(1),
        termo: [nome, publico].filter(Boolean).join(" "),
      },
    ];
  });
}

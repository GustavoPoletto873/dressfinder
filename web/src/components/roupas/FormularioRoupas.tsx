"use client";

/**
 * Formulário do modo Roupas, em forma de jornada (uma pergunta por vez).
 * Mesmo visual do modo Vestidos (peças de ../comum); muda só o conteúdo:
 * tipo de peça, público, uso, modelagem e numeração.
 */
import { useState } from "react";
import {
  ESTILOS_ROUPAS,
  GRUPOS_PECAS,
  modelagensDaPeca,
  NUMERACOES,
  OCASIOES_ROUPAS,
  PUBLICOS,
  usaNumeracao,
} from "@/lib/roupas/opcoes";
import { TAMANHOS } from "@/lib/tipos";
import {
  CampoLivre,
  CampoObservacoes,
  CartaoOpcao,
  Chip,
  ChipsUnicos,
  contemNaLista,
  FaixaPreco,
  Grupo,
  itensDaLista,
  juntarCores,
} from "../comum/campos";
import { GuiaTecidos } from "../comum/GuiaTecidos";
import {
  IconeConfete,
  IconeCoracao,
  IconeFloco,
  IconeGuardaSol,
  IconeHaltere,
  IconeMala,
  IconeMaleta,
  IconeXicara,
} from "../comum/icones";
import { Jornada, type Passo } from "../comum/Jornada";
import { SeletorCores } from "../comum/SeletorCores";
import { TECIDOS_ROUPAS } from "../comum/tecidos";
import { textoPreco } from "../vestidos/FormularioVestidos";

export interface ValoresRoupas {
  tipoPeca: string;
  tipoOutro: string;
  publico: string;
  ocasiao: string;
  estilo: string;
  cor: string;
  corOutra: string;
  tecido: string;
  /** Modelagens escolhidas, separadas por vírgula (até 2). */
  modelagem: string;
  tamanho: string;
  numeracao: string;
  precoMin: string;
  precoMax: string;
  observacoes: string;
}

export const VALORES_INICIAIS_ROUPAS: ValoresRoupas = {
  tipoPeca: "",
  tipoOutro: "",
  publico: "",
  ocasiao: "",
  estilo: "",
  cor: "",
  corOutra: "",
  tecido: "",
  modelagem: "",
  tamanho: "",
  numeracao: "",
  precoMin: "",
  precoMax: "",
  observacoes: "",
};

const MAX_MODELAGENS = 2;

/** Prepara os valores para a API: junta as cores e descarta campos que não valem para a peça. */
export function paraEnvioRoupas(v: ValoresRoupas) {
  const { corOutra, ...resto } = v;
  const validas = modelagensDaPeca(v.tipoPeca);
  return {
    modo: "roupas" as const,
    ...resto,
    cor: juntarCores(v.cor, corOutra),
    tipoOutro: v.tipoPeca === "outra" ? v.tipoOutro : "",
    modelagem: itensDaLista(v.modelagem).filter((m) => validas.includes(m)).join(", "),
    numeracao: usaNumeracao(v.tipoPeca) ? v.numeracao : "",
  };
}

/** Palavras curtas que resumem o pedido, exibidas acima dos resultados. */
export function resumoRoupas(v: ReturnType<typeof paraEnvioRoupas>): string[] {
  const peca = v.tipoPeca === "outra" ? v.tipoOutro : v.tipoPeca;
  return [
    peca,
    v.publico,
    v.ocasiao,
    ...itensDaLista(v.modelagem),
    ...itensDaLista(v.cor),
    v.estilo,
    v.tecido,
    v.tamanho,
    v.numeracao ? `nº ${v.numeracao}` : "",
    textoPreco(v),
  ]
    .map((t) => t.trim())
    .filter(Boolean);
}

const ICONES_USO: Record<(typeof OCASIOES_ROUPAS)[number], typeof IconeXicara> = {
  "dia a dia": IconeXicara,
  trabalho: IconeMaleta,
  academia: IconeHaltere,
  viagem: IconeMala,
  frio: IconeFloco,
  praia: IconeGuardaSol,
  balada: IconeConfete,
  encontro: IconeCoracao,
};

const DESCRICAO_ESTILO: Record<(typeof ESTILOS_ROUPAS)[number], string> = {
  básico: "peças coringa e lisas",
  streetwear: "oversized e atitude",
  social: "alfaiataria e cortes retos",
  vintage: "ar retrô e personalidade",
  esportivo: "conforto e movimento",
  casual: "fácil de usar no dia a dia",
  romântico: "babados e delicadeza",
  minimalista: "liso, sem excessos",
};

interface Props {
  valores: ValoresRoupas;
  aoMudar: (valores: ValoresRoupas) => void;
  aoEnviar: () => void;
  carregando: boolean;
  erros: string[];
}

export function FormularioRoupas({ valores, aoMudar, aoEnviar, carregando, erros }: Props) {
  const [versao, setVersao] = useState(0);
  const definir = (campo: keyof ValoresRoupas, valor: string) => aoMudar({ ...valores, [campo]: valor });
  const alternar = (campo: keyof ValoresRoupas, valor: string) =>
    definir(campo, valores[campo].toLowerCase() === valor.toLowerCase() ? "" : valor);

  const tipo = valores.tipoPeca;
  const modelagens = tipo ? modelagensDaPeca(tipo) : [];
  const escolherTipo = (novo: string) => {
    const proximo = tipo === novo ? "" : novo;
    // campos que dependem da peça: mantém só o que ainda vale para a nova escolha
    const validas = proximo ? modelagensDaPeca(proximo) : [];
    aoMudar({
      ...valores,
      tipoPeca: proximo,
      modelagem: itensDaLista(valores.modelagem).filter((m) => validas.includes(m)).join(", "),
      numeracao: usaNumeracao(proximo) ? valores.numeracao : "",
    });
  };
  const alternarModelagem = (m: string) => {
    const atuais = itensDaLista(valores.modelagem);
    const proximas = contemNaLista(valores.modelagem, m)
      ? atuais.filter((a) => a.toLowerCase() !== m.toLowerCase())
      : [...atuais, m].slice(-MAX_MODELAGENS); // a mais antiga sai quando passa do limite
    definir("modelagem", proximas.join(", "));
  };

  const usoDaLista = OCASIOES_ROUPAS.some((o) => o === valores.ocasiao);
  const estiloDaLista = ESTILOS_ROUPAS.some((s) => s === valores.estilo.toLowerCase());
  const pecaPreenchida = Boolean(tipo) && (tipo !== "outra" || valores.tipoOutro.trim().length > 0);
  const qtdDetalhes = [valores.tamanho, valores.numeracao, valores.precoMin || valores.precoMax, valores.observacoes].filter(Boolean).length;

  const passos: Passo[] = [
    {
      id: "peca",
      rotulo: "Peça",
      pergunta: "O que você procura?",
      ajuda: "Escolha o tipo de peça e, se quiser, para quem é.",
      obrigatorio: true,
      preenchido: pecaPreenchida,
      avisoObrigatorio: tipo === "outra" ? "Conte qual peça você procura." : "Escolha o tipo de peça para a gente continuar.",
      conteudo: (
        <div className="space-y-6">
          <div id="tipo-peca" className="space-y-4">
            {GRUPOS_PECAS.map((g) => (
              <div key={g.titulo}>
                <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-texto-suave">{g.titulo}</p>
                <div className="flex flex-wrap gap-2">
                  {g.pecas.map((p) => (
                    <Chip key={p} ativo={tipo === p} onClick={() => escolherTipo(p)}>
                      {p}
                    </Chip>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex flex-wrap items-center gap-2">
              <Chip ativo={tipo === "outra"} onClick={() => escolherTipo("outra")}>
                outra peça…
              </Chip>
            </div>
            {tipo === "outra" && (
              <CampoLivre
                id="tipo-outro"
                valor={valores.tipoOutro}
                aoMudar={(v) => definir("tipoOutro", v)}
                convite="Escreva qual peça"
                exemplo="Ex.: kimono, body, pijama, saída de praia"
                rotulo="Qual peça você procura?"
                maxLength={40}
                abertoInicial
              />
            )}
          </div>
          <Grupo rotulo="Para quem?">
            <ChipsUnicos opcoes={PUBLICOS} valor={valores.publico} aoMudar={(v) => definir("publico", v)} />
          </Grupo>
        </div>
      ),
    },
    {
      id: "uso",
      rotulo: "Uso",
      pergunta: "Para quê?",
      ajuda: "Ajuda a escolher modelos que combinam com o uso. Opcional.",
      preenchido: Boolean(valores.ocasiao),
      conteudo: (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {OCASIOES_ROUPAS.map((o) => (
              <CartaoOpcao key={o} ativo={valores.ocasiao === o} onClick={() => alternar("ocasiao", o)} titulo={o} Icone={ICONES_USO[o]} />
            ))}
          </div>
          <CampoLivre
            id="ocasiao-roupas"
            valor={usoDaLista ? "" : valores.ocasiao}
            aoMudar={(v) => definir("ocasiao", v)}
            convite="Outro uso? Escreva do seu jeito"
            exemplo="Ex.: viagem para a serra, entrevista de emprego"
            rotulo="Ocasião ou uso"
          />
        </div>
      ),
    },
    {
      id: "modelo",
      rotulo: "Modelo",
      pergunta: "Como você imagina?",
      ajuda: tipo ? "Modelagem e estilo. Toque de novo para desmarcar." : "Estilo da peça. Escolha a peça no primeiro passo para ver as modelagens.",
      preenchido: Boolean(valores.modelagem || valores.estilo),
      conteudo: (
        <div className="space-y-6">
          {tipo && (
            <Grupo rotulo="Modelagem e caimento">
              <p className="-mt-1 text-sm text-texto-suave">Escolha até {MAX_MODELAGENS}.</p>
              <div className="flex flex-wrap gap-2">
                {modelagens.map((m) => (
                  <Chip key={m} ativo={contemNaLista(valores.modelagem, m)} onClick={() => alternarModelagem(m)}>
                    {m}
                  </Chip>
                ))}
              </div>
            </Grupo>
          )}
          <Grupo rotulo="Estilo">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {ESTILOS_ROUPAS.map((s) => (
                <CartaoOpcao key={s} ativo={valores.estilo.toLowerCase() === s} onClick={() => alternar("estilo", s)} titulo={s} descricao={DESCRICAO_ESTILO[s]} />
              ))}
            </div>
            <CampoLivre
              valor={estiloDaLista ? "" : valores.estilo}
              aoMudar={(v) => definir("estilo", v)}
              convite="Outro estilo? Descreva do seu jeito"
              exemplo="Ex.: clássico e confortável"
              rotulo="Outro estilo"
              maxLength={60}
            />
          </Grupo>
        </div>
      ),
    },
    {
      id: "cores",
      rotulo: "Cores",
      pergunta: "Quais cores você quer?",
      ajuda: "Escolha até 4. Cada uma vira uma opção de busca.",
      preenchido: Boolean(valores.cor || valores.corOutra),
      conteudo: (
        <SeletorCores
          key={`cores-${versao}`}
          semRotulo
          cor={valores.cor}
          corOutra={valores.corOutra}
          aoMudarCor={(cor) => definir("cor", cor)}
          aoMudarCorOutra={(corOutra) => definir("corOutra", corOutra)}
        />
      ),
    },
    {
      id: "tecido",
      rotulo: "Tecido",
      pergunta: "E o tecido?",
      ajuda: "Toque em um tecido para ver como ele é ao toque e para que serve.",
      preenchido: Boolean(valores.tecido),
      conteudo: (
        <GuiaTecidos key={`tecidos-${versao}`} semRotulo tecidos={TECIDOS_ROUPAS} valor={valores.tecido} aoMudar={(t) => definir("tecido", t)} />
      ),
    },
    {
      id: "detalhes",
      rotulo: "Detalhes",
      pergunta: "Últimos detalhes",
      ajuda:
        qtdDetalhes > 0
          ? `${qtdDetalhes} ${qtdDetalhes === 1 ? "detalhe escolhido" : "detalhes escolhidos"}.`
          : "Tamanho e quanto quer gastar. Tudo opcional.",
      preenchido: qtdDetalhes > 0,
      conteudo: (
        <div className="space-y-7">
          <Grupo rotulo="Tamanho">
            <ChipsUnicos opcoes={TAMANHOS} valor={valores.tamanho} aoMudar={(v) => definir("tamanho", v)} />
          </Grupo>
          {usaNumeracao(tipo) && (
            <Grupo rotulo="Numeração">
              <ChipsUnicos opcoes={NUMERACOES} valor={valores.numeracao} aoMudar={(v) => definir("numeracao", v)} />
            </Grupo>
          )}
          <FaixaPreco
            precoMin={valores.precoMin}
            precoMax={valores.precoMax}
            aoMudar={(precoMin, precoMax) => aoMudar({ ...valores, precoMin, precoMax })}
          />
          <CampoObservacoes
            id="observacoes-roupas"
            valor={valores.observacoes}
            aoMudar={(v) => definir("observacoes", v)}
            exemplo="Ex.: quero algo confortável que não amasse na mala"
          />
        </div>
      ),
    },
  ];

  return (
    <Jornada
      key={`jornada-${versao}`}
      passos={passos}
      aoEnviar={aoEnviar}
      carregando={carregando}
      erros={erros}
      textoFinal="Encontrar minha peça"
      textoCarregando="Procurando sua peça…"
      algoPreenchido={Object.values(valores).some(Boolean)}
      aoLimpar={() => {
        setVersao((v) => v + 1);
        aoMudar(VALORES_INICIAIS_ROUPAS);
      }}
    />
  );
}

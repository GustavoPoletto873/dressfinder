"use client";

/**
 * Formulário do modo Vestidos, em forma de jornada (uma pergunta por vez).
 * As peças comuns (cartões, cores, tecidos, preço, observações) vêm de ../comum.
 */
import { useState } from "react";
import { OCASIOES_SUGERIDAS, TAMANHOS } from "@/lib/tipos";
import { ocasiaoComTraje, ocasiaoSemTraje, trajeDaOcasiao } from "@/lib/trajes";
import {
  CampoLivre,
  CampoObservacoes,
  CartaoOpcao,
  ChipsMultiplos,
  ChipsUnicos,
  FaixaPreco,
  Grupo,
  itensDaLista,
  juntarCores,
} from "../comum/campos";
import { GuiaTecidos } from "../comum/GuiaTecidos";
import {
  IconeCapelo,
  IconeConfete,
  IconeGuardaSol,
  IconeLua,
  IconeMaleta,
  IconeSol,
  IconeTaca,
  IconeVela,
  IconeXicara,
} from "../comum/icones";
import { Jornada, type Passo } from "../comum/Jornada";
import { SeletorCores } from "../comum/SeletorCores";
import { TECIDOS_VESTIDOS } from "../comum/tecidos";
import { GuiaTrajes } from "./GuiaTrajes";

export interface ValoresVestidos {
  ocasiao: string;
  comprimento: string;
  /** Cores da paleta escolhidas, separadas por vírgula ("azul, dourado"). */
  cor: string;
  /** Cor ou estampa digitada livremente. */
  corOutra: string;
  tecido: string;
  decoteManga: string;
  estilo: string;
  tamanho: string;
  precoMin: string;
  precoMax: string;
  observacoes: string;
}

export const VALORES_INICIAIS_VESTIDOS: ValoresVestidos = {
  ocasiao: "",
  comprimento: "",
  cor: "",
  corOutra: "",
  tecido: "",
  decoteManga: "",
  estilo: "",
  tamanho: "",
  precoMin: "",
  precoMax: "",
  observacoes: "",
};

/** Prepara os valores para a API (junta as cores e informa o modo). */
export function paraEnvioVestidos(v: ValoresVestidos) {
  const { corOutra, ...resto } = v;
  return { modo: "vestidos" as const, ...resto, cor: juntarCores(v.cor, corOutra) };
}

/** Palavras curtas que resumem o pedido, exibidas acima dos resultados. */
export function resumoVestidos(v: ReturnType<typeof paraEnvioVestidos>): string[] {
  return [v.ocasiao, v.comprimento, ...itensDaLista(v.cor), v.estilo, v.tecido, ...itensDaLista(v.decoteManga), v.tamanho, textoPreco(v)]
    .map((t) => t.trim())
    .filter(Boolean);
}

export function textoPreco({ precoMin, precoMax }: { precoMin: string; precoMax: string }): string {
  if (precoMin && precoMax) return `R$ ${precoMin} a ${precoMax}`;
  if (precoMax) return `até R$ ${precoMax}`;
  if (precoMin) return `a partir de R$ ${precoMin}`;
  return "";
}

const ICONES_OCASIAO: Record<(typeof OCASIOES_SUGERIDAS)[number], typeof IconeSol> = {
  "casamento de dia": IconeSol,
  "casamento à noite": IconeLua,
  formatura: IconeCapelo,
  trabalho: IconeMaleta,
  festa: IconeConfete,
  praia: IconeGuardaSol,
  jantar: IconeTaca,
  batizado: IconeVela,
  "dia a dia": IconeXicara,
};

const ESTILOS: [string, string][] = [
  ["romântico", "babados, florais e laços"],
  ["elegante", "cortes limpos e sofisticados"],
  ["minimalista", "liso, básico, sem excessos"],
  ["sexy", "fendas, decotes e justos"],
  ["boho", "estampas e tecidos fluidos"],
  ["casual", "soltinho e confortável"],
  ["vintage", "ar retrô, poá e golinhas"],
  ["moderno", "recortes e assimetria"],
];
const DECOTES = ["decote V", "decote coração", "ombro a ombro", "tomara que caia", "frente única", "gola alta"];
const MANGAS = ["sem manga", "manga curta", "manga longa", "manga bufante"];

/** Silhueta de vestido com a saia no comprimento escolhido. */
function Silhueta({ comprimento }: { comprimento: "curto" | "midi" | "longo" }) {
  const saia = {
    curto: "M15.5 25 L24.5 25 L31 39 Q20 42 9 39 Z",
    midi: "M15.5 25 L24.5 25 L32.5 51 Q20 54.5 7.5 51 Z",
    longo: "M15.5 25 L24.5 25 L34 62 Q20 65.5 6 62 Z",
  }[comprimento];
  return (
    <svg viewBox="0 0 40 66" className="h-20 w-12" aria-hidden>
      <path d="M15 5 L16 13 M25 5 L24 13" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" />
      <path d="M15.5 13 Q20 15.5 24.5 13 L24 25 L16 25 Z" fill="currentColor" />
      <path d={saia} fill="currentColor" opacity={0.75} />
      <path d="M16 25 L24 25" stroke="currentColor" strokeWidth={1.6} />
    </svg>
  );
}

interface Props {
  valores: ValoresVestidos;
  aoMudar: (valores: ValoresVestidos) => void;
  aoEnviar: () => void;
  carregando: boolean;
  erros: string[];
}

export function FormularioVestidos({ valores, aoMudar, aoEnviar, carregando, erros }: Props) {
  // "Limpar" troca a versão e remonta as partes com estado próprio (ficha do tecido, aviso de cores)
  const [versao, setVersao] = useState(0);
  const definir = (campo: keyof ValoresVestidos, valor: string) => aoMudar({ ...valores, [campo]: valor });
  const alternar = (campo: keyof ValoresVestidos, valor: string) =>
    definir(campo, valores[campo].toLowerCase() === valor.toLowerCase() ? "" : valor);

  // o traje (guia de trajes) fica junto da ocasião: "casamento à noite, traje black tie"
  const baseOcasiao = ocasiaoSemTraje(valores.ocasiao);
  const trajeAtual = trajeDaOcasiao(valores.ocasiao);
  const comTraje = (ocasiao: string) => (trajeAtual ? ocasiaoComTraje(ocasiao, trajeAtual) : ocasiao);
  const ocasiaoDaLista = OCASIOES_SUGERIDAS.some((o) => o === baseOcasiao);
  const estiloDaLista = ESTILOS.some(([e]) => e === valores.estilo.toLowerCase());
  const qtdDetalhes = [valores.decoteManga, valores.tamanho, valores.precoMin || valores.precoMax, valores.observacoes].filter(Boolean).length;

  const passos: Passo[] = [
    {
      id: "ocasiao",
      rotulo: "Ocasião",
      pergunta: "Para qual ocasião é o vestido?",
      ajuda: "Escolha uma opção ou escreva do seu jeito.",
      obrigatorio: true,
      preenchido: valores.ocasiao.trim().length >= 2,
      avisoObrigatorio: "Conte a ocasião para a gente continuar. Ela é o ponto de partida das sugestões.",
      conteudo: (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {OCASIOES_SUGERIDAS.map((o) => (
              <CartaoOpcao key={o} ativo={baseOcasiao === o} onClick={() => definir("ocasiao", comTraje(o))} titulo={o} Icone={ICONES_OCASIAO[o]} />
            ))}
          </div>
          <CampoLivre
            id="ocasiao"
            valor={ocasiaoDaLista ? "" : baseOcasiao}
            aoMudar={(v) => definir("ocasiao", comTraje(v))}
            convite="Não está na lista? Escreva do seu jeito"
            exemplo="Ex.: casamento no campo ao entardecer"
            rotulo="Ocasião"
          />
          <GuiaTrajes ocasiao={valores.ocasiao} aoMudar={(v) => definir("ocasiao", v)} />
        </div>
      ),
    },
    {
      id: "modelo",
      rotulo: "Modelo",
      pergunta: "Como você imagina o vestido?",
      ajuda: "Comprimento e estilo. Toque de novo para desmarcar.",
      preenchido: Boolean(valores.comprimento || valores.estilo),
      conteudo: (
        <div className="space-y-6">
          <Grupo rotulo="Comprimento">
            <div className="grid grid-cols-3 gap-2.5">
              {(["curto", "midi", "longo"] as const).map((c) => {
                const ativo = valores.comprimento === c;
                return (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={ativo}
                    onClick={() => alternar("comprimento", c)}
                    className={
                      "flex flex-col items-center gap-1.5 rounded-2xl border px-2 pb-2.5 pt-3 transition-all duration-200 active:scale-95 " +
                      (ativo
                        ? "border-primaria bg-primaria-suave text-primaria shadow-cartao"
                        : "border-borda bg-superficie text-texto-suave hover:-translate-y-0.5 hover:border-destaque/40 hover:text-primaria/80")
                    }
                  >
                    <Silhueta comprimento={c} />
                    <span className={"text-sm capitalize " + (ativo ? "font-semibold" : "text-texto")}>{c}</span>
                  </button>
                );
              })}
            </div>
          </Grupo>
          <Grupo rotulo="Estilo">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {ESTILOS.map(([e, descricao]) => (
                <CartaoOpcao key={e} ativo={valores.estilo.toLowerCase() === e} onClick={() => alternar("estilo", e)} titulo={e} descricao={descricao} />
              ))}
            </div>
            <CampoLivre
              valor={estiloDaLista ? "" : valores.estilo}
              aoMudar={(v) => definir("estilo", v)}
              convite="Outro estilo? Descreva do seu jeito"
              exemplo="Ex.: chique e discreto"
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
      pergunta: "Quais cores combinam com você?",
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
      ajuda: "Toque em um tecido para ver como ele é ao toque e para que ocasiões combina.",
      preenchido: Boolean(valores.tecido),
      conteudo: (
        <GuiaTecidos key={`tecidos-${versao}`} semRotulo tecidos={TECIDOS_VESTIDOS} valor={valores.tecido} aoMudar={(t) => definir("tecido", t)} />
      ),
    },
    {
      id: "detalhes",
      rotulo: "Detalhes",
      pergunta: "Últimos detalhes",
      ajuda: qtdDetalhes > 0 ? `${qtdDetalhes} ${qtdDetalhes === 1 ? "detalhe escolhido" : "detalhes escolhidos"}.` : "Decote, manga, tamanho e quanto quer gastar. Tudo opcional.",
      preenchido: qtdDetalhes > 0,
      conteudo: (
        <div className="space-y-7">
          <Grupo rotulo="Decote">
            <ChipsMultiplos opcoes={DECOTES} valor={valores.decoteManga} aoMudar={(v) => definir("decoteManga", v)} />
          </Grupo>
          <Grupo rotulo="Manga">
            <ChipsMultiplos opcoes={MANGAS} valor={valores.decoteManga} aoMudar={(v) => definir("decoteManga", v)} />
          </Grupo>
          <Grupo rotulo="Tamanho">
            <ChipsUnicos opcoes={TAMANHOS} valor={valores.tamanho} aoMudar={(v) => definir("tamanho", v)} />
          </Grupo>
          <FaixaPreco
            precoMin={valores.precoMin}
            precoMax={valores.precoMax}
            aoMudar={(precoMin, precoMax) => aoMudar({ ...valores, precoMin, precoMax })}
          />
          <CampoObservacoes
            id="observacoes"
            valor={valores.observacoes}
            aoMudar={(v) => definir("observacoes", v)}
            exemplo="Ex.: quero algo que disfarce a barriga e dê para usar sutiã"
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
      textoFinal="Encontrar meu vestido"
      textoCarregando="Procurando seu vestido…"
      algoPreenchido={Object.values(valores).some(Boolean)}
      aoLimpar={() => {
        setVersao((v) => v + 1);
        aoMudar(VALORES_INICIAIS_VESTIDOS);
      }}
    />
  );
}

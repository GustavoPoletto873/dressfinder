"use client";

/**
 * Formulário do modo Vestidos.
 * As peças comuns (cores, tecidos, preço, observações, botões) vêm de ../comum.
 */
import { useState } from "react";
import { OCASIOES_SUGERIDAS, TAMANHOS } from "@/lib/tipos";
import {
  BotaoBuscar,
  BotaoLimpar,
  CaixaErros,
  CampoObservacoes,
  Chip,
  ChipsMultiplos,
  ChipsUnicos,
  classeCampo,
  classeCampoPequeno,
  FaixaPreco,
  Grupo,
  itensDaLista,
  juntarCores,
  Secao,
  SecaoRecolhivel,
} from "../comum/campos";
import { GuiaTecidos } from "../comum/GuiaTecidos";
import { SeletorCores } from "../comum/SeletorCores";
import { TECIDOS_VESTIDOS } from "../comum/tecidos";

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

const ESTILOS = ["romântico", "elegante", "minimalista", "sexy", "boho", "casual", "vintage", "moderno"];
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

  const qtdDetalhes = [valores.decoteManga, valores.tamanho, valores.precoMin || valores.precoMax, valores.observacoes].filter(Boolean).length;
  const algoPreenchido = Object.values(valores).some(Boolean);
  const ocasiaoComErro = erros.some((e) => /ocasi/i.test(e));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        aoEnviar();
      }}
      noValidate
      className="space-y-10"
    >
      {/* 1. Ocasião */}
      <Secao numero={1} titulo="Para qual ocasião?" ajuda="Escolha uma sugestão ou escreva do seu jeito.">
        <div className="flex flex-wrap gap-2">
          {OCASIOES_SUGERIDAS.map((o) => (
            <Chip key={o} ativo={valores.ocasiao === o} onClick={() => definir("ocasiao", o)}>
              {o}
            </Chip>
          ))}
        </div>
        <input
          id="ocasiao"
          aria-label="Ocasião"
          aria-invalid={ocasiaoComErro}
          className={classeCampo + (ocasiaoComErro ? " border-destaque ring-4 ring-destaque/15" : "")}
          placeholder="Ex.: casamento no campo ao entardecer"
          value={valores.ocasiao}
          onChange={(e) => definir("ocasiao", e.target.value)}
          maxLength={100}
          autoComplete="off"
        />
      </Secao>

      {/* 2. Como você imagina */}
      <Secao numero={2} titulo="Como você imagina?" ajuda="Tudo opcional. Toque para escolher e toque de novo para desmarcar.">
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
                      ? "border-destaque bg-primaria-suave text-primaria shadow-cartao"
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

        <SeletorCores
          key={`cores-${versao}`}
          cor={valores.cor}
          corOutra={valores.corOutra}
          aoMudarCor={(cor) => definir("cor", cor)}
          aoMudarCorOutra={(corOutra) => definir("corOutra", corOutra)}
        />

        <Grupo rotulo="Estilo">
          <ChipsUnicos opcoes={ESTILOS} valor={valores.estilo} aoMudar={(v) => definir("estilo", v)} />
          <input
            aria-label="Outro estilo"
            className={classeCampoPequeno}
            placeholder="ou descreva o seu estilo…"
            value={ESTILOS.includes(valores.estilo.toLowerCase()) ? "" : valores.estilo}
            onChange={(e) => definir("estilo", e.target.value)}
            maxLength={60}
          />
        </Grupo>

        <GuiaTecidos key={`tecidos-${versao}`} tecidos={TECIDOS_VESTIDOS} valor={valores.tecido} aoMudar={(t) => definir("tecido", t)} />
      </Secao>

      {/* 3. Detalhes finais (abre sob demanda) */}
      <SecaoRecolhivel numero={3} titulo="Detalhes finais" descricaoVazia="Decote, manga, tamanho, preço e observações" quantidade={qtdDetalhes}>
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
      </SecaoRecolhivel>

      <CaixaErros erros={erros} />

      <BotaoBuscar carregando={carregando} texto="Encontrar meu vestido" textoCarregando="Procurando seu vestido…" />
      {algoPreenchido && !carregando && (
        <BotaoLimpar
          onClick={() => {
            setVersao((v) => v + 1);
            aoMudar(VALORES_INICIAIS_VESTIDOS);
          }}
        />
      )}
    </form>
  );
}

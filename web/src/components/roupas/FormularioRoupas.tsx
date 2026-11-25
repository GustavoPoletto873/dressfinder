"use client";

/**
 * Formulário do modo Roupas. Mesmo visual do formulário de Vestidos
 * (peças de ../comum); muda só o conteúdo: tipo de peça, público, uso,
 * modelagem e numeração.
 */
import { useRef, useState } from "react";
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
  BotaoBuscar,
  BotaoLimpar,
  CaixaErros,
  CampoObservacoes,
  Chip,
  ChipsUnicos,
  classeCampo,
  classeCampoPequeno,
  contemNaLista,
  FaixaPreco,
  Grupo,
  itensDaLista,
  juntarCores,
  Secao,
  SecaoRecolhivel,
} from "../comum/campos";
import { GuiaTecidos } from "../comum/GuiaTecidos";
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

interface Props {
  valores: ValoresRoupas;
  aoMudar: (valores: ValoresRoupas) => void;
  aoEnviar: () => void;
  carregando: boolean;
  erros: string[];
}

export function FormularioRoupas({ valores, aoMudar, aoEnviar, carregando, erros }: Props) {
  const [versao, setVersao] = useState(0);
  const campoOutra = useRef<HTMLInputElement>(null);
  const definir = (campo: keyof ValoresRoupas, valor: string) => aoMudar({ ...valores, [campo]: valor });

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
    if (proximo === "outra") requestAnimationFrame(() => campoOutra.current?.focus());
  };
  const alternarModelagem = (m: string) => {
    const atuais = itensDaLista(valores.modelagem);
    const proximas = contemNaLista(valores.modelagem, m)
      ? atuais.filter((a) => a.toLowerCase() !== m.toLowerCase())
      : [...atuais, m].slice(-MAX_MODELAGENS); // a mais antiga sai quando passa do limite
    definir("modelagem", proximas.join(", "));
  };

  const qtdDetalhes = [valores.tamanho, valores.numeracao, valores.precoMin || valores.precoMax, valores.observacoes].filter(Boolean).length;
  const algoPreenchido = Object.values(valores).some(Boolean);
  const tipoComErro = erros.some((e) => /tipo de peça/i.test(e));
  const outraComErro = erros.some((e) => /qual peça/i.test(e));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        aoEnviar();
      }}
      noValidate
      className="space-y-10"
    >
      {/* 1. Peça e público */}
      <Secao numero={1} titulo="Qual peça você procura?" ajuda="Escolha o tipo de peça. É o único campo obrigatório.">
        <div
          id="tipo-peca"
          tabIndex={-1}
          aria-label="Tipo de peça"
          aria-invalid={tipoComErro}
          className={"space-y-3 rounded-2xl outline-none " + (tipoComErro ? "ring-4 ring-destaque/15" : "")}
        >
          {GRUPOS_PECAS.map((g) => (
            <div key={g.titulo}>
              <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-texto-suave">{g.titulo}</p>
              <div className="flex flex-wrap gap-2">
                {g.pecas.map((p) => (
                  <Chip key={p} ativo={tipo === p} onClick={() => escolherTipo(p)}>
                    {p}
                  </Chip>
                ))}
              </div>
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <Chip ativo={tipo === "outra"} onClick={() => escolherTipo("outra")}>
              outra peça…
            </Chip>
          </div>
        </div>
        {tipo === "outra" && (
          <input
            id="tipo-outro"
            ref={campoOutra}
            aria-label="Qual peça você procura?"
            aria-invalid={outraComErro}
            className={"surgir " + classeCampo + (outraComErro ? " border-destaque ring-4 ring-destaque/15" : "")}
            placeholder="Ex.: kimono, body, pijama, saída de praia"
            value={valores.tipoOutro}
            onChange={(e) => definir("tipoOutro", e.target.value)}
            maxLength={40}
            autoComplete="off"
          />
        )}

        <Grupo rotulo="Para quem?">
          <ChipsUnicos opcoes={PUBLICOS} valor={valores.publico} aoMudar={(v) => definir("publico", v)} />
        </Grupo>
      </Secao>

      {/* 2. Uso */}
      <Secao numero={2} titulo="Para quê?" ajuda="Opcional. Ajuda a escolher modelos que combinam com o uso.">
        <ChipsUnicos opcoes={OCASIOES_ROUPAS} valor={valores.ocasiao} aoMudar={(v) => definir("ocasiao", v)} />
        <input
          id="ocasiao-roupas"
          aria-label="Ocasião ou uso"
          className={classeCampo}
          placeholder="Ex.: viagem para a serra, entrevista de emprego"
          value={OCASIOES_ROUPAS.some((o) => o === valores.ocasiao) ? "" : valores.ocasiao}
          onChange={(e) => definir("ocasiao", e.target.value)}
          maxLength={100}
          autoComplete="off"
        />
      </Secao>

      {/* 3. Como você imagina */}
      <Secao numero={3} titulo="Como você imagina?" ajuda="Tudo opcional. Toque para escolher e toque de novo para desmarcar.">
        {tipo && (
          <div key={tipo} className="surgir">
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
          </div>
        )}

        <SeletorCores
          key={`cores-${versao}`}
          cor={valores.cor}
          corOutra={valores.corOutra}
          aoMudarCor={(cor) => definir("cor", cor)}
          aoMudarCorOutra={(corOutra) => definir("corOutra", corOutra)}
        />

        <Grupo rotulo="Estilo">
          <ChipsUnicos opcoes={ESTILOS_ROUPAS} valor={valores.estilo} aoMudar={(v) => definir("estilo", v)} />
          <input
            aria-label="Outro estilo"
            className={classeCampoPequeno}
            placeholder="ou descreva o seu estilo…"
            value={ESTILOS_ROUPAS.some((s) => s === valores.estilo.toLowerCase()) ? "" : valores.estilo}
            onChange={(e) => definir("estilo", e.target.value)}
            maxLength={60}
          />
        </Grupo>

        <GuiaTecidos key={`tecidos-${versao}`} tecidos={TECIDOS_ROUPAS} valor={valores.tecido} aoMudar={(t) => definir("tecido", t)} />
      </Secao>

      {/* 4. Detalhes finais (abre sob demanda) */}
      <SecaoRecolhivel numero={4} titulo="Detalhes finais" descricaoVazia="Tamanho, preço e observações" quantidade={qtdDetalhes}>
        <Grupo rotulo="Tamanho">
          <ChipsUnicos opcoes={TAMANHOS} valor={valores.tamanho} aoMudar={(v) => definir("tamanho", v)} />
        </Grupo>

        {usaNumeracao(tipo) && (
          <div className="surgir">
            <Grupo rotulo="Numeração">
              <ChipsUnicos opcoes={NUMERACOES} valor={valores.numeracao} aoMudar={(v) => definir("numeracao", v)} />
            </Grupo>
          </div>
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
      </SecaoRecolhivel>

      <CaixaErros erros={erros} />

      <BotaoBuscar carregando={carregando} texto="Encontrar minha peça" textoCarregando="Procurando sua peça…" />
      {algoPreenchido && !carregando && (
        <BotaoLimpar
          onClick={() => {
            setVersao((v) => v + 1);
            aoMudar(VALORES_INICIAIS_ROUPAS);
          }}
        />
      )}
    </form>
  );
}

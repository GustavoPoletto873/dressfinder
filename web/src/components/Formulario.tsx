"use client";

import { useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { OCASIOES_SUGERIDAS, TAMANHOS } from "@/lib/tipos";
import { IconeCheck, IconeFechar, IconeFlor, IconeInfo, IconeSeta } from "./icones";
import { CORES_CLARAS, GRUPOS_CORES, MAX_CORES, TODAS_AS_CORES } from "./paletaCores";
import { AmostraTecido, ESCALAS, Escala, TECIDOS, type Tecido } from "./tecidos";

export interface ValoresFormulario {
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

export const VALORES_INICIAIS: ValoresFormulario = {
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

/**
 * Prepara os valores para a API: junta as cores da paleta com a cor digitada
 * num único campo "cor" ("azul, dourado, verde água").
 */
export function paraEnvio(v: ValoresFormulario) {
  const { corOutra, ...resto } = v;
  const cores = [...v.cor.split(","), ...corOutra.split(",")].map((t) => t.trim()).filter(Boolean);
  return { ...resto, cor: [...new Set(cores)].join(", ") };
}

// ---------------------------------------------------------------------------
// Opções prontas (menos digitação, principalmente no celular)

const ESTILOS = ["romântico", "elegante", "minimalista", "sexy", "boho", "casual", "vintage", "moderno"];
const DECOTES = ["decote V", "decote coração", "ombro a ombro", "tomara que caia", "frente única", "gola alta"];
const MANGAS = ["sem manga", "manga curta", "manga longa", "manga bufante"];
const FAIXAS: { rotulo: string; min: string; max: string }[] = [
  { rotulo: "até R$ 100", min: "", max: "100" },
  { rotulo: "R$ 100 a 200", min: "100", max: "200" },
  { rotulo: "R$ 200 a 350", min: "200", max: "350" },
  { rotulo: "acima de R$ 350", min: "350", max: "" },
];

/** Liga/desliga um item numa lista separada por vírgulas ("decote V, manga curta"). */
function alternarNaLista(texto: string, item: string): string {
  const itens = texto.split(",").map((t) => t.trim()).filter(Boolean);
  const existe = itens.some((t) => t.toLowerCase() === item.toLowerCase());
  return (existe ? itens.filter((t) => t.toLowerCase() !== item.toLowerCase()) : [...itens, item]).join(", ");
}

function contemNaLista(texto: string, item: string): boolean {
  return texto.split(",").some((t) => t.trim().toLowerCase() === item.toLowerCase());
}

// ---------------------------------------------------------------------------
// Peças de interface

function Chip({
  ativo,
  onClick,
  children,
  bolinha,
}: {
  ativo: boolean;
  onClick: () => void;
  children: ReactNode;
  bolinha?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className={
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition-all duration-200 " +
        "active:scale-95 " +
        (ativo
          ? "border-primaria bg-primaria text-white shadow-chip"
          : "border-borda bg-superficie text-texto hover:-translate-y-0.5 hover:border-destaque/50 hover:bg-primaria-suave")
      }
    >
      {bolinha && (
        <span
          aria-hidden
          className={"size-4 shrink-0 rounded-full ring-1 " + (ativo ? "ring-white/70" : "ring-black/10")}
          style={{ background: bolinha } as CSSProperties}
        />
      )}
      {children}
    </button>
  );
}

function Secao({ numero, titulo, ajuda, children }: { numero: number; titulo: string; ajuda?: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <header className="flex items-baseline gap-3">
        <span className="font-cursiva text-3xl leading-none text-primaria" aria-hidden>
          {numero}
        </span>
        <div>
          <h2 className="font-titulo text-2xl font-semibold leading-tight">{titulo}</h2>
          {ajuda && <p className="text-sm text-texto-suave">{ajuda}</p>}
        </div>
      </header>
      {children}
    </section>
  );
}

function Grupo({ rotulo, children, htmlFor }: { rotulo: string; children: ReactNode; htmlFor?: string }) {
  return (
    <div className="space-y-2.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-texto">
        {rotulo}
      </label>
      {children}
    </div>
  );
}

const classeCampo =
  "w-full rounded-2xl border border-borda bg-superficie px-4 py-3 text-base text-texto placeholder:text-texto-suave/70 " +
  "transition focus:border-destaque focus:outline-none focus:ring-4 focus:ring-destaque/15";

const classeCampoPequeno =
  "w-full rounded-xl border border-dashed border-borda bg-transparent px-3.5 py-2 text-sm text-texto placeholder:text-texto-suave/80 " +
  "transition focus:border-solid focus:border-destaque focus:bg-superficie focus:outline-none focus:ring-4 focus:ring-destaque/15";

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

/** Bolinha de cor com o nome embaixo. */
function BolinhaCor({
  nome,
  fundo,
  ativa,
  bloqueada,
  onClick,
}: {
  nome: string;
  fundo: string;
  ativa: boolean;
  bloqueada: boolean;
  onClick: () => void;
}) {
  const clara = CORES_CLARAS.has(nome);
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativa}
      aria-disabled={bloqueada}
      title={nome}
      className={
        "group flex w-[3.75rem] flex-col items-center gap-1.5 rounded-xl py-1 transition-opacity " +
        (bloqueada ? "opacity-55" : "")
      }
    >
      <span
        className={
          "relative grid size-10 place-items-center rounded-full transition-all duration-200 group-active:scale-90 " +
          (ativa
            ? "ring-2 ring-destaque ring-offset-2 ring-offset-superficie"
            : (clara ? "ring-1 ring-black/15 " : "ring-1 ring-black/5 ") + "group-hover:scale-110")
        }
        style={{ background: fundo } as CSSProperties}
      >
        {ativa && (
          <span className="grid size-5 place-items-center rounded-full bg-superficie/90 text-primaria-forte shadow-sm">
            <IconeCheck className="size-3.5" strokeWidth={2.6} />
          </span>
        )}
      </span>
      <span className={"text-center text-[11px] leading-tight " + (ativa ? "font-semibold text-primaria-forte" : "text-texto")}>
        {nome}
      </span>
    </button>
  );
}

/** Cartão de tecido com a amostra da textura. */
function CartaoTecido({ tecido, ativo, emFoco, onClick }: { tecido: Tecido; ativo: boolean; emFoco: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      title={tecido.resumo}
      className={
        "group flex flex-col items-center gap-1.5 rounded-2xl border p-1.5 pb-2 transition-all duration-200 active:scale-95 " +
        (ativo
          ? "border-destaque bg-primaria-suave shadow-cartao"
          : emFoco
            ? "border-destaque/40 bg-superficie"
            : "border-borda bg-superficie hover:-translate-y-0.5 hover:border-destaque/40")
      }
    >
      <span className="relative block aspect-square w-full overflow-hidden rounded-xl ring-1 ring-black/5">
        <AmostraTecido nome={tecido.nome} className="size-full transition-transform duration-500 group-hover:scale-110" />
        {ativo && (
          <span className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-primaria text-white shadow-sm">
            <IconeCheck className="size-3.5" strokeWidth={2.6} />
          </span>
        )}
      </span>
      <span className={"text-xs capitalize sm:text-sm " + (ativo ? "font-semibold text-primaria-forte" : "text-texto")}>{tecido.nome}</span>
    </button>
  );
}

/** Ficha do tecido: como é, para que serve e o que observar. */
function FichaTecido({ tecido, escolhido, onEscolher }: { tecido: Tecido | null; escolhido: boolean; onEscolher: () => void }) {
  if (!tecido) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-dashed border-borda px-4 py-3.5 text-sm text-texto-suave">
        <IconeInfo className="size-5 shrink-0 text-primaria" />
        Não sabe a diferença entre os tecidos? Toque em um para ver como ele é ao toque, o caimento e para que ocasiões combina.
      </div>
    );
  }
  return (
    <div key={tecido.nome} className="surgir overflow-hidden rounded-3xl border border-borda bg-superficie shadow-suave">
      <div className="flex gap-4 p-4 sm:p-5">
        <AmostraTecido nome={tecido.nome} className="size-20 shrink-0 rounded-2xl ring-1 ring-black/5 sm:size-24" />
        <div className="min-w-0 flex-1">
          <h3 className="font-titulo text-2xl font-semibold capitalize leading-tight">{tecido.nome}</h3>
          <p className="font-titulo text-lg italic leading-snug text-texto-suave">{tecido.resumo}</p>
          <p className="mt-1.5 text-sm leading-relaxed">{tecido.toque}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-5 gap-y-3 border-t border-borda bg-fundo/50 px-4 py-4 sm:px-5">
        {ESCALAS.map((e) => (
          <Escala key={e.chave} rotulo={e.rotulo} valor={tecido[e.chave]} min={e.min} max={e.max} />
        ))}
      </div>

      <dl className="space-y-2.5 px-4 py-4 text-sm sm:px-5">
        <div>
          <dt className="font-medium text-secundaria">Combina com</dt>
          <dd className="leading-relaxed">{tecido.idealPara}</dd>
        </div>
        <div>
          <dt className="font-medium text-primaria-forte">Fique de olho</dt>
          <dd className="leading-relaxed">{tecido.atencao}</dd>
        </div>
      </dl>

      <div className="px-4 pb-4 sm:px-5 sm:pb-5">
        <button
          type="button"
          onClick={onEscolher}
          aria-pressed={escolhido}
          className={
            "flex w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200 active:scale-[0.98] " +
            (escolhido
              ? "bg-primaria-suave text-primaria-forte hover:bg-realce"
              : "bg-primaria text-white shadow-chip hover:bg-primaria-forte")
          }
        >
          {escolhido ? (
            <>
              <IconeCheck className="size-4" strokeWidth={2.4} /> {`${tecido.nome[0]!.toUpperCase()}${tecido.nome.slice(1)} escolhido`} · tocar para tirar
            </>
          ) : (
            `Quero ${tecido.nome}`
          )}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

interface Props {
  valores: ValoresFormulario;
  aoMudar: (valores: ValoresFormulario) => void;
  aoEnviar: () => void;
  carregando: boolean;
  erros: string[];
}

export function Formulario({ valores, aoMudar, aoEnviar, carregando, erros }: Props) {
  const [detalhesAbertos, setDetalhesAbertos] = useState(false);
  const idDetalhes = useId();
  const definir = (campo: keyof ValoresFormulario, valor: string) => aoMudar({ ...valores, [campo]: valor });
  const alternar = (campo: keyof ValoresFormulario, valor: string) =>
    definir(campo, valores[campo].toLowerCase() === valor.toLowerCase() ? "" : valor);

  // --- cores (várias ao mesmo tempo, até MAX_CORES) ---
  const coresEscolhidas = valores.cor.split(",").map((t) => t.trim()).filter(Boolean);
  const [avisoLimiteCores, setAvisoLimiteCores] = useState(false);
  const alternarCor = (nome: string) => {
    if (!contemNaLista(valores.cor, nome) && coresEscolhidas.length >= MAX_CORES) {
      setAvisoLimiteCores(true);
      setTimeout(() => setAvisoLimiteCores(false), 3500);
      return;
    }
    setAvisoLimiteCores(false);
    definir("cor", alternarNaLista(valores.cor, nome));
  };
  const fundoDaCor = (nome: string) => TODAS_AS_CORES.find((c) => c.nome === nome)?.fundo ?? "#eee";

  // --- tecidos: o último tocado aparece na ficha ---
  const [tecidoEmFoco, setTecidoEmFoco] = useState<string | null>(null);
  const fichaTecido = useRef<HTMLDivElement>(null);
  const tecidoDaFicha = TECIDOS.find((t) => t.nome === (tecidoEmFoco ?? valores.tecido.toLowerCase())) ?? null;
  const tocarTecido = (nome: string) => {
    alternar("tecido", nome);
    setTecidoEmFoco(nome);
    // no celular a ficha fica abaixo da grade: rola só o necessário para ela aparecer
    requestAnimationFrame(() => fichaTecido.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
  };

  const qtdDetalhes = [valores.decoteManga, valores.tamanho, valores.precoMin || valores.precoMax, valores.observacoes].filter(Boolean).length;
  const algoPreenchido = Object.values(valores).some(Boolean);
  const faixaAtiva = (f: (typeof FAIXAS)[number]) => valores.precoMin === f.min && valores.precoMax === f.max;
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

        <Grupo rotulo="Cores e estampas">
          <p className="-mt-1 text-sm text-texto-suave">
            Escolha até {MAX_CORES}. Buscamos cada uma como opção.
          </p>

          {/* escolhidas, com atalho para tirar */}
          {coresEscolhidas.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5" aria-label="Cores escolhidas">
              {coresEscolhidas.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => alternarCor(c)}
                  aria-label={`Tirar ${c}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primaria-suave py-1 pl-1.5 pr-2.5 text-sm text-primaria-forte transition hover:bg-realce active:scale-95"
                >
                  <span className="size-4 rounded-full ring-1 ring-black/10" style={{ background: fundoDaCor(c) }} />
                  {c}
                  <IconeFechar className="size-3.5" />
                </button>
              ))}
              <span className="ml-1 text-xs text-texto-suave">
                {coresEscolhidas.length} de {MAX_CORES}
              </span>
            </div>
          )}

          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            {GRUPOS_CORES.map((g) => (
              <div key={g.titulo}>
                <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-texto-suave">{g.titulo}</p>
                <div className="flex flex-wrap gap-x-0.5 gap-y-2">
                  {g.cores.map((c) => {
                    const ativa = contemNaLista(valores.cor, c.nome);
                    return (
                      <BolinhaCor
                        key={c.nome}
                        nome={c.nome}
                        fundo={c.fundo}
                        ativa={ativa}
                        bloqueada={!ativa && coresEscolhidas.length >= MAX_CORES}
                        onClick={() => alternarCor(c.nome)}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {avisoLimiteCores && (
            <p role="status" className="surgir rounded-xl bg-primaria-suave px-3.5 py-2 text-sm text-primaria-forte">
              Você já escolheu {MAX_CORES} cores. Toque em uma delas para tirar e escolher outra.
            </p>
          )}

          <input
            aria-label="Outra cor ou estampa"
            className={classeCampoPequeno}
            placeholder="ou escreva outra cor ou estampa…"
            value={valores.corOutra}
            onChange={(e) => definir("corOutra", e.target.value)}
            maxLength={60}
          />
        </Grupo>

        <Grupo rotulo="Estilo">
          <div className="flex flex-wrap gap-2">
            {ESTILOS.map((s) => (
              <Chip key={s} ativo={valores.estilo.toLowerCase() === s} onClick={() => alternar("estilo", s)}>
                {s}
              </Chip>
            ))}
          </div>
          <input
            aria-label="Outro estilo"
            className={classeCampoPequeno}
            placeholder="ou descreva o seu estilo…"
            value={ESTILOS.includes(valores.estilo.toLowerCase()) ? "" : valores.estilo}
            onChange={(e) => definir("estilo", e.target.value)}
            maxLength={60}
          />
        </Grupo>

        <Grupo rotulo="Tecido">
          <p className="-mt-1 text-sm text-texto-suave">Toque em um tecido para escolher e ver como ele é.</p>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
            {TECIDOS.map((t) => (
              <CartaoTecido
                key={t.nome}
                tecido={t}
                ativo={valores.tecido.toLowerCase() === t.nome}
                emFoco={tecidoDaFicha?.nome === t.nome}
                onClick={() => tocarTecido(t.nome)}
              />
            ))}
          </div>
          <div ref={fichaTecido} className="scroll-mb-24" aria-live="polite">
            <FichaTecido
              tecido={tecidoDaFicha}
              escolhido={!!tecidoDaFicha && valores.tecido.toLowerCase() === tecidoDaFicha.nome}
              onEscolher={() => tecidoDaFicha && alternar("tecido", tecidoDaFicha.nome)}
            />
          </div>
          <input
            aria-label="Outro tecido"
            className={classeCampoPequeno}
            placeholder="ou escreva outro tecido…"
            value={TECIDOS.some((t) => t.nome === valores.tecido.toLowerCase()) ? "" : valores.tecido}
            onChange={(e) => {
              setTecidoEmFoco(null);
              definir("tecido", e.target.value);
            }}
            maxLength={60}
          />
        </Grupo>
      </Secao>

      {/* 3. Detalhes finais (abre sob demanda) */}
      <section className="rounded-3xl border border-borda bg-fundo/60">
        <button
          type="button"
          aria-expanded={detalhesAbertos}
          aria-controls={idDetalhes}
          onClick={() => setDetalhesAbertos((v) => !v)}
          className="flex w-full items-center gap-3 rounded-3xl px-5 py-4 text-left transition hover:bg-primaria-suave/60"
        >
          <span className="font-cursiva text-3xl leading-none text-primaria" aria-hidden>
            3
          </span>
          <span className="flex-1">
            <span className="block font-titulo text-2xl font-semibold leading-tight">Detalhes finais</span>
            <span className="block text-sm text-texto-suave">
              {qtdDetalhes > 0
                ? `${qtdDetalhes} ${qtdDetalhes === 1 ? "detalhe escolhido" : "detalhes escolhidos"}`
                : "Decote, manga, tamanho, preço e observações"}
            </span>
          </span>
          <IconeSeta className={"size-5 text-texto-suave transition-transform duration-300 " + (detalhesAbertos ? "rotate-180" : "")} />
        </button>

        <div
          id={idDetalhes}
          className={"grid transition-[grid-template-rows] duration-300 ease-out " + (detalhesAbertos ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
        >
          <div className="overflow-hidden" inert={!detalhesAbertos}>
            <div className="space-y-7 px-5 pb-6 pt-2">
              <Grupo rotulo="Decote">
                <div className="flex flex-wrap gap-2">
                  {DECOTES.map((d) => (
                    <Chip key={d} ativo={contemNaLista(valores.decoteManga, d)} onClick={() => definir("decoteManga", alternarNaLista(valores.decoteManga, d))}>
                      {d}
                    </Chip>
                  ))}
                </div>
              </Grupo>
              <Grupo rotulo="Manga">
                <div className="flex flex-wrap gap-2">
                  {MANGAS.map((m) => (
                    <Chip key={m} ativo={contemNaLista(valores.decoteManga, m)} onClick={() => definir("decoteManga", alternarNaLista(valores.decoteManga, m))}>
                      {m}
                    </Chip>
                  ))}
                </div>
              </Grupo>

              <Grupo rotulo="Tamanho">
                <div className="flex flex-wrap gap-2">
                  {TAMANHOS.map((t) => (
                    <Chip key={t} ativo={valores.tamanho === t} onClick={() => alternar("tamanho", t)}>
                      {t}
                    </Chip>
                  ))}
                </div>
              </Grupo>

              <Grupo rotulo="Quanto quer gastar?">
                <div className="flex flex-wrap gap-2">
                  {FAIXAS.map((f) => (
                    <Chip
                      key={f.rotulo}
                      ativo={faixaAtiva(f)}
                      onClick={() =>
                        aoMudar({ ...valores, precoMin: faixaAtiva(f) ? "" : f.min, precoMax: faixaAtiva(f) ? "" : f.max })
                      }
                    >
                      {f.rotulo}
                    </Chip>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {(["precoMin", "precoMax"] as const).map((campo) => (
                    <div key={campo} className="relative">
                      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-texto-suave">R$</span>
                      <input
                        aria-label={campo === "precoMin" ? "Preço mínimo em reais" : "Preço máximo em reais"}
                        className={`${classeCampoPequeno} pl-10`}
                        placeholder={campo === "precoMin" ? "mínimo" : "máximo"}
                        inputMode="numeric"
                        type="number"
                        min={0}
                        value={valores[campo]}
                        onChange={(e) => definir(campo, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </Grupo>

              <Grupo rotulo="Algo mais que a gente deva saber?" htmlFor="observacoes">
                <div className="relative">
                  <textarea
                    id="observacoes"
                    className={`${classeCampo} min-h-28 resize-y pb-7`}
                    placeholder="Ex.: quero algo que disfarce a barriga e dê para usar sutiã"
                    value={valores.observacoes}
                    onChange={(e) => definir("observacoes", e.target.value)}
                    maxLength={400}
                  />
                  <span className="pointer-events-none absolute bottom-3 right-4 text-xs text-texto-suave/80">
                    {valores.observacoes.length}/400
                  </span>
                </div>
              </Grupo>
            </div>
          </div>
        </div>
      </section>

      {erros.length > 0 && (
        <div role="alert" className="surgir rounded-2xl border border-destaque/30 bg-primaria-suave px-4 py-3 text-sm text-primaria-forte">
          {erros.map((e) => (
            <p key={e}>{e}</p>
          ))}
        </div>
      )}

      {/* botão fica "grudado" no rodapé da tela no celular enquanto a usuária preenche */}
      <div className="sticky bottom-3 z-10 -mx-1 lg:static">
        <button
          type="submit"
          disabled={carregando}
          className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-full bg-primaria px-6 py-4 text-base font-semibold tracking-wide text-white shadow-elevada transition-all duration-200 hover:-translate-y-0.5 hover:bg-primaria-forte active:translate-y-0 active:scale-[0.98] disabled:cursor-wait disabled:opacity-85"
        >
          <IconeFlor className={"size-5 text-white/90 transition-transform duration-500 " + (carregando ? "girar-lento" : "group-hover:rotate-[72deg]")} />
          {carregando ? "Procurando seu vestido…" : "Encontrar meu vestido"}
        </button>
      </div>
      {algoPreenchido && !carregando && (
        <button
          type="button"
          onClick={() => {
            setTecidoEmFoco(null);
            setAvisoLimiteCores(false);
            aoMudar(VALORES_INICIAIS);
          }}
          className="-mt-6 mx-auto block rounded-full px-3 py-1 text-sm text-texto-suave underline-offset-4 transition hover:text-primaria hover:underline"
        >
          Limpar escolhas
        </button>
      )}
    </form>
  );
}

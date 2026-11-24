"use client";

import { useId, useState, type CSSProperties, type ReactNode } from "react";
import { OCASIOES_SUGERIDAS, TAMANHOS } from "@/lib/tipos";
import { IconeFlor, IconeSeta } from "./icones";

export interface ValoresFormulario {
  ocasiao: string;
  comprimento: string;
  cor: string;
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
  tecido: "",
  decoteManga: "",
  estilo: "",
  tamanho: "",
  precoMin: "",
  precoMax: "",
  observacoes: "",
};

// ---------------------------------------------------------------------------
// Opções prontas (menos digitação, principalmente no celular)

const CORES: { nome: string; fundo: string }[] = [
  { nome: "preto", fundo: "#2b2626" },
  { nome: "branco", fundo: "#ffffff" },
  { nome: "off-white", fundo: "#f3eadb" },
  { nome: "nude", fundo: "#e2c3a6" },
  { nome: "rosa", fundo: "#f1a9b9" },
  { nome: "vermelho", fundo: "#c7363f" },
  { nome: "vinho", fundo: "#7a2336" },
  { nome: "lilás", fundo: "#c4a7dd" },
  { nome: "azul", fundo: "#76a3d9" },
  { nome: "azul marinho", fundo: "#25365c" },
  { nome: "verde", fundo: "#6f9b6a" },
  { nome: "verde-oliva", fundo: "#7e7b46" },
  { nome: "amarelo", fundo: "#f2cf5b" },
  { nome: "dourado", fundo: "linear-gradient(135deg,#f1d27f,#b58a33)" },
  { nome: "prata", fundo: "linear-gradient(135deg,#f0f0f0,#a8a8a8)" },
  { nome: "floral", fundo: "radial-gradient(circle at 30% 30%,#f1a9b9 0 22%,transparent 23%),radial-gradient(circle at 72% 64%,#c4a7dd 0 20%,transparent 21%),radial-gradient(circle at 70% 22%,#a9c0a0 0 14%,transparent 15%),#fff8ef" },
];
const TECIDOS = ["cetim", "linho", "renda", "tule", "malha", "crepe", "viscose", "veludo"];
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
          ? "border-rosa bg-rosa text-white shadow-[0_6px_16px_-6px_rgb(194_106_122/0.7)]"
          : "border-linha bg-papel text-tinta hover:-translate-y-0.5 hover:border-rosa/50 hover:bg-rosa-bebe")
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
        <span className="font-cursiva text-3xl leading-none text-rosa" aria-hidden>
          {numero}
        </span>
        <div>
          <h2 className="font-titulo text-2xl font-semibold leading-tight">{titulo}</h2>
          {ajuda && <p className="text-sm text-suave">{ajuda}</p>}
        </div>
      </header>
      {children}
    </section>
  );
}

function Grupo({ rotulo, children, htmlFor }: { rotulo: string; children: ReactNode; htmlFor?: string }) {
  return (
    <div className="space-y-2.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-tinta">
        {rotulo}
      </label>
      {children}
    </div>
  );
}

const classeCampo =
  "w-full rounded-2xl border border-linha bg-papel px-4 py-3 text-base text-tinta placeholder:text-suave/70 " +
  "transition focus:border-rosa focus:outline-none focus:ring-4 focus:ring-rosa/15";

const classeCampoPequeno =
  "w-full rounded-xl border border-dashed border-linha bg-transparent px-3.5 py-2 text-sm text-tinta placeholder:text-suave/80 " +
  "transition focus:border-solid focus:border-rosa focus:bg-papel focus:outline-none focus:ring-4 focus:ring-rosa/15";

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
          className={classeCampo + (ocasiaoComErro ? " border-rosa ring-4 ring-rosa/15" : "")}
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
                      ? "border-rosa bg-rosa-bebe text-rosa shadow-[0_8px_20px_-10px_rgb(194_106_122/0.8)]"
                      : "border-linha bg-papel text-suave hover:-translate-y-0.5 hover:border-rosa/40 hover:text-rosa/80")
                  }
                >
                  <Silhueta comprimento={c} />
                  <span className={"text-sm capitalize " + (ativo ? "font-semibold" : "text-tinta")}>{c}</span>
                </button>
              );
            })}
          </div>
        </Grupo>

        <Grupo rotulo="Cor ou estampa">
          <div className="flex flex-wrap gap-2">
            {CORES.map((c) => (
              <Chip key={c.nome} ativo={valores.cor.toLowerCase() === c.nome} onClick={() => alternar("cor", c.nome)} bolinha={c.fundo}>
                {c.nome}
              </Chip>
            ))}
          </div>
          <input
            aria-label="Outra cor ou estampa"
            className={classeCampoPequeno}
            placeholder="ou escreva outra cor ou estampa…"
            value={CORES.some((c) => c.nome === valores.cor.toLowerCase()) ? "" : valores.cor}
            onChange={(e) => definir("cor", e.target.value)}
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
          <div className="flex flex-wrap gap-2">
            {TECIDOS.map((t) => (
              <Chip key={t} ativo={valores.tecido.toLowerCase() === t} onClick={() => alternar("tecido", t)}>
                {t}
              </Chip>
            ))}
          </div>
          <input
            aria-label="Outro tecido"
            className={classeCampoPequeno}
            placeholder="ou escreva outro tecido…"
            value={TECIDOS.includes(valores.tecido.toLowerCase()) ? "" : valores.tecido}
            onChange={(e) => definir("tecido", e.target.value)}
            maxLength={60}
          />
        </Grupo>
      </Secao>

      {/* 3. Detalhes finais (abre sob demanda) */}
      <section className="rounded-3xl border border-linha bg-creme/60">
        <button
          type="button"
          aria-expanded={detalhesAbertos}
          aria-controls={idDetalhes}
          onClick={() => setDetalhesAbertos((v) => !v)}
          className="flex w-full items-center gap-3 rounded-3xl px-5 py-4 text-left transition hover:bg-rosa-bebe/60"
        >
          <span className="font-cursiva text-3xl leading-none text-rosa" aria-hidden>
            3
          </span>
          <span className="flex-1">
            <span className="block font-titulo text-2xl font-semibold leading-tight">Detalhes finais</span>
            <span className="block text-sm text-suave">
              {qtdDetalhes > 0
                ? `${qtdDetalhes} ${qtdDetalhes === 1 ? "detalhe escolhido" : "detalhes escolhidos"}`
                : "Decote, manga, tamanho, preço e observações"}
            </span>
          </span>
          <IconeSeta className={"size-5 text-suave transition-transform duration-300 " + (detalhesAbertos ? "rotate-180" : "")} />
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
                      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-suave">R$</span>
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
                  <span className="pointer-events-none absolute bottom-3 right-4 text-xs text-suave/80">
                    {valores.observacoes.length}/400
                  </span>
                </div>
              </Grupo>
            </div>
          </div>
        </div>
      </section>

      {erros.length > 0 && (
        <div role="alert" className="surgir rounded-2xl border border-rosa/30 bg-rosa-bebe px-4 py-3 text-sm text-rosa-forte">
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
          className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-full bg-rosa px-6 py-4 text-base font-semibold tracking-wide text-white shadow-elevada transition-all duration-200 hover:-translate-y-0.5 hover:bg-rosa-forte active:translate-y-0 active:scale-[0.98] disabled:cursor-wait disabled:opacity-85"
        >
          <IconeFlor className={"size-5 text-white/90 transition-transform duration-500 " + (carregando ? "girar-lento" : "group-hover:rotate-[72deg]")} />
          {carregando ? "Procurando seu vestido…" : "Encontrar meu vestido"}
        </button>
      </div>
      {algoPreenchido && !carregando && (
        <button
          type="button"
          onClick={() => aoMudar(VALORES_INICIAIS)}
          className="-mt-6 mx-auto block rounded-full px-3 py-1 text-sm text-suave underline-offset-4 transition hover:text-rosa hover:underline"
        >
          Limpar escolhas
        </button>
      )}
    </form>
  );
}

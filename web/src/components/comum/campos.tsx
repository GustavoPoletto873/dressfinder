"use client";

/**
 * Peças de formulário compartilhadas pelos dois modos: chips, seções,
 * grupos, faixa de preço, observações, seção recolhível, erros e botões.
 * A aparência vem das classes do tema (bg-primaria, border-borda...).
 */
import { useId, useState, type CSSProperties, type ReactNode } from "react";
import { IconeFlor, IconeSeta } from "./icones";

// ---------------------------------------------------------------------------
// Utilitários de listas separadas por vírgula ("decote V, manga curta")

/** Liga/desliga um item numa lista separada por vírgulas. */
export function alternarNaLista(texto: string, item: string): string {
  const itens = texto.split(",").map((t) => t.trim()).filter(Boolean);
  const existe = itens.some((t) => t.toLowerCase() === item.toLowerCase());
  return (existe ? itens.filter((t) => t.toLowerCase() !== item.toLowerCase()) : [...itens, item]).join(", ");
}

export function contemNaLista(texto: string, item: string): boolean {
  return texto.split(",").some((t) => t.trim().toLowerCase() === item.toLowerCase());
}

export function itensDaLista(texto: string): string[] {
  return texto.split(",").map((t) => t.trim()).filter(Boolean);
}

/** Junta as cores da paleta com a cor digitada num único campo ("azul, dourado, verde água"). */
export function juntarCores(cor: string, corOutra: string): string {
  return [...new Set([...itensDaLista(cor), ...itensDaLista(corOutra)])].join(", ");
}

// ---------------------------------------------------------------------------
// Classes dos campos de texto

export const classeCampo =
  "w-full rounded-2xl border border-borda bg-superficie px-4 py-3 text-base text-texto placeholder:text-texto-suave/70 " +
  "transition focus:border-destaque focus:outline-none focus:ring-4 focus:ring-destaque/15";

export const classeCampoPequeno =
  "w-full rounded-xl border border-dashed border-borda bg-transparent px-3.5 py-2 text-sm text-texto placeholder:text-texto-suave/80 " +
  "transition focus:border-solid focus:border-destaque focus:bg-superficie focus:outline-none focus:ring-4 focus:ring-destaque/15";

// ---------------------------------------------------------------------------
// Blocos de layout

export function Chip({
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

/** Linha de chips de escolha única (toque de novo desmarca). */
export function ChipsUnicos({ opcoes, valor, aoMudar }: { opcoes: readonly string[]; valor: string; aoMudar: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {opcoes.map((o) => (
        <Chip key={o} ativo={valor.toLowerCase() === o.toLowerCase()} onClick={() => aoMudar(valor.toLowerCase() === o.toLowerCase() ? "" : o)}>
          {o}
        </Chip>
      ))}
    </div>
  );
}

/** Linha de chips de escolha múltipla, guardada como lista separada por vírgulas. */
export function ChipsMultiplos({ opcoes, valor, aoMudar }: { opcoes: readonly string[]; valor: string; aoMudar: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {opcoes.map((o) => (
        <Chip key={o} ativo={contemNaLista(valor, o)} onClick={() => aoMudar(alternarNaLista(valor, o))}>
          {o}
        </Chip>
      ))}
    </div>
  );
}

export function Secao({ numero, titulo, ajuda, children }: { numero: number; titulo: string; ajuda?: string; children: ReactNode }) {
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

export function Grupo({ rotulo, children, htmlFor }: { rotulo: string; children: ReactNode; htmlFor?: string }) {
  return (
    <div className="space-y-2.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-texto">
        {rotulo}
      </label>
      {children}
    </div>
  );
}

/** Seção numerada que abre e fecha (usada em "Detalhes finais"). */
export function SecaoRecolhivel({
  numero,
  titulo,
  descricaoVazia,
  quantidade,
  children,
}: {
  numero: number;
  titulo: string;
  /** Texto mostrado quando nada foi escolhido ainda. */
  descricaoVazia: string;
  quantidade: number;
  children: ReactNode;
}) {
  const [aberta, setAberta] = useState(false);
  const id = useId();
  return (
    <section className="rounded-3xl border border-borda bg-fundo/60">
      <button
        type="button"
        aria-expanded={aberta}
        aria-controls={id}
        onClick={() => setAberta((v) => !v)}
        className="flex w-full items-center gap-3 rounded-3xl px-5 py-4 text-left transition hover:bg-primaria-suave/60"
      >
        <span className="font-cursiva text-3xl leading-none text-primaria" aria-hidden>
          {numero}
        </span>
        <span className="flex-1">
          <span className="block font-titulo text-2xl font-semibold leading-tight">{titulo}</span>
          <span className="block text-sm text-texto-suave">
            {quantidade > 0
              ? `${quantidade} ${quantidade === 1 ? "detalhe escolhido" : "detalhes escolhidos"}`
              : descricaoVazia}
          </span>
        </span>
        <IconeSeta className={"size-5 text-texto-suave transition-transform duration-300 " + (aberta ? "rotate-180" : "")} />
      </button>

      <div
        id={id}
        className={"grid transition-[grid-template-rows] duration-300 ease-out " + (aberta ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
      >
        <div className="overflow-hidden" inert={!aberta}>
          <div className="space-y-7 px-5 pb-6 pt-2">{children}</div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Faixa de preço

const FAIXAS: { rotulo: string; min: string; max: string }[] = [
  { rotulo: "até R$ 100", min: "", max: "100" },
  { rotulo: "R$ 100 a 200", min: "100", max: "200" },
  { rotulo: "R$ 200 a 350", min: "200", max: "350" },
  { rotulo: "acima de R$ 350", min: "350", max: "" },
];

export function FaixaPreco({
  precoMin,
  precoMax,
  aoMudar,
}: {
  precoMin: string;
  precoMax: string;
  aoMudar: (precoMin: string, precoMax: string) => void;
}) {
  const faixaAtiva = (f: (typeof FAIXAS)[number]) => precoMin === f.min && precoMax === f.max;
  return (
    <Grupo rotulo="Quanto quer gastar?">
      <div className="flex flex-wrap gap-2">
        {FAIXAS.map((f) => (
          <Chip key={f.rotulo} ativo={faixaAtiva(f)} onClick={() => aoMudar(faixaAtiva(f) ? "" : f.min, faixaAtiva(f) ? "" : f.max)}>
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
              value={campo === "precoMin" ? precoMin : precoMax}
              onChange={(e) => (campo === "precoMin" ? aoMudar(e.target.value, precoMax) : aoMudar(precoMin, e.target.value))}
            />
          </div>
        ))}
      </div>
    </Grupo>
  );
}

// ---------------------------------------------------------------------------
// Observações livres

export function CampoObservacoes({
  id,
  valor,
  aoMudar,
  exemplo,
}: {
  id: string;
  valor: string;
  aoMudar: (v: string) => void;
  exemplo: string;
}) {
  return (
    <Grupo rotulo="Algo mais que a gente deva saber?" htmlFor={id}>
      <div className="relative">
        <textarea
          id={id}
          className={`${classeCampo} min-h-28 resize-y pb-7`}
          placeholder={exemplo}
          value={valor}
          onChange={(e) => aoMudar(e.target.value)}
          maxLength={400}
        />
        <span className="pointer-events-none absolute bottom-3 right-4 text-xs text-texto-suave/80">{valor.length}/400</span>
      </div>
    </Grupo>
  );
}

// ---------------------------------------------------------------------------
// Erros e botões do fim do formulário

export function CaixaErros({ erros }: { erros: string[] }) {
  if (erros.length === 0) return null;
  return (
    <div role="alert" className="surgir rounded-2xl border border-destaque/30 bg-primaria-suave px-4 py-3 text-sm text-primaria-forte">
      {erros.map((e) => (
        <p key={e}>{e}</p>
      ))}
    </div>
  );
}

/** Botão principal; fica "grudado" no rodapé da tela no celular enquanto a pessoa preenche. */
export function BotaoBuscar({ carregando, texto, textoCarregando }: { carregando: boolean; texto: string; textoCarregando: string }) {
  return (
    <div className="sticky bottom-3 z-10 -mx-1 lg:static">
      <button
        type="submit"
        disabled={carregando}
        className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-full bg-primaria px-6 py-4 text-base font-semibold tracking-wide text-white shadow-elevada transition-all duration-200 hover:-translate-y-0.5 hover:bg-primaria-forte active:translate-y-0 active:scale-[0.98] disabled:cursor-wait disabled:opacity-85"
      >
        <IconeFlor className={"size-5 text-white/90 transition-transform duration-500 " + (carregando ? "girar-lento" : "group-hover:rotate-[72deg]")} />
        {carregando ? textoCarregando : texto}
      </button>
    </div>
  );
}

export function BotaoLimpar({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="-mt-6 mx-auto block rounded-full px-3 py-1 text-sm text-texto-suave underline-offset-4 transition hover:text-primaria hover:underline"
    >
      Limpar escolhas
    </button>
  );
}

"use client";

/**
 * Peças de formulário compartilhadas pelos dois modos: chips, cartões de opção,
 * campo livre, grupos, faixa de preço, observações, erros e botão de limpar.
 * A aparência vem das classes do tema (bg-primaria, border-borda...).
 */
import { useRef, useState, type CSSProperties, type ComponentType, type ReactNode, type SVGProps } from "react";
import { IconeCheck, IconeLapis } from "./icones";

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

/** Cartão de opção: ícone, título e uma descrição curta. Bem maior que um chip, para tocar fácil. */
export function CartaoOpcao({
  ativo,
  onClick,
  titulo,
  descricao,
  Icone,
}: {
  ativo: boolean;
  onClick: () => void;
  titulo: string;
  descricao?: string;
  Icone?: ComponentType<SVGProps<SVGSVGElement>>;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className={
        "group relative flex min-h-[4.5rem] items-center gap-3 rounded-2xl border p-3 text-left transition-all duration-200 active:scale-[0.97] " +
        (ativo
          ? "border-primaria bg-primaria-suave shadow-cartao"
          : "border-borda bg-superficie hover:-translate-y-0.5 hover:border-destaque/50 hover:shadow-suave")
      }
    >
      {Icone && (
        <span
          className={
            "grid size-10 shrink-0 place-items-center rounded-full transition-colors " +
            (ativo ? "bg-primaria text-white" : "bg-primaria-suave text-primaria group-hover:bg-realce")
          }
        >
          <Icone className="size-5" />
        </span>
      )}
      <span className={"min-w-0 flex-1 " + (ativo && !Icone ? "pr-5" : "")}>
        <span className={"block text-sm leading-tight first-letter:uppercase " + (ativo ? "font-semibold text-primaria-forte" : "font-medium text-texto")}>
          {titulo}
        </span>
        {descricao && <span className="mt-0.5 block text-xs leading-snug text-texto-suave">{descricao}</span>}
      </span>
      {/* sem ícone, a marca de escolhido fica no canto (com espaço reservado no texto) */}
      {ativo && !Icone && (
        <span className="absolute right-2 top-2 grid size-5 place-items-center rounded-full bg-primaria text-white">
          <IconeCheck className="size-3.5" strokeWidth={2.6} />
        </span>
      )}
    </button>
  );
}

/**
 * Campo de texto livre "escondido" atrás de um link, para a tela não parecer
 * um formulário. Abre sozinho quando já há um valor digitado.
 */
export function CampoLivre({
  id,
  valor,
  aoMudar,
  convite,
  exemplo,
  rotulo,
  maxLength = 100,
  invalido = false,
  abertoInicial = false,
}: {
  id?: string;
  /** Valor digitado (vazio quando a escolha veio de um cartão). */
  valor: string;
  aoMudar: (v: string) => void;
  convite: string;
  exemplo: string;
  rotulo: string;
  maxLength?: number;
  invalido?: boolean;
  /** Já começa aberto e com o cursor (ex.: ao escolher "outra peça"). */
  abertoInicial?: boolean;
}) {
  const [aberto, setAberto] = useState(abertoInicial);
  const campo = useRef<HTMLInputElement>(null);
  if (!aberto && !valor) {
    return (
      <button
        type="button"
        onClick={() => {
          setAberto(true);
          requestAnimationFrame(() => campo.current?.focus());
        }}
        className="inline-flex items-center gap-1.5 rounded-full px-1 py-1 text-sm text-primaria-forte underline-offset-4 transition hover:underline"
      >
        <IconeLapis className="size-4" /> {convite}
      </button>
    );
  }
  return (
    <input
      id={id}
      ref={campo}
      aria-label={rotulo}
      aria-invalid={invalido}
      className={"surgir " + classeCampo + (invalido ? " border-destaque ring-4 ring-destaque/15" : "")}
      placeholder={exemplo}
      value={valor}
      onChange={(e) => aoMudar(e.target.value)}
      onBlur={() => !valor && setAberto(false)}
      autoFocus={abertoInicial}
      maxLength={maxLength}
      autoComplete="off"
    />
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

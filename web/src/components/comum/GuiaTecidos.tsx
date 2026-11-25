"use client";

/**
 * Guia de tecidos: grade com amostras de textura e a ficha do tecido tocado.
 * Cada modo passa a sua lista (vestidos e roupas usam tecidos diferentes).
 */
import { useRef, useState } from "react";
import { classeCampoPequeno, Grupo } from "./campos";
import { IconeCheck, IconeInfo } from "./icones";
import { AmostraTecido, ESCALAS, Escala, type Tecido } from "./tecidos";

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

export function GuiaTecidos({ tecidos, valor, aoMudar }: { tecidos: Tecido[]; valor: string; aoMudar: (tecido: string) => void }) {
  // o último tecido tocado aparece na ficha
  const [emFoco, setEmFoco] = useState<string | null>(null);
  const ficha = useRef<HTMLDivElement>(null);
  const tecidoDaFicha = tecidos.find((t) => t.nome === (emFoco ?? valor.toLowerCase())) ?? null;
  const alternar = (nome: string) => aoMudar(valor.toLowerCase() === nome.toLowerCase() ? "" : nome);
  const tocar = (nome: string) => {
    alternar(nome);
    setEmFoco(nome);
    // no celular a ficha fica abaixo da grade: rola só o necessário para ela aparecer
    requestAnimationFrame(() => ficha.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
  };

  return (
    <Grupo rotulo="Tecido">
      <p className="-mt-1 text-sm text-texto-suave">Toque em um tecido para escolher e ver como ele é.</p>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
        {tecidos.map((t) => (
          <CartaoTecido
            key={t.nome}
            tecido={t}
            ativo={valor.toLowerCase() === t.nome}
            emFoco={tecidoDaFicha?.nome === t.nome}
            onClick={() => tocar(t.nome)}
          />
        ))}
      </div>
      <div ref={ficha} className="scroll-mb-24" aria-live="polite">
        <FichaTecido
          tecido={tecidoDaFicha}
          escolhido={!!tecidoDaFicha && valor.toLowerCase() === tecidoDaFicha.nome}
          onEscolher={() => tecidoDaFicha && alternar(tecidoDaFicha.nome)}
        />
      </div>
      <input
        aria-label="Outro tecido"
        className={classeCampoPequeno}
        placeholder="ou escreva outro tecido…"
        value={tecidos.some((t) => t.nome === valor.toLowerCase()) ? "" : valor}
        onChange={(e) => {
          setEmFoco(null);
          aoMudar(e.target.value);
        }}
        maxLength={60}
      />
    </Grupo>
  );
}

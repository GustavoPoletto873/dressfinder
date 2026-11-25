"use client";

import { definirModo, useModo } from "./modo";

/**
 * Switch "Vestidos | Roupas".
 * Um único botão com role="switch": ligado = modo Roupas. A área inteira
 * (rótulos + trilho) é clicável, com 44 px de altura para tocar no celular.
 * Teclado: Tab para focar, Espaço ou Enter para alternar.
 */
export function SwitchModo() {
  const modo = useModo();
  const roupas = modo === "roupas";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={roupas}
      aria-label="Modo roupas"
      title={roupas ? "Voltar para vestidos" : "Procurar outras roupas"}
      onClick={() => definirModo(roupas ? "vestidos" : "roupas")}
      className="group inline-flex h-11 items-center gap-2.5 rounded-full border border-borda bg-superficie/90 px-4 text-sm font-medium shadow-suave backdrop-blur transition hover:-translate-y-0.5 hover:shadow-elevada active:translate-y-0"
    >
      <span aria-hidden className={roupas ? "text-texto-suave" : "text-primaria-forte"}>
        Vestidos
      </span>
      <span aria-hidden className="relative h-6 w-11 shrink-0 rounded-full bg-primaria-suave ring-1 ring-borda">
        <span
          className={
            "absolute left-0.5 top-0.5 size-5 rounded-full bg-primaria shadow-sm transition-transform duration-300 ease-out " +
            (roupas ? "translate-x-5" : "translate-x-0")
          }
        />
      </span>
      <span aria-hidden className={roupas ? "text-primaria-forte" : "text-texto-suave"}>
        Roupas
      </span>
    </button>
  );
}

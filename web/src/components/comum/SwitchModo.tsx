"use client";

import { definirModo, useModo } from "./modo";

/**
 * Switch "Vestidos | Roupas".
 * Um único botão com role="switch": ligado = modo Roupas. A área inteira
 * (rótulos + trilho) é clicável: 56 px de altura no celular e 64 px no desktop.
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
      className="group inline-flex h-14 items-center gap-3 rounded-full border border-borda bg-superficie/90 px-5 text-base font-medium shadow-suave backdrop-blur transition hover:-translate-y-0.5 hover:shadow-elevada active:translate-y-0 sm:h-16 sm:gap-4 sm:px-7 sm:text-lg"
    >
      <span aria-hidden className={roupas ? "text-texto-suave" : "text-primaria-forte"}>
        Vestidos
      </span>
      <span aria-hidden className="relative h-8 w-14 shrink-0 rounded-full bg-primaria-suave ring-1 ring-borda sm:h-9 sm:w-16">
        <span
          className={
            "absolute left-1 top-1 size-6 rounded-full bg-primaria shadow-sm transition-transform duration-300 ease-out sm:size-7 " +
            (roupas ? "translate-x-6 sm:translate-x-7" : "translate-x-0")
          }
        />
      </span>
      <span aria-hidden className={roupas ? "text-primaria-forte" : "text-texto-suave"}>
        Roupas
      </span>
    </button>
  );
}

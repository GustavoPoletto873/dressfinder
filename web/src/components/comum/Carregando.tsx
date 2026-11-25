"use client";

import { useEffect, useState } from "react";
import { useKitDecoracao } from "./kitDecoracao";

const MENSAGENS = [
  "Entendendo o que você imaginou…",
  "Escolhendo as melhores buscas…",
  "Passeando pelas araras da Shein…",
  "Separando as opções mais bonitas…",
];

export function Carregando() {
  const [indice, setIndice] = useState(0);
  const { ArranjoCarregando } = useKitDecoracao();

  // avança as mensagens; para na última para não "voltar ao começo"
  useEffect(() => {
    const id = setInterval(() => setIndice((i) => Math.min(i + 1, MENSAGENS.length - 1)), 3200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="surgir space-y-10" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-4 text-center">
        <svg viewBox="-100 -60 200 150" className="h-36 w-48 overflow-visible" aria-hidden>
          <ArranjoCarregando />
        </svg>
        <p key={indice} className="surgir font-titulo text-2xl italic text-texto">
          {MENSAGENS[indice]}
        </p>
        <p className="text-sm text-texto-suave">Isso leva alguns segundos.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" aria-hidden>
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="space-y-3">
            <div className="brilho aspect-[3/4] rounded-3xl" />
            <div className="brilho h-3.5 w-4/5 rounded-full" />
            <div className="brilho h-3.5 w-2/5 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

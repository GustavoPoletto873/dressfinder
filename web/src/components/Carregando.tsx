"use client";

import { useEffect, useState } from "react";
import { CORES, Em, Florzinha, Folha, Petala, Rosa } from "./flores";

const MENSAGENS = [
  "Entendendo o que você imaginou…",
  "Escolhendo as melhores buscas…",
  "Passeando pelas araras da Shein…",
  "Separando as opções mais bonitas…",
];

const PETALAS: { x: number; atraso: number; cor: string; escala: number }[] = [
  { x: -70, atraso: 0, cor: CORES.rosa, escala: 0.9 },
  { x: -25, atraso: 1.2, cor: CORES.lavanda, escala: 0.7 },
  { x: 30, atraso: 0.6, cor: CORES.pessego, escala: 0.8 },
  { x: 75, atraso: 2, cor: CORES.rosa, escala: 0.6 },
  { x: 5, atraso: 2.8, cor: CORES.lavanda, escala: 0.75 },
];

export function Carregando() {
  const [indice, setIndice] = useState(0);

  // avança as mensagens; para na última para não "voltar ao começo"
  useEffect(() => {
    const id = setInterval(() => setIndice((i) => Math.min(i + 1, MENSAGENS.length - 1)), 3200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="surgir space-y-10" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-4 text-center">
        <svg viewBox="-100 -60 200 150" className="h-36 w-48 overflow-visible" aria-hidden>
          {PETALAS.map((p, i) => (
            <g key={i} transform={`translate(${p.x} -50) scale(${p.escala})`}>
              <g className="petala-caindo" style={{ animationDelay: `${p.atraso}s` }}>
                <Petala cor={p.cor} />
              </g>
            </g>
          ))}
          <Em x={-34} y={14} r={-160} s={0.9}><Folha /></Em>
          <Em x={32} y={16} r={-20} s={0.9}><Folha /></Em>
          <Em x={-30} y={-10} s={0.55}><Florzinha cor={CORES.lavanda} /></Em>
          <Em x={32} y={-8} s={0.5}><Florzinha /></Em>
          <g className="girar-lento">
            <Em x={0} y={0} s={1.6}><Rosa /></Em>
          </g>
        </svg>
        <p key={indice} className="surgir font-titulo text-2xl italic text-tinta">
          {MENSAGENS[indice]}
        </p>
        <p className="text-sm text-suave">Isso leva alguns segundos.</p>
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

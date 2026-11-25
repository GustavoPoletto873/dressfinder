/**
 * Kit de decoração do modo Vestidos: os pequenos arranjos de flores usados
 * pelos componentes compartilhados (carregamento, favoritos, resultados).
 * Cada arranjo devolve só o conteúdo do <svg>; quem usa define o viewBox.
 */
import type { KitDecoracao } from "../comum/kitDecoracao";
import { CORES, Em, Florzinha, Folha, Margarida, Petala, Rosa } from "./flores";
import { Florzinhas, RamoCanto } from "./Ramos";

const PETALAS: { x: number; atraso: number; cor: string; escala: number }[] = [
  { x: -70, atraso: 0, cor: CORES.rosa, escala: 0.9 },
  { x: -25, atraso: 1.2, cor: CORES.lavanda, escala: 0.7 },
  { x: 30, atraso: 0.6, cor: CORES.pessego, escala: 0.8 },
  { x: 75, atraso: 2, cor: CORES.rosa, escala: 0.6 },
  { x: 5, atraso: 2.8, cor: CORES.lavanda, escala: 0.75 },
];

export const KIT_VESTIDOS: KitDecoracao = {
  RamoCanto,
  Enfeite: Florzinhas,

  /** viewBox "-100 -60 200 150" */
  ArranjoCarregando: () => (
    <>
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
    </>
  ),

  /** viewBox "-50 -40 100 70" */
  ArranjoVazio: () => (
    <>
      <Em x={-22} y={4} r={-160} s={0.8}><Folha /></Em>
      <Em x={20} y={6} r={-20} s={0.8}><Folha /></Em>
      <Em x={0} y={0} s={1.1}><Rosa /></Em>
      <Em x={-26} y={-14} s={0.6}><Florzinha cor={CORES.lavanda} /></Em>
      <Em x={28} y={-12} s={0.55}><Margarida /></Em>
    </>
  ),

  /** viewBox "-30 -30 60 60" */
  FlorSemFoto: () => (
    <>
      <Em x={-14} y={10} r={-150} s={0.6}><Folha /></Em>
      <Em x={0} y={0}><Margarida /></Em>
    </>
  ),

  /** viewBox "-12 -12 24 24" */
  FlorAviso: () => <Florzinha cor={CORES.lavanda} />,
};

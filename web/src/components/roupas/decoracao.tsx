/**
 * Kit de decoração do modo Roupas: mesmos arranjos do modo Vestidos
 * (mesmas posições e tamanhos), com hortênsias, miosótis e centáureas.
 */
import type { KitDecoracao } from "../comum/kitDecoracao";
import { CORES_AZUIS, Centaurea, Em, FolhaFria, Hortensia, Miosotis, PetalaAzul } from "./flores";
import { FlorzinhasRoupas, RamoCantoRoupas } from "./Ramos";

const PETALAS: { x: number; atraso: number; cor: string; escala: number }[] = [
  { x: -70, atraso: 0, cor: CORES_AZUIS.azul, escala: 0.9 },
  { x: -25, atraso: 1.2, cor: CORES_AZUIS.azulClaro, escala: 0.7 },
  { x: 30, atraso: 0.6, cor: CORES_AZUIS.lilasAzulado, escala: 0.8 },
  { x: 75, atraso: 2, cor: CORES_AZUIS.azul, escala: 0.6 },
  { x: 5, atraso: 2.8, cor: CORES_AZUIS.azulClaro, escala: 0.75 },
];

export const KIT_ROUPAS: KitDecoracao = {
  RamoCanto: RamoCantoRoupas,
  Enfeite: FlorzinhasRoupas,

  ArranjoCarregando: () => (
    <>
      {PETALAS.map((p, i) => (
        <g key={i} transform={`translate(${p.x} -50) scale(${p.escala})`}>
          <g className="petala-caindo" style={{ animationDelay: `${p.atraso}s` }}>
            <PetalaAzul cor={p.cor} />
          </g>
        </g>
      ))}
      <Em x={-34} y={14} r={-160} s={0.9}><FolhaFria /></Em>
      <Em x={32} y={16} r={-20} s={0.9}><FolhaFria /></Em>
      <Em x={-30} y={-10} s={0.65}><Miosotis /></Em>
      <Em x={32} y={-8} s={0.45}><Centaurea /></Em>
      <g className="girar-lento">
        <Em x={0} y={0} s={1.25}><Hortensia /></Em>
      </g>
    </>
  ),

  ArranjoVazio: () => (
    <>
      <Em x={-22} y={4} r={-160} s={0.8}><FolhaFria /></Em>
      <Em x={20} y={6} r={-20} s={0.8}><FolhaFria /></Em>
      <Em x={0} y={0} s={0.9}><Hortensia /></Em>
      <Em x={-26} y={-14} s={0.7}><Miosotis /></Em>
      <Em x={28} y={-12} s={0.5}><Centaurea /></Em>
    </>
  ),

  FlorSemFoto: () => (
    <>
      <Em x={-14} y={10} r={-150} s={0.6}><FolhaFria /></Em>
      <Em x={0} y={0}><Centaurea /></Em>
    </>
  ),

  FlorAviso: () => (
    <Em x={0} y={0} s={1.1}>
      <Miosotis />
    </Em>
  ),
};

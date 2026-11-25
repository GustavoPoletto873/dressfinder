/**
 * Ramos de flores decorativos que "crescem" ao abrir a página.
 * Puramente visuais: escondidos de leitores de tela e sem capturar cliques.
 */
import type { CSSProperties } from "react";
import { Botao, Caule, CORES, Em, Florzinha, Folha, Frutinhas, Lavanda, Margarida, Rosa, Tulipa } from "./flores";

/** Ramo que nasce no canto superior esquerdo (0,0) e se espalha para dentro. */
export function RamoCanto({ className = "", atrasoBase = 0, style }: { className?: string; atrasoBase?: number; style?: CSSProperties }) {
  const a = (s: number) => atrasoBase + s;
  return (
    <svg viewBox="0 0 340 300" className={className} style={style} aria-hidden focusable="false">
      <g className="balancar">
        {/* caules principais */}
        <Caule d="M -4 -4 C 40 40, 80 110, 165 160" atrasoS={a(0)} largura={2.6} />
        <Caule d="M -4 -4 C 60 15, 140 22, 248 60" atrasoS={a(0.15)} largura={2.4} />
        <Caule d="M -4 -4 C 18 60, 24 140, 50 222" atrasoS={a(0.3)} largura={2.2} />
        {/* galhinhos */}
        <Caule d="M 58 72 C 82 78, 108 86, 132 100" atrasoS={a(0.7)} largura={1.5} />
        <Caule d="M 168 36 C 180 54, 188 72, 194 94" atrasoS={a(0.8)} largura={1.5} />
        <Caule d="M 24 112 C 42 128, 62 138, 90 146" atrasoS={a(0.9)} largura={1.4} />
        <Caule d="M 118 118 C 150 116, 186 116, 222 128" atrasoS={a(1)} largura={1.4} />

        {/* folhas */}
        <Em x={28} y={34} r={-15}><Folha atrasoS={a(0.8)} tamanho={0.9} /></Em>
        <Em x={44} y={60} r={150}><Folha atrasoS={a(0.9)} tamanho={0.8} cor={CORES.folhaEscura} /></Em>
        <Em x={92} y={112} r={25}><Folha atrasoS={a(1.1)} /></Em>
        <Em x={140} y={145} r={170}><Folha atrasoS={a(1.3)} tamanho={0.85} /></Em>
        <Em x={70} y={12} r={-25}><Folha atrasoS={a(0.9)} tamanho={0.8} /></Em>
        <Em x={140} y={28} r={70}><Folha atrasoS={a(1)} tamanho={0.9} cor={CORES.folhaEscura} /></Em>
        <Em x={205} y={46} r={-35}><Folha atrasoS={a(1.2)} tamanho={0.75} /></Em>
        <Em x={14} y={78} r={200}><Folha atrasoS={a(1)} tamanho={0.8} /></Em>
        <Em x={30} y={168} r={15}><Folha atrasoS={a(1.2)} tamanho={0.9} /></Em>
        <Em x={40} y={200} r={160}><Folha atrasoS={a(1.4)} tamanho={0.75} cor={CORES.folhaEscura} /></Em>
        <Em x={180} y={118} r={-60}><Folha atrasoS={a(1.4)} tamanho={0.7} /></Em>

        {/* lavanda */}
        <Em x={96} y={20} r={118}><Lavanda atrasoS={a(0.9)} altura={50} /></Em>
        <Em x={62} y={92} r={150}><Lavanda atrasoS={a(1.1)} altura={38} /></Em>

        {/* flores */}
        <Em x={165} y={160} s={1.2}><Rosa atrasoS={a(1.5)} /></Em>
        <Em x={248} y={60} s={1}><Margarida atrasoS={a(1.6)} /></Em>
        <Em x={52} y={226} r={170} s={1}><Tulipa atrasoS={a(1.7)} /></Em>
        <Em x={132} y={100} s={0.85}><Florzinha atrasoS={a(1.8)} cor={CORES.lavanda} /></Em>
        <Em x={194} y={98} s={0.8}><Florzinha atrasoS={a(1.9)} /></Em>
        <Em x={222} y={128} s={0.75}><Rosa atrasoS={a(2)} tom="pessego" /></Em>
        <Em x={92} y={148}><Frutinhas atrasoS={a(2)} /></Em>
        <Em x={212} y={22} s={0.55}><Florzinha atrasoS={a(2.1)} cor={CORES.lavanda} /></Em>
        <Em x={112} y={58} s={0.5}><Florzinha atrasoS={a(2.2)} cor={CORES.manteiga} miolo={CORES.branco} /></Em>
        <Em x={276} y={88} s={0.6}><Margarida atrasoS={a(2.2)} /></Em>
        <Em x={160} y={74} r={30}><Botao atrasoS={a(2)} /></Em>
        <Em x={70} y={130} r={-150}><Botao atrasoS={a(2.1)} cor={CORES.lavandaForte} /></Em>
        <Em x={10} y={140} s={0.6}><Florzinha atrasoS={a(2.3)} /></Em>
      </g>
    </svg>
  );
}

/** Pequeno arranjo para separar seções (ex.: rodapé e títulos). */
export function Florzinhas({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="-60 -16 120 32" className={className} aria-hidden focusable="false">
      <Caule d="M -56 4 C -30 -8, -10 10, 0 0 C 10 -10, 30 8, 56 -4" largura={1.2} />
      <Em x={-36} y={-2} r={-30} s={0.5}><Folha /></Em>
      <Em x={30} y={2} r={150} s={0.5}><Folha /></Em>
      <Em x={0} y={0} s={0.7}><Rosa /></Em>
      <Em x={-20} y={2} s={0.45}><Florzinha cor={CORES.lavanda} /></Em>
      <Em x={20} y={-2} s={0.45}><Margarida /></Em>
    </svg>
  );
}

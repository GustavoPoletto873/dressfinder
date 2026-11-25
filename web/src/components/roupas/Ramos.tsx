/**
 * Ramos do modo Roupas. Mesma composição (caules, folhas e posições) dos
 * ramos do modo Vestidos, trocando as flores por hortênsias, miosótis,
 * centáureas e delfínios em azul e branco.
 */
import { BotaoAzul, CauleFrio, Centaurea, Delfinio, Em, FolhaFria, FrutinhasAzuis, Hortensia, Miosotis } from "./flores";

/** Ramo que nasce no canto superior esquerdo (0,0) e se espalha para dentro. */
export function RamoCantoRoupas({ className = "", atrasoBase = 0 }: { className?: string; atrasoBase?: number }) {
  const a = (s: number) => atrasoBase + s;
  return (
    <svg viewBox="0 0 340 300" className={className} aria-hidden focusable="false">
      <g className="balancar">
        {/* caules principais */}
        <CauleFrio d="M -4 -4 C 40 40, 80 110, 165 160" atrasoS={a(0)} largura={2.6} />
        <CauleFrio d="M -4 -4 C 60 15, 140 22, 248 60" atrasoS={a(0.15)} largura={2.4} />
        <CauleFrio d="M -4 -4 C 18 60, 24 140, 50 222" atrasoS={a(0.3)} largura={2.2} />
        {/* galhinhos */}
        <CauleFrio d="M 58 72 C 82 78, 108 86, 132 100" atrasoS={a(0.7)} largura={1.5} />
        <CauleFrio d="M 168 36 C 180 54, 188 72, 194 94" atrasoS={a(0.8)} largura={1.5} />
        <CauleFrio d="M 24 112 C 42 128, 62 138, 90 146" atrasoS={a(0.9)} largura={1.4} />
        <CauleFrio d="M 118 118 C 150 116, 186 116, 222 128" atrasoS={a(1)} largura={1.4} />

        {/* folhas */}
        <Em x={28} y={34} r={-15}><FolhaFria atrasoS={a(0.8)} tamanho={0.9} /></Em>
        <Em x={44} y={60} r={150}><FolhaFria atrasoS={a(0.9)} tamanho={0.8} escura /></Em>
        <Em x={92} y={112} r={25}><FolhaFria atrasoS={a(1.1)} /></Em>
        <Em x={140} y={145} r={170}><FolhaFria atrasoS={a(1.3)} tamanho={0.85} /></Em>
        <Em x={70} y={12} r={-25}><FolhaFria atrasoS={a(0.9)} tamanho={0.8} /></Em>
        <Em x={140} y={28} r={70}><FolhaFria atrasoS={a(1)} tamanho={0.9} escura /></Em>
        <Em x={205} y={46} r={-35}><FolhaFria atrasoS={a(1.2)} tamanho={0.75} /></Em>
        <Em x={14} y={78} r={200}><FolhaFria atrasoS={a(1)} tamanho={0.8} /></Em>
        <Em x={30} y={168} r={15}><FolhaFria atrasoS={a(1.2)} tamanho={0.9} /></Em>
        <Em x={40} y={200} r={160}><FolhaFria atrasoS={a(1.4)} tamanho={0.75} escura /></Em>
        <Em x={180} y={118} r={-60}><FolhaFria atrasoS={a(1.4)} tamanho={0.7} /></Em>

        {/* delfínios (no lugar das lavandas) */}
        <Em x={96} y={20} r={118}><Delfinio atrasoS={a(0.9)} altura={52} /></Em>
        <Em x={62} y={92} r={150}><Delfinio atrasoS={a(1.1)} altura={40} /></Em>

        {/* flores */}
        <Em x={165} y={160} s={1.15}><Hortensia atrasoS={a(1.5)} /></Em>
        <Em x={248} y={60} s={1}><Centaurea atrasoS={a(1.6)} /></Em>
        <Em x={52} y={226} s={0.85}><Centaurea atrasoS={a(1.7)} /></Em>
        <Em x={132} y={100} s={1.05}><Miosotis atrasoS={a(1.8)} /></Em>
        <Em x={194} y={98} s={0.95}><Miosotis atrasoS={a(1.9)} tom="branco" /></Em>
        <Em x={222} y={128} s={0.7}><Hortensia atrasoS={a(2)} tom="branca" /></Em>
        <Em x={92} y={148}><FrutinhasAzuis atrasoS={a(2)} /></Em>
        <Em x={212} y={22} s={0.7}><Miosotis atrasoS={a(2.1)} /></Em>
        <Em x={112} y={58} s={0.65}><Miosotis atrasoS={a(2.2)} tom="branco" /></Em>
        <Em x={276} y={88} s={0.6}><Centaurea atrasoS={a(2.2)} /></Em>
        <Em x={160} y={74} r={30}><BotaoAzul atrasoS={a(2)} /></Em>
        <Em x={70} y={130} r={-150}><BotaoAzul atrasoS={a(2.1)} cor="#6f93cc" /></Em>
        <Em x={10} y={140} s={0.75}><Miosotis atrasoS={a(2.3)} /></Em>
      </g>
    </svg>
  );
}

/** Pequeno arranjo para separar seções (título e rodapé). */
export function FlorzinhasRoupas({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="-60 -16 120 32" className={className} aria-hidden focusable="false">
      <CauleFrio d="M -56 4 C -30 -8, -10 10, 0 0 C 10 -10, 30 8, 56 -4" largura={1.2} />
      <Em x={-36} y={-2} r={-30} s={0.5}><FolhaFria /></Em>
      <Em x={30} y={2} r={150} s={0.5}><FolhaFria /></Em>
      <Em x={0} y={0} s={0.62}><Hortensia /></Em>
      <Em x={-20} y={2} s={0.55}><Miosotis /></Em>
      <Em x={20} y={-2} s={0.45}><Centaurea /></Em>
    </svg>
  );
}

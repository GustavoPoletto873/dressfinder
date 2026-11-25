/**
 * Flores do modo Vestidos: rosas, margaridas, florzinhas, lavandas e tulipas,
 * em tons de rosa, pêssego, lavanda e manteiga.
 *
 * Cada flor é desenhada centrada em (0,0). Quem usa posiciona com <Em x y ...>.
 * As peças genéricas (caule, folha, botão...) ficam em comum/botanica.tsx.
 */
import { atraso, Botao as BotaoBase, Caule, Em, Folha, FOLHAGEM, Frutinhas as FrutinhasBase, Petala as PetalaBase } from "../comum/botanica";

export { Caule, Em, Folha };

export const CORES = {
  ...FOLHAGEM,
  rosa: "#f2b8c2",
  rosaMedio: "#e695a3",
  rosaForte: "#c96a7d",
  pessego: "#f6c7b0",
  lavanda: "#c3b0e0",
  lavandaForte: "#a38bcf",
  manteiga: "#f3d98e",
  miolo: "#e9b949",
  branco: "#fffdf8",
  contorno: "#e7d9c9",
  coral: "#ef9a8b",
};

/** Rosa em camadas, com espiral no miolo. */
export function Rosa({ atrasoS = 0, tom = "rosa" }: { atrasoS?: number; tom?: "rosa" | "pessego" }) {
  const externa = tom === "rosa" ? CORES.rosa : CORES.pessego;
  const media = tom === "rosa" ? CORES.rosaMedio : "#eea98f";
  const forte = tom === "rosa" ? CORES.rosaForte : "#d9876b";
  return (
    <g className="florescer" style={atraso(atrasoS)}>
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <ellipse key={`e${a}`} cx={0} cy={-12} rx={12.5} ry={10.5} fill={externa} stroke={media} strokeWidth={0.6} transform={`rotate(${a})`} />
      ))}
      {[30, 102, 174, 246, 318].map((a) => (
        <ellipse key={`m${a}`} cx={0} cy={-6.5} rx={8.5} ry={7.5} fill={media} stroke={forte} strokeWidth={0.5} transform={`rotate(${a})`} />
      ))}
      <circle r={6.5} fill={forte} />
      <path d="M0 0 c 2.4 -2.4 5.6 0 4 3.2 c -2.4 4 -8 2.4 -8 -2.4 c 0 -5.6 7.2 -8 11.2 -4" stroke="#a9505f" strokeWidth={1.3} fill="none" strokeLinecap="round" />
    </g>
  );
}

/** Margarida branca de miolo amarelo. */
export function Margarida({ atrasoS = 0 }: { atrasoS?: number }) {
  return (
    <g className="florescer" style={atraso(atrasoS)}>
      {Array.from({ length: 13 }, (_, i) => (
        <ellipse key={i} cx={0} cy={-12.5} rx={3.6} ry={10} fill={CORES.branco} stroke={CORES.contorno} strokeWidth={0.8} transform={`rotate(${(360 / 13) * i})`} />
      ))}
      <circle r={6} fill={CORES.miolo} />
      <circle r={6} fill="none" stroke="#d6a23a" strokeWidth={0.8} />
      {[[-2, -1.5], [1.8, -2], [0.5, 1.8], [-1.5, 2], [2.4, 1]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={0.7} fill="#c98f2c" />
      ))}
    </g>
  );
}

/** Florzinha de cinco pétalas (tipo cerejeira / miosótis). */
export function Florzinha({ atrasoS = 0, cor = CORES.rosa, miolo = CORES.manteiga }: { atrasoS?: number; cor?: string; miolo?: string }) {
  return (
    <g className="florescer" style={atraso(atrasoS)}>
      {[0, 72, 144, 216, 288].map((a) => (
        <path key={a} d="M0 0 C -6 -4, -6 -12, 0 -12.5 C 6 -12, 6 -4, 0 0 Z" fill={cor} stroke="#ffffff" strokeWidth={0.6} transform={`rotate(${a})`} />
      ))}
      <circle r={2.8} fill={miolo} />
    </g>
  );
}

/** Raminho de lavanda: botões ao longo de um cabinho que sobe a partir de (0,0). */
export function Lavanda({ atrasoS = 0, altura = 46 }: { atrasoS?: number; altura?: number }) {
  const botoes = 9;
  return (
    <g>
      <Caule d={`M0 0 L0 ${-altura}`} atrasoS={atrasoS} largura={1.4} />
      {Array.from({ length: botoes }, (_, i) => {
        const y = -altura * 0.35 - (i * altura * 0.65) / botoes;
        const lado = i % 2 === 0 ? -1 : 1;
        return (
          <g key={i} transform={`translate(${lado * 2.4} ${y}) rotate(${lado * 25})`}>
            <ellipse className="florescer" style={atraso(atrasoS + 0.5 + i * 0.07)} rx={2.6} ry={4} fill={i % 3 === 0 ? CORES.lavandaForte : CORES.lavanda} />
          </g>
        );
      })}
    </g>
  );
}

/** Tulipa apontando para cima. */
export function Tulipa({ atrasoS = 0, cor = CORES.coral }: { atrasoS?: number; cor?: string }) {
  return (
    <g className="florescer" style={atraso(atrasoS)}>
      <path d="M-11 -2 C -13 -20, -5 -26, 0 -17 C 5 -26, 13 -20, 11 -2 C 7 7, -7 7, -11 -2 Z" fill={cor} />
      <path d="M0 -17 C -4 -8, -4 0, 0 5 C 4 0, 4 -8, 0 -17 Z" fill="#e47f6f" opacity={0.7} />
    </g>
  );
}

/** Botão de flor fechado (rosa, por padrão). */
export function Botao({ atrasoS = 0, cor = CORES.rosaMedio }: { atrasoS?: number; cor?: string }) {
  return <BotaoBase atrasoS={atrasoS} cor={cor} />;
}

/** Cachinho de frutinhas (rosadas, por padrão). */
export function Frutinhas({ atrasoS = 0, cor = "#e8b4bf" }: { atrasoS?: number; cor?: string }) {
  return <FrutinhasBase atrasoS={atrasoS} cor={cor} />;
}

/** Pétala solta (rosa, por padrão). */
export function Petala({ cor = CORES.rosa }: { cor?: string }) {
  return <PetalaBase cor={cor} />;
}

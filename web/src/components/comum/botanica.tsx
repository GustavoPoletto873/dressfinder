/**
 * Peças botânicas genéricas, usadas pelas flores dos dois modos.
 *
 * Tudo é desenhado centrado em (0,0); quem usa posiciona com <Em x y ...>.
 * As animações (desenhar, brotar, florescer) estão em globals.css.
 */
import type { CSSProperties, ReactNode } from "react";

/** Folhagem padrão (verde sálvia, do modo Vestidos). */
export const FOLHAGEM = {
  caule: "#8fa58a",
  cauleEscuro: "#76906f",
  folha: "#a9c0a0",
  folhaEscura: "#8aa585",
};

export const atraso = (s: number): CSSProperties => ({ animationDelay: `${s}s` });

/** Posiciona um elemento: translate + rotate + scale (atributo SVG, não CSS). */
export function Em({
  x,
  y,
  r = 0,
  s = 1,
  children,
}: {
  x: number;
  y: number;
  r?: number;
  s?: number;
  children: ReactNode;
}) {
  return <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>{children}</g>;
}

/** Caule que se "desenha" ao carregar. */
export function Caule({ d, atrasoS = 0, largura = 2.2, cor = FOLHAGEM.caule }: { d: string; atrasoS?: number; largura?: number; cor?: string }) {
  return (
    <path
      d={d}
      pathLength={1}
      className="desenhar"
      style={atraso(atrasoS)}
      fill="none"
      stroke={cor}
      strokeWidth={largura}
      strokeLinecap="round"
    />
  );
}

/** Folha com nervura; nasce em (0,0) e aponta para a direita. */
export function Folha({
  atrasoS = 0,
  cor = FOLHAGEM.folha,
  nervura = FOLHAGEM.folhaEscura,
  tamanho = 1,
}: {
  atrasoS?: number;
  cor?: string;
  nervura?: string;
  tamanho?: number;
}) {
  return (
    // escala no grupo de fora; o de dentro recebe a animação (CSS transform anularia o atributo)
    <g transform={`scale(${tamanho})`}>
      <g className="brotar" style={atraso(atrasoS)}>
        <path d="M0 0 C 7 -9, 22 -11, 34 0 C 22 11, 7 9, 0 0 Z" fill={cor} />
        <path d="M2 0 C 12 -1, 22 -1, 31 0" stroke={nervura} strokeWidth={0.9} fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
}

/** Botão de flor fechado. */
export function Botao({ atrasoS = 0, cor, folha = FOLHAGEM.folha }: { atrasoS?: number; cor: string; folha?: string }) {
  return (
    <g className="florescer" style={atraso(atrasoS)}>
      <path d="M0 -10 C 5 -6, 5 2, 0 4 C -5 2, -5 -6, 0 -10 Z" fill={cor} />
      <path d="M-4 1 C -2 4, 2 4, 4 1 L 0 6 Z" fill={folha} />
    </g>
  );
}

/** Cachinho de frutinhas. */
export function Frutinhas({ atrasoS = 0, cor }: { atrasoS?: number; cor: string }) {
  const pontos: [number, number, number][] = [[0, 0, 3.2], [6, -3, 2.8], [3, 5, 2.6], [-5, 4, 2.4], [8, 4, 2.2]];
  return (
    <g>
      {pontos.map(([x, y, r], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <circle className="florescer" style={atraso(atrasoS + i * 0.08)} r={r} fill={cor} />
        </g>
      ))}
    </g>
  );
}

/** Pétala solta (usada caindo na tela de carregamento). */
export function Petala({ cor }: { cor: string }) {
  return <path d="M0 0 C -5 -4, -5 -11, 0 -12 C 5 -11, 5 -4, 0 0 Z" fill={cor} />;
}

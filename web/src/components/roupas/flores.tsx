/**
 * Flores do modo Roupas: hortênsias, miosótis, centáureas e delfínios,
 * em tons de azul e branco, com folhagem num verde mais frio.
 *
 * Mesmo estilo das flores do modo Vestidos: SVG inline, centrado em (0,0),
 * posicionado com <Em> e animado pelas mesmas classes (florescer, brotar...).
 */
import { atraso, Botao, Caule, Em, Folha, Frutinhas, Petala } from "../comum/botanica";

export const CORES_AZUIS = {
  caule: "#8aa79a",
  folha: "#a4bfb0",
  folhaEscura: "#86a594",
  azulClaro: "#c3d6f3",
  azul: "#9cc3ef",
  azulMedio: "#7ea6e0",
  azulForte: "#5f8ad0",
  azulProfundo: "#3f5f9e",
  lilasAzulado: "#b7c2ef",
  branco: "#ffffff",
  contorno: "#d5e2f2",
  miolo: "#f3d98e",
};

const C = CORES_AZUIS;

/** Folha na folhagem fria do modo Roupas. */
export function FolhaFria(props: { atrasoS?: number; tamanho?: number; escura?: boolean }) {
  return <Folha atrasoS={props.atrasoS} tamanho={props.tamanho} cor={props.escura ? C.folhaEscura : C.folha} nervura={C.folhaEscura} />;
}

/** Caule na cor da folhagem fria. */
export function CauleFrio(props: { d: string; atrasoS?: number; largura?: number }) {
  return <Caule {...props} cor={C.caule} />;
}

// ---------------------------------------------------------------------------

/** Florzinha de 4 pétalas que forma a hortênsia. */
function Florete({ cor, contorno }: { cor: string; contorno?: string }) {
  return (
    <g>
      {[0, 90, 180, 270].map((a) => (
        <path
          key={a}
          d="M0 0 C -2.7 -1.4, -2.9 -4.7, 0 -5.5 C 2.9 -4.7, 2.7 -1.4, 0 0 Z"
          fill={cor}
          stroke={contorno}
          strokeWidth={contorno ? 0.45 : 0}
          transform={`rotate(${a})`}
        />
      ))}
      <circle r={0.8} fill="#ffffff" opacity={0.9} />
    </g>
  );
}

/** Hortênsia: um cacho redondo de florzinhas. */
export function Hortensia({ atrasoS = 0, tom = "azul" }: { atrasoS?: number; tom?: "azul" | "branca" }) {
  const cores = tom === "azul" ? [C.azul, "#8fb0e3", C.azulClaro, "#9db3e6", C.lilasAzulado] : [C.branco, "#f3f7fd", "#e8eff9", "#fafcff"];
  // a branca ganha fundo e contorno um pouco mais marcados para não sumir no azul-claro
  const base = tom === "azul" ? "#cddcf4" : "#dbe6f5";
  const contorno = tom === "branca" ? "#b9cde8" : undefined;
  const posicoes: [number, number][] = [
    [0, 0],
    ...Array.from({ length: 6 }, (_, i): [number, number] => {
      const a = (i * 60 * Math.PI) / 180;
      return [Math.cos(a) * 7, Math.sin(a) * 7];
    }),
    ...Array.from({ length: 10 }, (_, i): [number, number] => {
      const a = ((i * 36 + 18) * Math.PI) / 180;
      return [Math.cos(a) * 14, Math.sin(a) * 14];
    }),
  ];
  return (
    <g className="florescer" style={atraso(atrasoS)}>
      <circle r={17} fill={base} opacity={0.8} />
      {posicoes.map(([x, y], i) => (
        <g key={i} transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${(i * 23) % 90}) scale(1.05)`}>
          <Florete cor={cores[i % cores.length]!} contorno={contorno} />
        </g>
      ))}
    </g>
  );
}

/** Miosótis: cinco pétalas redondas com miolo branco e amarelo. */
export function Miosotis({ atrasoS = 0, tom = "azul" }: { atrasoS?: number; tom?: "azul" | "branco" }) {
  const petala = tom === "azul" ? C.azul : C.branco;
  const contorno = tom === "azul" ? "#86b2e6" : C.contorno;
  return (
    <g className="florescer" style={atraso(atrasoS)}>
      {[0, 72, 144, 216, 288].map((a) => (
        <circle key={a} cx={0} cy={-4.6} r={4} fill={petala} stroke={contorno} strokeWidth={0.5} transform={`rotate(${a})`} />
      ))}
      <circle r={2.3} fill={tom === "azul" ? "#ffffff" : C.azulMedio} />
      <circle r={1.1} fill={C.miolo} />
    </g>
  );
}

/** Centáurea: pétalas franjadas em azul vivo, com miolo escuro. */
export function Centaurea({ atrasoS = 0 }: { atrasoS?: number }) {
  return (
    <g className="florescer" style={atraso(atrasoS)}>
      {Array.from({ length: 9 }, (_, i) => (
        <path
          key={i}
          d="M0 -3 L-4.2 -13 L-2.6 -14.6 L-1.3 -13 L0 -15 L1.3 -13 L2.6 -14.6 L4.2 -13 Z"
          fill={C.azulForte}
          stroke="#4b74b8"
          strokeWidth={0.5}
          strokeLinejoin="round"
          transform={`rotate(${i * 40})`}
        />
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <path key={`i${i}`} d="M0 -1 L-1.6 -7 L0 -8 L1.6 -7 Z" fill={C.azulProfundo} transform={`rotate(${i * 45 + 20})`} />
      ))}
      <circle r={3} fill="#2f4a80" />
      {[[-1, -1], [1.2, -0.4], [0, 1.2]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={0.55} fill="#8fb0e3" />
      ))}
    </g>
  );
}

/** Florzinha do delfínio (cinco pétalas pontudas). */
function FloreteDelfinio({ cor }: { cor: string }) {
  return (
    <g>
      {[0, 72, 144, 216, 288].map((a) => (
        <path key={a} d="M0 0 C -2.4 -1.6, -2.6 -5, 0 -6 C 2.6 -5, 2.4 -1.6, 0 0 Z" fill={cor} transform={`rotate(${a})`} />
      ))}
      <circle r={1.2} fill="#ffffff" />
    </g>
  );
}

/** Delfínio: espiga de florzinhas que sobe a partir de (0,0) e termina em botões. */
export function Delfinio({ atrasoS = 0, altura = 50 }: { atrasoS?: number; altura?: number }) {
  const flores = 7;
  return (
    <g>
      <CauleFrio d={`M0 0 L0 ${-altura}`} atrasoS={atrasoS} largura={1.4} />
      {Array.from({ length: flores }, (_, i) => {
        const y = -altura * 0.3 - (i * altura * 0.68) / flores;
        const lado = i % 2 === 0 ? -1 : 1;
        const escala = 1 - i * 0.075;
        const atrasoFlor = atrasoS + 0.5 + i * 0.08;
        return (
          <g key={i} transform={`translate(${lado * 1.6} ${y.toFixed(2)}) scale(${escala.toFixed(3)})`}>
            {i >= flores - 2 ? (
              <ellipse className="florescer" style={atraso(atrasoFlor)} rx={2.1} ry={3.2} fill={C.azulClaro} />
            ) : (
              <g className="florescer" style={atraso(atrasoFlor)}>
                <FloreteDelfinio cor={i % 2 === 0 ? C.azulMedio : "#a8c2ef"} />
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
}

/** Botão azul fechado. */
export function BotaoAzul({ atrasoS = 0, cor = "#8fb0e3" }: { atrasoS?: number; cor?: string }) {
  return <Botao atrasoS={atrasoS} cor={cor} folha={C.folha} />;
}

/** Frutinhas azuladas. */
export function FrutinhasAzuis({ atrasoS = 0 }: { atrasoS?: number }) {
  return <Frutinhas atrasoS={atrasoS} cor="#a7c3ec" />;
}

/** Pétala solta azul (tela de carregamento). */
export function PetalaAzul({ cor = C.azul }: { cor?: string }) {
  return <Petala cor={cor} />;
}

export { Em };

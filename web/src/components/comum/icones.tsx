/** Ícones simples em SVG (traço), herdam a cor do texto. */
import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const base = (props: P) => ({
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  ...props,
});

// --- ícones de ocasiões e usos ---------------------------------------------

export const IconeSol = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
  </svg>
);

export const IconeLua = (p: P) => (
  <svg {...base(p)}>
    <path d="M19.5 14.5A8 8 0 1 1 9.5 4.5a6.5 6.5 0 0 0 10 10z" />
    <path d="M17 4.5l.5 1.3 1.3.5-1.3.5-.5 1.3-.5-1.3-1.3-.5 1.3-.5z" />
  </svg>
);

export const IconeCapelo = (p: P) => (
  <svg {...base(p)}>
    <path d="M2.5 9 12 4.5 21.5 9 12 13.5z" />
    <path d="M6.5 11v4.5c1.5 1.5 3.4 2.2 5.5 2.2s4-.7 5.5-2.2V11M21.5 9v5" />
  </svg>
);

export const IconeMaleta = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="7.5" width="18" height="12" rx="2" />
    <path d="M9 7.5V6a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 6v1.5M3 12.5h18" />
  </svg>
);

export const IconeConfete = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 20 8.5 8.5l7 7z" />
    <path d="M13 4.5c.5 1.5 0 2.5-1 3.5M18.5 9c-1.5-.3-2.6.2-3.5 1.2M17 3.5v1.5M20.5 6H19M21 12.5h-1.5" />
  </svg>
);

export const IconeGuardaSol = (p: P) => (
  <svg {...base(p)}>
    <path d="M3.5 11a8.5 8.5 0 0 1 17 0z" />
    <path d="M12 11v8.5M8 21h8" />
  </svg>
);

export const IconeTaca = (p: P) => (
  <svg {...base(p)}>
    <path d="M7.5 3.5h9l-.5 5a4 4 0 0 1-8 0z" />
    <path d="M12 12.5v7M8.5 20.5h7M8 7.5h8" />
  </svg>
);

export const IconeVela = (p: P) => (
  <svg {...base(p)}>
    <rect x="9" y="10" width="6" height="10.5" rx="1" />
    <path d="M12 7.5c-1.3-1-1.3-2.6 0-4 1.3 1.4 1.3 3 0 4zM12 7.5V10" />
  </svg>
);

export const IconeXicara = (p: P) => (
  <svg {...base(p)}>
    <path d="M4.5 9.5h11v4a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z" />
    <path d="M15.5 11h1.5a2.5 2.5 0 0 1 0 5h-1.7M8 3.5c-.5.8.5 1.5 0 2.5M11.5 3.5c-.5.8.5 1.5 0 2.5" />
  </svg>
);

export const IconeHaltere = (p: P) => (
  <svg {...base(p)}>
    <path d="M7 8v8M17 8v8M4 10v4M20 10v4M7 12h10" />
  </svg>
);

export const IconeMala = (p: P) => (
  <svg {...base(p)}>
    <rect x="6" y="7" width="12" height="13" rx="2" />
    <path d="M9.5 7V4.5h5V7M10 11v5M14 11v5M8.5 20v1M15.5 20v1" />
  </svg>
);

export const IconeFloco = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9.5 4.5 12 7l2.5-2.5M9.5 19.5 12 17l2.5 2.5" />
  </svg>
);

export const IconeVoltar = (p: P) => (
  <svg {...base(p)}>
    <path d="M15 5l-7 7 7 7" />
  </svg>
);

export const IconeAvancar = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const IconeCoracao = ({ cheio = false, ...p }: P & { cheio?: boolean }) => (
  <svg {...base(p)} fill={cheio ? "currentColor" : "none"}>
    <path d="M12 20s-7.5-4.6-9.2-9.3C1.6 7.2 3.8 4 7.1 4c2 0 3.5 1.1 4.9 2.9C13.4 5.1 14.9 4 16.9 4c3.3 0 5.5 3.2 4.3 6.7C19.5 15.4 12 20 12 20z" />
  </svg>
);

export const IconeSacola = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 8h14l-1 12H6L5 8z" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
  </svg>
);

export const IconeLupa = (p: P) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.2-4.2" />
  </svg>
);

export const IconeExterno = (p: P) => (
  <svg {...base(p)}>
    <path d="M14 4h6v6" />
    <path d="M20 4 11 13" />
    <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
  </svg>
);

export const IconeFechar = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const IconeLapis = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z" />
  </svg>
);

export const IconeSeta = (p: P) => (
  <svg {...base(p)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const IconeBrilho = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />
  </svg>
);

export const IconeCheck = (p: P) => (
  <svg {...base(p)}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

export const IconeInfo = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5.5M12 7.6v.1" />
  </svg>
);

export const IconeLixeira = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
  </svg>
);

export const IconeRelogio = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);

/** Flor de cinco pétalas usada como enfeite e no botão principal. */
export const IconeFlor = (p: P) => (
  <svg viewBox="-12 -12 24 24" aria-hidden {...p}>
    {[0, 72, 144, 216, 288].map((a) => (
      <ellipse key={a} cx={0} cy={-5.5} rx={3.6} ry={5} fill="currentColor" opacity={0.9} transform={`rotate(${a})`} />
    ))}
    <circle r={2.6} fill="#f3d98e" />
  </svg>
);

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

/** Flor de cinco pétalas usada como enfeite e no botão principal. */
export const IconeFlor = (p: P) => (
  <svg viewBox="-12 -12 24 24" aria-hidden {...p}>
    {[0, 72, 144, 216, 288].map((a) => (
      <ellipse key={a} cx={0} cy={-5.5} rx={3.6} ry={5} fill="currentColor" opacity={0.9} transform={`rotate(${a})`} />
    ))}
    <circle r={2.6} fill="#f3d98e" />
  </svg>
);

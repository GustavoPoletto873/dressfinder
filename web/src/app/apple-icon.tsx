/**
 * Ícone para a tela inicial do iPhone/iPad (PNG 180x180).
 * Mesmo desenho do icon.svg (vestido creme com florzinha sobre rosa antigo),
 * mas com fundo sem transparência, porque o iOS aplica a própria máscara
 * arredondada. O desenho fica embutido aqui (sem ler arquivo do disco) para
 * funcionar igual no build e nas funções da Vercel.
 */
import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const CREME = "#fdf9f3";
const PETALA = "#f2b8c2";

export default function IconeApple() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#c26a7a" }}>
        <svg width="180" height="180" viewBox="0 0 64 64">
          <path d="M25 11.5 L26.6 20.5 M39 11.5 L37.4 20.5" stroke={CREME} strokeWidth="2.6" strokeLinecap="round" fill="none" />
          <path d="M25.8 19.6 Q32 23.6 38.2 19.6 L37.2 32.6 L26.8 32.6 Z" fill={CREME} />
          <path d="M26.8 31.6 L37.2 31.6 L48 52 Q32 57.6 16 52 Z" fill={CREME} />
          <circle cx="32" cy="29.4" r="2.5" fill={PETALA} />
          <circle cx="34.85" cy="31.47" r="2.5" fill={PETALA} />
          <circle cx="33.76" cy="34.83" r="2.5" fill={PETALA} />
          <circle cx="30.24" cy="34.83" r="2.5" fill={PETALA} />
          <circle cx="29.15" cy="31.47" r="2.5" fill={PETALA} />
          <circle cx="32" cy="32.4" r="1.7" fill="#f3d98e" />
        </svg>
      </div>
    ),
    size,
  );
}

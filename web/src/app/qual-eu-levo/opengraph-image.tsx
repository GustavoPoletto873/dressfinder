/**
 * Prévia do link "Qual eu levo?" no WhatsApp (1200x630).
 * Mesmo vestidinho do ícone, com o convite em texto grande.
 */
import { ImageResponse } from "next/og";

export const alt = "Qual eu levo? Me ajuda a escolher";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CREME = "#fdf9f3";
const ROSA = "#c26a7a";
const PETALA = "#f2b8c2";

export default function Imagem() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: CREME, alignItems: "center", padding: "0 80px", gap: 64 }}>
        <div style={{ display: "flex", width: 360, height: 360, borderRadius: 72, background: ROSA, flexShrink: 0 }}>
          <svg width="360" height="360" viewBox="0 0 64 64">
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
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 30, letterSpacing: 8, color: "#8a7a76", textTransform: "uppercase" }}>Achei o Vestido</div>
          <div style={{ fontSize: 104, fontWeight: 700, color: ROSA, lineHeight: 1 }}>Qual eu levo?</div>
          {/* sem emoji: o gerador de imagem buscaria a figura na internet durante o build */}
          <div style={{ fontSize: 44, color: "#3f3533" }}>Me ajuda a escolher?</div>
        </div>
      </div>
    ),
    size,
  );
}

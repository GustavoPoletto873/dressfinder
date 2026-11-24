import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Great_Vibes, Jost } from "next/font/google";
import "./globals.css";

/** Texto de interface: limpa e muito legível em telas pequenas. */
const fonteTexto = Jost({
  variable: "--font-texto",
  subsets: ["latin"],
});

/** Títulos de seção: serifada elegante. */
const fonteTitulo = Cormorant_Garamond({
  variable: "--font-titulo",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

/** Cursiva decorativa: só em títulos grandes, onde continua legível. */
const fonteCursiva = Great_Vibes({
  variable: "--font-cursiva",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Achei o Vestido",
  description: "Conte a ocasião e como você imagina o vestido. A gente encontra opções da Shein Brasil que combinam com você.",
};

export const viewport: Viewport = {
  themeColor: "#fdf9f3",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${fonteTexto.variable} ${fonteTitulo.variable} ${fonteCursiva.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

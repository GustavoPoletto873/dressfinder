import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Great_Vibes, Jost } from "next/font/google";
import { RegistrarSW } from "@/components/comum/RegistrarSW";
import { SCRIPT_TEMA_INICIAL } from "@/lib/tema";
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
  // endereço público: as prévias de link (WhatsApp) precisam de URLs completas
  metadataBase: new URL("https://dressfinder.vercel.app"),
  title: "Achei o Vestido",
  description: "Conte a ocasião e como você imagina o vestido. A gente encontra opções na Shein, Renner, C&A e outras lojas que você escolher.",
  // instalado na tela inicial do iPhone: abre como app, com este nome
  appleWebApp: { capable: true, title: "Achei o Vestido", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#fdf9f3",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${fonteTexto.variable} ${fonteTitulo.variable} ${fonteCursiva.variable} h-full antialiased`}
      // o script abaixo define data-tema antes da hidratação; o React não deve reclamar disso
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA_INICIAL }} />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <RegistrarSW />
      </body>
    </html>
  );
}

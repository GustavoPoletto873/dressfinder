import type { Metadata } from "next";
import { DecoracaoPagina } from "@/components/comum/Decoracao";
import { QualEuLevo } from "@/components/comum/QualEuLevo";

export const metadata: Metadata = {
  title: "Qual eu levo? · Achei o Vestido",
  description: "Me ajuda a escolher? Toque na peça que você levaria.",
  // links pessoais, enviados por WhatsApp: não precisam aparecer no Google
  robots: { index: false, follow: false },
};

export default function PaginaQualEuLevo() {
  return (
    <div className="relative isolate flex flex-1 flex-col overflow-x-clip">
      <DecoracaoPagina />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-16 sm:px-6 sm:pt-24">
        <QualEuLevo />
      </main>
    </div>
  );
}

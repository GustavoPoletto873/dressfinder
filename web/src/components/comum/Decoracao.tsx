"use client";

/**
 * Flores da página inteira (cantos de cima, laterais ao longo da página e
 * cantos de baixo), um conjunto por modo.
 *
 * - Os dois conjuntos ficam montados; o CSS (.deco-vestidos / .deco-roupas)
 *   mostra o do tema ativo já na primeira pintura e faz o fade na troca.
 * - A cada troca, o conjunto que entra é remontado (chave = número de
 *   ativações do modo), então as flores crescem de novo.
 * - As laterais acompanham a altura real da página (que cresce com os
 *   resultados).
 */
import { useEffect, useState } from "react";
import { KIT_ROUPAS } from "../roupas/decoracao";
import { KIT_VESTIDOS } from "../vestidos/decoracao";
import type { KitDecoracao } from "./kitDecoracao";
import { useAtivacoes, type Modo } from "./modo";

const KITS: Record<Modo, KitDecoracao> = { vestidos: KIT_VESTIDOS, roupas: KIT_ROUPAS };

/** Altura inicial suposta (servidor e primeira pintura), depois medida de verdade. */
const ALTURA_INICIAL = 3600;
const INICIO_LATERAIS = 560; // logo abaixo do título
const ESPACO_ENTRE_RAMOS = 640;

function useAlturaDaPagina(): number {
  const [altura, setAltura] = useState(ALTURA_INICIAL);
  useEffect(() => {
    const medir = () => setAltura(document.documentElement.scrollHeight);
    const observador = new ResizeObserver(medir);
    observador.observe(document.body);
    medir();
    return () => observador.disconnect();
  }, []);
  return altura;
}

function ConjuntoRamos({ Ramo, classe, altura }: { Ramo: KitDecoracao["RamoCanto"]; classe: string; altura: number }) {
  // ramos laterais alternando esquerda/direita, até perto do rodapé
  const laterais: { topo: number; lado: "esquerda" | "direita"; virado: boolean }[] = [];
  for (let topo = INICIO_LATERAIS, i = 0; topo < altura - 700; topo += ESPACO_ENTRE_RAMOS / 2, i++) {
    laterais.push({ topo, lado: i % 2 === 0 ? "esquerda" : "direita", virado: Math.floor(i / 2) % 2 === 1 });
  }

  return (
    <div className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${classe}`} aria-hidden>
      {/* cantos de cima */}
      <Ramo className="absolute -left-3 -top-3 w-48 sm:w-80 lg:w-[26rem]" />
      <Ramo className="absolute -right-3 -top-3 w-48 -scale-x-100 sm:w-80 lg:w-[26rem]" atrasoBase={0.35} />

      {/* laterais ao longo da página (mais discretas no celular, onde ficam atrás do conteúdo) */}
      {laterais.map(({ topo, lado, virado }, i) => (
        <Ramo
          key={topo}
          atrasoBase={0.5 + (i % 4) * 0.2}
          className={
            "absolute w-28 opacity-60 sm:w-56 sm:opacity-100 lg:w-72 " +
            (lado === "esquerda" ? "-left-10 sm:-left-4 " : "-right-10 -scale-x-100 sm:-right-4 ") +
            (virado ? "-scale-y-100" : "")
          }
          // posição calculada a partir da altura medida da página
          style={{ top: topo }}
        />
      ))}

      {/* cantos de baixo, perto do rodapé */}
      <Ramo className="absolute -bottom-3 -left-3 w-28 -scale-y-100 opacity-70 sm:w-72 sm:opacity-100" atrasoBase={0.6} />
      <Ramo className="absolute -bottom-3 -right-3 w-28 -scale-x-100 -scale-y-100 opacity-70 sm:w-72 sm:opacity-100" atrasoBase={0.8} />
    </div>
  );
}

export function DecoracaoPagina() {
  const altura = useAlturaDaPagina();
  const ativacoesVestidos = useAtivacoes("vestidos");
  const ativacoesRoupas = useAtivacoes("roupas");
  return (
    <>
      <ConjuntoRamos key={`vestidos-${ativacoesVestidos}`} Ramo={KITS.vestidos.RamoCanto} classe="deco-vestidos" altura={altura} />
      <ConjuntoRamos key={`roupas-${ativacoesRoupas}`} Ramo={KITS.roupas.RamoCanto} classe="deco-roupas" altura={altura} />
    </>
  );
}

/** Enfeite pequeno de flores (título e rodapé); também cresce de novo a cada troca. */
export function Enfeite({ classe, classeRoupas }: { classe: string; classeRoupas: string }) {
  const ativacoesVestidos = useAtivacoes("vestidos");
  const ativacoesRoupas = useAtivacoes("roupas");
  const { Enfeite: EnfeiteVestidos } = KITS.vestidos;
  const { Enfeite: EnfeiteRoupas } = KITS.roupas;
  return (
    <div className="relative">
      <EnfeiteVestidos key={`v-${ativacoesVestidos}`} className={`deco-vestidos ${classe}`} />
      <EnfeiteRoupas key={`r-${ativacoesRoupas}`} className={`deco-roupas absolute left-1/2 -translate-x-1/2 ${classeRoupas}`} />
    </div>
  );
}

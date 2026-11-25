"use client";

import { useState } from "react";
import type { Anuncio, Produto, RespostaBusca, ResultadoBusca } from "@/lib/tipos";
import { BotaoCoracao } from "./favoritos";
import { IconeExterno, IconeFlor, IconeLapis, IconeLupa, IconeSacola, IconeSeta } from "./icones";
import { useKitDecoracao } from "./kitDecoracao";
import { useModo } from "./modo";

const linkExterno = { target: "_blank", rel: "noopener noreferrer" } as const;

/**
 * Foto do produto. Tenta a foto principal, depois a reserva (miniatura do
 * Google) e, se nenhuma carregar, mostra um placeholder florido.
 */
function Foto({ src, reserva, alt, className = "" }: { src: string | null; reserva?: string | null; alt: string; className?: string }) {
  const { FlorSemFoto } = useKitDecoracao();
  const fontes = [src, reserva].filter((f): f is string => Boolean(f));
  const [falhas, setFalhas] = useState(0);
  const atual = fontes[falhas];
  if (!atual) {
    return (
      <div className={"grid place-items-center bg-primaria-suave " + className}>
        <svg viewBox="-30 -30 60 60" className="w-1/2 opacity-80" aria-hidden>
          <FlorSemFoto />
        </svg>
      </div>
    );
  }
  return (
    // imagens vêm de vários domínios (Shein/Google); <img> simples evita configurar domínios no next/image
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={atual}
      src={atual}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFalhas((n) => n + 1)}
      className={"object-cover " + className}
    />
  );
}

/** Cartão de vitrine (foto grande, preço, coração e "Ver na Shein"). Serve para produtos e anúncios. */
function CardProduto({
  produto,
  indice,
  rotulo = "Ver na Shein",
  avisarSemPreco = false,
}: {
  produto: Produto & { imagemReserva?: string | null };
  indice: number;
  rotulo?: string;
  /** Mostra "ver preço na Shein" no lugar do preço quando ele não vem na busca. */
  avisarSemPreco?: boolean;
}) {
  return (
    <article className="surgir group flex flex-col" style={{ animationDelay: `${Math.min(indice, 8) * 60}ms` }}>
      <div className="relative overflow-hidden rounded-3xl bg-fundo-escuro shadow-suave transition-shadow duration-300 group-hover:shadow-elevada">
        <a href={produto.url} {...linkExterno} tabIndex={-1} aria-hidden>
          <Foto
            src={produto.imagem}
            reserva={produto.imagemReserva}
            alt=""
            className="aspect-[3/4] w-full transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        </a>
        <BotaoCoracao
          item={{ url: produto.url, titulo: produto.titulo, imagem: produto.imagem, preco: produto.preco }}
          className="absolute right-2.5 top-2.5"
        />
        {produto.preco ? (
          <span className="absolute bottom-2.5 left-2.5 rounded-full bg-superficie/95 px-3 py-1 text-sm font-semibold shadow-suave backdrop-blur">
            {produto.preco}
          </span>
        ) : (
          avisarSemPreco && (
            <span className="pointer-events-none absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 rounded-full bg-superficie/95 px-2.5 py-1 text-xs font-medium text-primaria-forte shadow-suave backdrop-blur">
              ver preço na Shein <IconeExterno className="size-3" />
            </span>
          )
        )}
      </div>
      <h4 className="mt-3 line-clamp-2 px-1 text-sm leading-snug text-texto">{produto.titulo}</h4>
      <a
        href={produto.url}
        {...linkExterno}
        className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-full border border-destaque/40 px-4 py-2 text-sm font-medium text-primaria-forte transition-all duration-200 hover:border-primaria hover:bg-primaria hover:text-white active:scale-95"
      >
        {rotulo} <IconeExterno className="size-3.5" />
      </a>
    </article>
  );
}

/** Anúncio encontrado no Google: mesmo cartão de vitrine, com foto. */
function CardAnuncio({ anuncio, indice }: { anuncio: Anuncio; indice: number }) {
  return (
    <CardProduto
      produto={anuncio}
      indice={indice}
      rotulo={anuncio.tipo === "produto" ? "Ver na Shein" : "Abrir lista na Shein"}
      avisarSemPreco={anuncio.tipo === "produto"}
    />
  );
}

/** Botões de busca pronta. Em destaque quando são o único conteúdo do grupo. */
function BotoesBusca({ busca, destaque }: { busca: ResultadoBusca; destaque: boolean }) {
  const modo = useModo();
  if (destaque) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <a
          href={busca.linkShein}
          {...linkExterno}
          className="group flex items-center gap-3 rounded-2xl bg-primaria px-5 py-4 text-white shadow-elevada transition-all duration-200 hover:-translate-y-0.5 hover:bg-primaria-forte active:scale-[0.98]"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/20">
            <IconeSacola className="size-5" />
          </span>
          <span className="flex-1">
            <span className="block font-medium">Ver esta busca na Shein</span>
            <span className="block text-sm text-white/80">
              {modo === "roupas" ? "Abre a lista de peças" : "Abre a lista de vestidos"}
            </span>
          </span>
          <IconeExterno className="size-4 opacity-70 transition group-hover:opacity-100" />
        </a>
        <a
          href={busca.linkGoogle}
          {...linkExterno}
          className="group flex items-center gap-3 rounded-2xl border border-borda bg-superficie px-5 py-4 shadow-suave transition-all duration-200 hover:-translate-y-0.5 hover:border-destaque/40 active:scale-[0.98]"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-secundaria-suave text-secundaria">
            <IconeLupa className="size-5" />
          </span>
          <span className="flex-1">
            <span className="block font-medium">Procurar no Google</span>
            <span className="block text-sm text-texto-suave">Só resultados da Shein</span>
          </span>
          <IconeExterno className="size-4 text-texto-suave opacity-70 transition group-hover:opacity-100" />
        </a>
      </div>
    );
  }
  const classe =
    "inline-flex items-center gap-2 rounded-full border border-borda bg-superficie px-4 py-2 text-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-destaque/40 hover:text-primaria-forte active:scale-95";
  return (
    <div className="flex flex-wrap gap-2">
      <a href={busca.linkShein} {...linkExterno} className={classe}>
        <IconeSacola className="size-4" /> Mais na Shein
      </a>
      <a href={busca.linkGoogle} {...linkExterno} className={classe}>
        <IconeLupa className="size-4" /> Procurar no Google
      </a>
    </div>
  );
}

/** Quantos itens mostrar antes do "Ver mais" (evita rolagem enorme no celular). */
const INICIAL_PRODUTOS = 8;
const INICIAL_ANUNCIOS = 4;

function BotaoVerMais({ restantes, onClick }: { restantes: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mx-auto mb-6 flex items-center gap-1.5 rounded-full border border-dashed border-destaque/40 px-5 py-2 text-sm text-primaria-forte transition hover:border-solid hover:bg-primaria-suave active:scale-95"
    >
      Ver mais {restantes} {restantes === 1 ? "opção" : "opções"}
      <IconeSeta className="size-4" />
    </button>
  );
}

function GrupoBusca({ busca, indice }: { busca: ResultadoBusca; indice: number }) {
  const [verTudo, setVerTudo] = useState(false);
  const temProdutos = busca.produtos.length > 0;
  const temAnuncios = busca.anuncios.length > 0;
  const produtos = verTudo ? busca.produtos : busca.produtos.slice(0, INICIAL_PRODUTOS);
  const anuncios = verTudo ? busca.anuncios : busca.anuncios.slice(0, INICIAL_ANUNCIOS);
  return (
    <section
      id={`grupo-${indice}`}
      className="surgir scroll-mt-24 rounded-[2rem] border border-borda bg-superficie/80 p-5 shadow-suave backdrop-blur-sm sm:p-7"
      style={{ animationDelay: `${indice * 90}ms` }}
    >
      <header className="mb-5 space-y-1.5">
        <div className="flex items-center gap-2 text-primaria">
          <IconeFlor className="size-4" />
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-texto-suave">Ideia {indice + 1}</span>
        </div>
        <h3 className="font-titulo text-[1.75rem] font-semibold leading-tight">{busca.titulo}</h3>
        <p className="max-w-2xl text-texto-suave">{busca.motivo}</p>
      </header>

      {temProdutos && (
        <>
          <div className="mb-6 grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-4">
            {produtos.map((p, i) => (
              <CardProduto key={p.url} produto={p} indice={i} />
            ))}
          </div>
          {!verTudo && busca.produtos.length > INICIAL_PRODUTOS && (
            <BotaoVerMais restantes={busca.produtos.length - INICIAL_PRODUTOS} onClick={() => setVerTudo(true)} />
          )}
        </>
      )}
      {!temProdutos && temAnuncios && (
        <>
          <div className="mb-6 grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-4">
            {anuncios.map((a, i) => (
              <CardAnuncio key={a.url} anuncio={a} indice={i} />
            ))}
          </div>
          {!verTudo && busca.anuncios.length > INICIAL_ANUNCIOS && (
            <BotaoVerMais restantes={busca.anuncios.length - INICIAL_ANUNCIOS} onClick={() => setVerTudo(true)} />
          )}
        </>
      )}

      <BotoesBusca busca={busca} destaque={!temProdutos && !temAnuncios} />
      <p className="mt-4 text-xs text-texto-suave">
        Buscamos por <span className="rounded-full bg-primaria-suave px-2 py-0.5 text-texto">{busca.termo}</span>
      </p>
    </section>
  );
}

interface Props {
  resposta: RespostaBusca;
  /** Palavras que resumem o pedido (ocasião, comprimento, cor...). */
  resumo: string[];
  aoEditar: () => void;
}

export function Resultados({ resposta, resumo, aoEditar }: Props) {
  const { totalProdutos, totalAnuncios, buscas } = resposta;
  const { FlorAviso } = useKitDecoracao();
  const aviso =
    totalProdutos > 0
      ? null
      : totalAnuncios > 0
        ? "A Shein não deixou a gente mostrar os produtos aqui agora, então trouxemos anúncios encontrados no Google e buscas prontas."
        : "A Shein não deixou a gente mostrar os produtos aqui agora, então preparamos buscas prontas. É só tocar para abrir.";

  return (
    <div className="space-y-6">
      <header className="surgir flex flex-col items-center gap-3 text-center">
        <h2 className="font-cursiva text-5xl leading-tight text-primaria sm:text-6xl">Suas ideias</h2>
        <p className="font-titulo text-xl italic text-texto">
          {buscas.length} caminhos pensados para você
        </p>
        <div className="flex flex-wrap justify-center gap-1.5">
          {resumo.map((r) => (
            <span key={r} className="rounded-full bg-secundaria-suave px-3 py-1 text-xs text-texto">
              {r}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={aoEditar}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-primaria-forte transition hover:bg-primaria-suave"
        >
          <IconeLapis className="size-4" /> Ajustar a busca
        </button>
      </header>

      {aviso && (
        <p className="surgir mx-auto flex max-w-2xl items-start gap-2 rounded-2xl bg-fundo-escuro/70 px-4 py-3 text-sm text-texto-suave" role="status">
          <svg viewBox="-12 -12 24 24" className="mt-0.5 size-4 shrink-0" aria-hidden>
            <FlorAviso />
          </svg>
          {aviso}
        </p>
      )}

      {buscas.length > 2 && (
        // padding à direita: deixa espaço para o botão fixo de favoritos
        <nav aria-label="Ir para uma ideia" className="sticky top-3 z-20 -mx-4 pl-4 pr-20 sm:mx-0 sm:pl-0 sm:pr-40 2xl:pr-0">
          <div className="sem-barra mx-auto flex w-fit max-w-full gap-2 overflow-x-auto rounded-full border border-borda bg-superficie/90 p-1.5 shadow-suave backdrop-blur">
            {buscas.map((b, i) => (
              <a
                key={b.termo}
                href={`#grupo-${i}`}
                className="shrink-0 rounded-full px-3.5 py-1.5 text-sm text-texto-suave transition hover:bg-primaria-suave hover:text-primaria-forte"
              >
                {b.titulo}
              </a>
            ))}
          </div>
        </nav>
      )}

      <div className="space-y-6">
        {buscas.map((b, i) => (
          <GrupoBusca key={b.termo} busca={b} indice={i} />
        ))}
      </div>
    </div>
  );
}

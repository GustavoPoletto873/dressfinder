"use client";

import { useState } from "react";
import type { Anuncio, Produto, RespostaBusca, ResultadoBusca } from "@/lib/tipos";
import { BotaoCoracao } from "./favoritos";
import { CORES, Em, Florzinha, Folha, Margarida } from "./flores";
import { IconeExterno, IconeFlor, IconeLapis, IconeLupa, IconeSacola, IconeSeta } from "./icones";

const linkExterno = { target: "_blank", rel: "noopener noreferrer" } as const;

/** Imagem do produto com placeholder florido quando não há foto. */
function Foto({ src, alt, className = "" }: { src: string | null; alt: string; className?: string }) {
  if (!src) {
    return (
      <div className={"grid place-items-center bg-rosa-bebe " + className}>
        <svg viewBox="-30 -30 60 60" className="w-1/2 opacity-80" aria-hidden>
          <Em x={-14} y={10} r={-150} s={0.6}><Folha /></Em>
          <Em x={0} y={0}><Margarida /></Em>
        </svg>
      </div>
    );
  }
  return (
    // imagens vêm de vários domínios (Shein/Google); <img> simples evita configurar domínios no next/image
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} loading="lazy" referrerPolicy="no-referrer" className={"object-cover " + className} />
  );
}

function CardProduto({ produto, indice }: { produto: Produto; indice: number }) {
  return (
    <article className="surgir group flex flex-col" style={{ animationDelay: `${Math.min(indice, 8) * 60}ms` }}>
      <div className="relative overflow-hidden rounded-3xl bg-creme-escuro shadow-suave transition-shadow duration-300 group-hover:shadow-elevada">
        <a href={produto.url} {...linkExterno} tabIndex={-1} aria-hidden>
          <Foto
            src={produto.imagem}
            alt=""
            className="aspect-[3/4] w-full transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        </a>
        <BotaoCoracao
          item={{ url: produto.url, titulo: produto.titulo, imagem: produto.imagem, preco: produto.preco }}
          className="absolute right-2.5 top-2.5"
        />
        {produto.preco && (
          <span className="absolute bottom-2.5 left-2.5 rounded-full bg-papel/95 px-3 py-1 text-sm font-semibold shadow-suave backdrop-blur">
            {produto.preco}
          </span>
        )}
      </div>
      <h4 className="mt-3 line-clamp-2 px-1 text-sm leading-snug text-tinta">{produto.titulo}</h4>
      <a
        href={produto.url}
        {...linkExterno}
        className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-full border border-rosa/40 px-4 py-2 text-sm font-medium text-rosa-forte transition-all duration-200 hover:border-rosa hover:bg-rosa hover:text-white active:scale-95"
      >
        Ver na Shein <IconeExterno className="size-3.5" />
      </a>
    </article>
  );
}

function CardAnuncio({ anuncio, indice }: { anuncio: Anuncio; indice: number }) {
  const ehProduto = anuncio.tipo === "produto";
  return (
    <article
      className="surgir flex gap-4 rounded-3xl border border-linha bg-papel p-3.5 shadow-suave transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevada"
      style={{ animationDelay: `${Math.min(indice, 8) * 60}ms` }}
    >
      {anuncio.imagem ? (
        <Foto src={anuncio.imagem} alt="" className="h-28 w-21 shrink-0 rounded-2xl" />
      ) : (
        // sem foto: ícone pequeno, para o cartão ficar compacto
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-rosa-bebe text-rosa">
          {ehProduto ? <IconeFlor className="size-5" /> : <IconeSacola className="size-5" />}
        </span>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start gap-2">
          <h4 className="line-clamp-2 flex-1 text-sm font-medium leading-snug">{anuncio.titulo}</h4>
          {ehProduto && (
            <BotaoCoracao
              item={{ url: anuncio.url, titulo: anuncio.titulo, imagem: anuncio.imagem, preco: anuncio.preco }}
              className="-mr-1 -mt-1 size-9 shrink-0 shadow-none"
            />
          )}
        </div>
        {anuncio.preco && <p className="mt-1 font-semibold">{anuncio.preco}</p>}
        {anuncio.trecho && <p className="mt-1 line-clamp-2 text-xs text-suave">{anuncio.trecho}</p>}
        <a
          href={anuncio.url}
          {...linkExterno}
          className="mt-auto inline-flex w-fit items-center gap-1.5 pt-2 text-sm font-medium text-rosa-forte underline-offset-4 transition hover:text-rosa hover:underline"
        >
          {ehProduto ? "Ver na Shein" : "Abrir lista na Shein"} <IconeExterno className="size-3.5" />
        </a>
      </div>
    </article>
  );
}

/** Botões de busca pronta. Em destaque quando são o único conteúdo do grupo. */
function BotoesBusca({ busca, destaque }: { busca: ResultadoBusca; destaque: boolean }) {
  if (destaque) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <a
          href={busca.linkShein}
          {...linkExterno}
          className="group flex items-center gap-3 rounded-2xl bg-rosa px-5 py-4 text-white shadow-elevada transition-all duration-200 hover:-translate-y-0.5 hover:bg-rosa-forte active:scale-[0.98]"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/20">
            <IconeSacola className="size-5" />
          </span>
          <span className="flex-1">
            <span className="block font-medium">Ver esta busca na Shein</span>
            <span className="block text-sm text-white/80">Abre a lista de vestidos</span>
          </span>
          <IconeExterno className="size-4 opacity-70 transition group-hover:opacity-100" />
        </a>
        <a
          href={busca.linkGoogle}
          {...linkExterno}
          className="group flex items-center gap-3 rounded-2xl border border-linha bg-papel px-5 py-4 shadow-suave transition-all duration-200 hover:-translate-y-0.5 hover:border-rosa/40 active:scale-[0.98]"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-salvia-claro text-salvia">
            <IconeLupa className="size-5" />
          </span>
          <span className="flex-1">
            <span className="block font-medium">Procurar no Google</span>
            <span className="block text-sm text-suave">Só resultados da Shein</span>
          </span>
          <IconeExterno className="size-4 text-suave opacity-70 transition group-hover:opacity-100" />
        </a>
      </div>
    );
  }
  const classe =
    "inline-flex items-center gap-2 rounded-full border border-linha bg-papel px-4 py-2 text-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-rosa/40 hover:text-rosa-forte active:scale-95";
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
      className="mx-auto mb-6 flex items-center gap-1.5 rounded-full border border-dashed border-rosa/40 px-5 py-2 text-sm text-rosa-forte transition hover:border-solid hover:bg-rosa-bebe active:scale-95"
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
      className="surgir scroll-mt-24 rounded-[2rem] border border-linha bg-papel/80 p-5 shadow-suave backdrop-blur-sm sm:p-7"
      style={{ animationDelay: `${indice * 90}ms` }}
    >
      <header className="mb-5 space-y-1.5">
        <div className="flex items-center gap-2 text-rosa">
          <IconeFlor className="size-4" />
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-suave">Ideia {indice + 1}</span>
        </div>
        <h3 className="font-titulo text-[1.75rem] font-semibold leading-tight">{busca.titulo}</h3>
        <p className="max-w-2xl text-suave">{busca.motivo}</p>
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
          <div className="mb-6 grid gap-3 md:grid-cols-2">
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
      <p className="mt-4 text-xs text-suave">
        Buscamos por <span className="rounded-full bg-rosa-bebe px-2 py-0.5 text-tinta">{busca.termo}</span>
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
  const aviso =
    totalProdutos > 0
      ? null
      : totalAnuncios > 0
        ? "A Shein não deixou a gente mostrar os produtos aqui agora, então trouxemos anúncios encontrados no Google e buscas prontas."
        : "A Shein não deixou a gente mostrar os produtos aqui agora, então preparamos buscas prontas. É só tocar para abrir.";

  return (
    <div className="space-y-6">
      <header className="surgir flex flex-col items-center gap-3 text-center">
        <h2 className="font-cursiva text-5xl leading-tight text-rosa sm:text-6xl">Suas ideias</h2>
        <p className="font-titulo text-xl italic text-tinta">
          {buscas.length} caminhos pensados para você
        </p>
        <div className="flex flex-wrap justify-center gap-1.5">
          {resumo.map((r) => (
            <span key={r} className="rounded-full bg-salvia-claro px-3 py-1 text-xs text-tinta">
              {r}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={aoEditar}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-rosa-forte transition hover:bg-rosa-bebe"
        >
          <IconeLapis className="size-4" /> Ajustar a busca
        </button>
      </header>

      {aviso && (
        <p className="surgir mx-auto flex max-w-2xl items-start gap-2 rounded-2xl bg-creme-escuro/70 px-4 py-3 text-sm text-suave" role="status">
          <svg viewBox="-12 -12 24 24" className="mt-0.5 size-4 shrink-0" aria-hidden>
            <Florzinha cor={CORES.lavanda} />
          </svg>
          {aviso}
        </p>
      )}

      {buscas.length > 2 && (
        // padding à direita: deixa espaço para o botão fixo de favoritos
        <nav aria-label="Ir para uma ideia" className="sticky top-3 z-20 -mx-4 pl-4 pr-20 sm:mx-0 sm:pl-0 sm:pr-40 2xl:pr-0">
          <div className="sem-barra mx-auto flex w-fit max-w-full gap-2 overflow-x-auto rounded-full border border-linha bg-papel/90 p-1.5 shadow-suave backdrop-blur">
            {buscas.map((b, i) => (
              <a
                key={b.termo}
                href={`#grupo-${i}`}
                className="shrink-0 rounded-full px-3.5 py-1.5 text-sm text-suave transition hover:bg-rosa-bebe hover:text-rosa-forte"
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

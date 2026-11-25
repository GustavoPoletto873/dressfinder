"use client";

import { useState } from "react";
import { lojaPorId } from "@/lib/lojas";
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
    // imagens vêm de vários domínios (lojas/Google); <img> simples evita configurar domínios no next/image
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

/** Item da vitrine: produto do scraper ou anúncio encontrado no Google. */
type ItemVitrine = Produto & Partial<Pick<Anuncio, "imagemReserva" | "tipo">>;

/** Cartão de vitrine (foto grande, loja, preço, coração e "Ver na loja"). Serve para produtos e anúncios. */
function CardProduto({ produto, indice, mostrarLoja }: { produto: ItemVitrine; indice: number; mostrarLoja: boolean }) {
  const nomeLoja = lojaPorId(produto.loja)?.nome ?? "loja";
  const ehLista = produto.tipo === "pagina";
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
        {mostrarLoja && (
          <span className="pointer-events-none absolute left-2.5 top-2.5 max-w-[calc(100%-4.5rem)] truncate rounded-full bg-superficie/95 px-2.5 py-1 text-[11px] font-semibold text-texto shadow-suave backdrop-blur">
            {nomeLoja}
          </span>
        )}
        <BotaoCoracao
          item={{ url: produto.url, titulo: produto.titulo, imagem: produto.imagem, preco: produto.preco, loja: produto.loja }}
          className="absolute right-2.5 top-2.5"
        />
        {produto.preco ? (
          <span className="absolute bottom-2.5 left-2.5 rounded-full bg-superficie/95 px-3 py-1 text-sm font-semibold shadow-suave backdrop-blur">
            {produto.preco}
          </span>
        ) : (
          !ehLista && (
            <span className="pointer-events-none absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 rounded-full bg-superficie/95 px-2.5 py-1 text-xs font-medium text-primaria-forte shadow-suave backdrop-blur">
              ver preço na loja <IconeExterno className="size-3" />
            </span>
          )
        )}
      </div>
      <h4 className="mt-3 line-clamp-2 px-1 text-sm leading-snug text-texto">{produto.titulo}</h4>
      <a
        href={produto.url}
        {...linkExterno}
        className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-full border border-destaque/40 px-3 py-2 text-sm font-medium text-primaria-forte transition-all duration-200 hover:border-primaria hover:bg-primaria hover:text-white active:scale-95"
      >
        <span className="truncate">{ehLista ? `Abrir lista na ${nomeLoja}` : `Ver na ${nomeLoja}`}</span>
        <IconeExterno className="size-3.5 shrink-0" />
      </a>
    </article>
  );
}

/** Botões de busca pronta, um por loja. Em destaque quando são o único conteúdo do grupo. */
function BotoesBusca({ busca, destaque }: { busca: ResultadoBusca; destaque: boolean }) {
  const modo = useModo();
  const subtituloGoogle =
    busca.links.length > 1 ? "Só resultados das lojas escolhidas" : `Só resultados da ${busca.links[0]?.nome ?? "loja"}`;
  if (destaque) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {busca.links.map((l) => (
          <a
            key={l.loja}
            href={l.url}
            {...linkExterno}
            className="group flex items-center gap-3 rounded-2xl bg-primaria px-5 py-4 text-white shadow-elevada transition-all duration-200 hover:-translate-y-0.5 hover:bg-primaria-forte active:scale-[0.98]"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/20">
              <IconeSacola className="size-5" />
            </span>
            <span className="flex-1">
              <span className="block font-medium">Ver esta busca na {l.nome}</span>
              <span className="block text-sm text-white/80">
                {l.viaGoogle
                  ? "Abre o Google só com peças da loja"
                  : modo === "roupas"
                    ? "Abre a lista de peças"
                    : "Abre a lista de vestidos"}
              </span>
            </span>
            <IconeExterno className="size-4 opacity-70 transition group-hover:opacity-100" />
          </a>
        ))}
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
            <span className="block text-sm text-texto-suave">{subtituloGoogle}</span>
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
      {busca.links.map((l) => (
        <a key={l.loja} href={l.url} {...linkExterno} className={classe}>
          <IconeSacola className="size-4" /> Mais na {l.nome}
        </a>
      ))}
      <a href={busca.linkGoogle} {...linkExterno} className={classe}>
        <IconeLupa className="size-4" /> Procurar no Google
      </a>
    </div>
  );
}

/** Quantos itens mostrar antes do "Ver mais" (evita rolagem enorme no celular). */
const INICIAIS_COM_PRECO = 8;
const INICIAIS_SEM_PRECO = 4;

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
  // produtos do scraper (com preço) primeiro, depois os anúncios das lojas escolhidas, na mesma vitrine
  const itens: ItemVitrine[] = [...busca.produtos, ...busca.anuncios];
  const iniciais = busca.produtos.length > 0 ? INICIAIS_COM_PRECO : INICIAIS_SEM_PRECO;
  const visiveis = verTudo ? itens : itens.slice(0, iniciais);
  const mostrarLoja = busca.links.length > 1;
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

      {itens.length > 0 && (
        <>
          <div className="mb-6 grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-4">
            {visiveis.map((item, i) => (
              <CardProduto key={item.url} produto={item} indice={i} mostrarLoja={mostrarLoja} />
            ))}
          </div>
          {!verTudo && itens.length > iniciais && (
            <BotaoVerMais restantes={itens.length - iniciais} onClick={() => setVerTudo(true)} />
          )}
        </>
      )}

      <BotoesBusca busca={busca} destaque={itens.length === 0} />
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
        ? "Estas peças foram encontradas no Google, sem o preço. Toque em uma para ver preço e tamanhos na loja."
        : "Não conseguimos trazer fotos das peças agora, então preparamos buscas prontas nas lojas escolhidas. É só tocar para abrir.";

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

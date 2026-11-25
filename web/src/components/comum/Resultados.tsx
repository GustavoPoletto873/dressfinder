"use client";

import { useState } from "react";
import { linkDaLoja, linkGoogle, lojaPorId } from "@/lib/lojas";
import type { SugestaoLook } from "@/lib/roupas/completeOLook";
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
export function Foto({ src, reserva, alt, className = "" }: { src: string | null; reserva?: string | null; alt: string; className?: string }) {
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

/** Produtos do scraper (com preço) primeiro, depois os anúncios das lojas escolhidas, na mesma vitrine. */
const itensDaBusca = (busca: ResultadoBusca): ItemVitrine[] => [...busca.produtos, ...busca.anuncios];

function GrupoBusca({ busca, indice, filtroLoja }: { busca: ResultadoBusca; indice: number; filtroLoja: string | null }) {
  const [verTudo, setVerTudo] = useState(false);
  const todos = itensDaBusca(busca);
  const itens = filtroLoja ? todos.filter((i) => i.loja === filtroLoja) : todos;
  const iniciais = busca.produtos.length > 0 ? INICIAIS_COM_PRECO : INICIAIS_SEM_PRECO;
  const visiveis = verTudo ? itens : itens.slice(0, iniciais);
  const mostrarLoja = busca.links.length > 1 && !filtroLoja;
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

      {filtroLoja && itens.length === 0 && todos.length > 0 && (
        <p className="mb-4 rounded-2xl bg-fundo-escuro/60 px-4 py-3 text-sm text-texto-suave">
          Nenhuma peça da {lojaPorId(filtroLoja)?.nome ?? "loja"} nesta ideia. Veja na própria loja:
        </p>
      )}
      <BotoesBusca busca={busca} destaque={todos.length === 0} />
      <p className="mt-4 text-xs text-texto-suave">
        Buscamos por <span className="rounded-full bg-primaria-suave px-2 py-0.5 text-texto">{busca.termo}</span>
      </p>
    </section>
  );
}

/** Chips "Todas · Shein · Renner…" para ver as peças de uma loja só. */
function FiltroLojas({ buscas, filtro, aoMudar }: { buscas: ResultadoBusca[]; filtro: string | null; aoMudar: (loja: string | null) => void }) {
  const lojas = buscas[0]?.links ?? [];
  const contagem = new Map<string, number>();
  for (const b of buscas) for (const i of itensDaBusca(b)) contagem.set(i.loja, (contagem.get(i.loja) ?? 0) + 1);
  const total = [...contagem.values()].reduce((s, n) => s + n, 0);
  if (lojas.length < 2 || total === 0) return null;
  const classe = (ativo: boolean) =>
    "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition active:scale-95 disabled:opacity-45 " +
    (ativo ? "border-primaria bg-primaria text-white shadow-chip" : "border-borda bg-superficie hover:border-destaque/50 hover:bg-primaria-suave");
  return (
    <div role="group" aria-label="Filtrar peças por loja" className="sem-barra -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0">
      <button type="button" aria-pressed={!filtro} onClick={() => aoMudar(null)} className={classe(!filtro)}>
        Todas <span className="text-xs opacity-75">{total}</span>
      </button>
      {lojas.map((l) => {
        const n = contagem.get(l.loja) ?? 0;
        return (
          <button key={l.loja} type="button" aria-pressed={filtro === l.loja} disabled={n === 0} onClick={() => aoMudar(filtro === l.loja ? null : l.loja)} className={classe(filtro === l.loja)}>
            {l.nome} <span className="text-xs opacity-75">{n}</span>
          </button>
        );
      })}
    </div>
  );
}

/** "Complete o look" (modo Roupas): buscas prontas de peças que combinam, só com links. */
function CompleteOLook({ sugestoes, lojas }: { sugestoes: SugestaoLook[]; lojas: string[] }) {
  if (!sugestoes.length || !lojas.length) return null;
  const linkPrincipal = (termo: string) => (lojas.length === 1 ? linkDaLoja(lojaPorId(lojas[0]!)!, termo).url : linkGoogle(lojas, termo));
  return (
    <section aria-labelledby="titulo-look" className="surgir rounded-[2rem] border border-dashed border-destaque/40 bg-primaria-suave/40 p-5 sm:p-7">
      <header className="mb-4 space-y-1">
        <h3 id="titulo-look" className="font-cursiva text-4xl leading-none text-primaria">Complete o look</h3>
        <p className="text-texto-suave">Peças que combinam com o que você procurou. Abrem a busca nas lojas escolhidas.</p>
      </header>
      <ul className="grid gap-3 sm:grid-cols-3">
        {sugestoes.map((s) => (
          <li key={s.termo} className="flex flex-col rounded-2xl border border-borda bg-superficie p-4 shadow-suave">
            <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-texto-suave">{s.rotulo}</span>
            <a
              href={linkPrincipal(s.termo)}
              {...linkExterno}
              className="group mt-1 inline-flex items-center gap-1.5 font-titulo text-xl font-semibold leading-tight hover:text-primaria-forte"
            >
              {s.titulo} <IconeExterno className="size-4 opacity-60 transition group-hover:opacity-100" />
            </a>
            {lojas.length > 1 && (
              <p className="mt-2 text-xs text-texto-suave">
                ou direto na{" "}
                {lojas.map((id, i) => {
                  const loja = lojaPorId(id);
                  if (!loja) return null;
                  return (
                    <span key={id}>
                      {i > 0 && " · "}
                      <a href={linkDaLoja(loja, s.termo).url} {...linkExterno} className="text-primaria-forte underline-offset-2 hover:underline">
                        {loja.nome}
                      </a>
                    </span>
                  );
                })}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

interface Props {
  resposta: RespostaBusca;
  /** Palavras que resumem o pedido (ocasião, comprimento, cor...). */
  resumo: string[];
  aoEditar: () => void;
  /** Sugestões de "Complete o look" (só no modo Roupas). */
  completar?: SugestaoLook[];
}

export function Resultados({ resposta, resumo, aoEditar, completar = [] }: Props) {
  const { totalProdutos, totalAnuncios, buscas } = resposta;
  const { FlorAviso } = useKitDecoracao();
  const [filtroLoja, setFiltroLoja] = useState<string | null>(null);
  const lojas = buscas[0]?.links.map((l) => l.loja) ?? [];
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

      <FiltroLojas buscas={buscas} filtro={filtroLoja} aoMudar={setFiltroLoja} />

      <div className="space-y-6">
        {buscas.map((b, i) => (
          <GrupoBusca key={b.termo} busca={b} indice={i} filtroLoja={filtroLoja} />
        ))}
      </div>

      <CompleteOLook sugestoes={completar} lojas={lojas} />
    </div>
  );
}

"use client";

/**
 * Favoritos da usuária, guardados no navegador (localStorage).
 *
 * Usa useSyncExternalStore: todos os componentes enxergam a mesma lista,
 * e no servidor a lista começa vazia (sem erro de hidratação).
 * Se o navegador bloquear o armazenamento, os favoritos funcionam só
 * enquanto a página estiver aberta.
 */
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { lojaDoLink, lojaPorId } from "@/lib/lojas";
import { IconeCoracao, IconeExterno, IconeFechar, IconeLixeira } from "./icones";
import { useKitDecoracao } from "./kitDecoracao";

export interface Favorito {
  url: string;
  titulo: string;
  imagem: string | null;
  preco: string | null;
  /** Id da loja (favoritos antigos não têm: a loja sai do link). */
  loja?: string;
}

/** Nome da loja de um favorito, para o botão "Ver na ...". */
function nomeDaLoja(f: Favorito): string {
  const porId = f.loja ? lojaPorId(f.loja) : undefined;
  if (porId) return porId.nome;
  try {
    return lojaDoLink(new URL(f.url))?.nome ?? "loja";
  } catch {
    return "loja";
  }
}

const CHAVE = "achei-o-vestido:favoritos";
const VAZIO: Favorito[] = [];
const ouvintes = new Set<() => void>();
let cache: Favorito[] | null = null;

function ler(): Favorito[] {
  if (cache) return cache;
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE) ?? "[]");
    cache = Array.isArray(salvo) ? salvo : [];
  } catch {
    cache = [];
  }
  return cache;
}

function gravar(lista: Favorito[]) {
  cache = lista;
  try {
    localStorage.setItem(CHAVE, JSON.stringify(lista));
  } catch {
    // armazenamento indisponível: mantém só em memória
  }
  ouvintes.forEach((ouvir) => ouvir());
}

function assinar(ouvir: () => void) {
  ouvintes.add(ouvir);
  return () => ouvintes.delete(ouvir);
}

export function useFavoritos() {
  const lista = useSyncExternalStore(assinar, ler, () => VAZIO);
  return {
    lista,
    eFavorito: (url: string) => lista.some((f) => f.url === url),
    alternar: (item: Favorito) => {
      const atual = ler();
      const existe = atual.some((f) => f.url === item.url);
      gravar(existe ? atual.filter((f) => f.url !== item.url) : [item, ...atual]);
      mostrarAviso(existe ? "Removido dos favoritos" : "Salvo nos seus favoritos");
    },
    remover: (url: string) => gravar(ler().filter((f) => f.url !== url)),
  };
}

// ---------------------------------------------------------------------------
// Aviso flutuante (toast)

let avisoAtual: { id: number; texto: string } | null = null;
const ouvintesAviso = new Set<() => void>();
let temporizadorAviso: ReturnType<typeof setTimeout> | undefined;

export function mostrarAviso(texto: string) {
  avisoAtual = { id: Date.now(), texto };
  ouvintesAviso.forEach((o) => o());
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => {
    avisoAtual = null;
    ouvintesAviso.forEach((o) => o());
  }, 2200);
}

export function Aviso() {
  const aviso = useSyncExternalStore(
    (o) => {
      ouvintesAviso.add(o);
      return () => ouvintesAviso.delete(o);
    },
    () => avisoAtual,
    () => null,
  );
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-5 z-50">
      {aviso && (
        <div
          key={aviso.id}
          className="aviso-entrar absolute left-1/2 flex items-center gap-2 whitespace-nowrap rounded-full bg-texto px-4 py-2.5 text-sm text-fundo shadow-elevada"
        >
          <IconeCoracao className="size-4 text-realce" cheio />
          {aviso.texto}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Botão de coração (usado nos cards)

export function BotaoCoracao({ item, className = "" }: { item: Favorito; className?: string }) {
  const { eFavorito, alternar } = useFavoritos();
  const ativo = eFavorito(item.url);
  const [pulo, setPulo] = useState(0);
  return (
    <button
      type="button"
      onClick={() => {
        alternar(item);
        setPulo((n) => n + 1);
      }}
      aria-pressed={ativo}
      aria-label={ativo ? `Remover ${item.titulo} dos favoritos` : `Salvar ${item.titulo} nos favoritos`}
      className={
        "grid size-10 place-items-center rounded-full bg-superficie/90 shadow-suave backdrop-blur transition-colors hover:bg-superficie " +
        (ativo ? "text-primaria" : "text-texto-suave hover:text-primaria") +
        " " +
        className
      }
    >
      <span key={pulo} className={pulo ? "coracao-pulo" : ""}>
        <IconeCoracao cheio={ativo} className="size-5" />
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Botão do topo + gaveta com a lista

export function BotaoFavoritos() {
  const { lista, remover } = useFavoritos();
  const { ArranjoVazio } = useKitDecoracao();
  const gaveta = useRef<HTMLDialogElement>(null);
  const [animarContador, setAnimarContador] = useState(false);
  const total = lista.length;
  const anterior = useRef(total);

  // dá um "pulinho" no contador quando entra um favorito novo
  useEffect(() => {
    if (total <= anterior.current) {
      anterior.current = total;
      return;
    }
    anterior.current = total;
    const inicio = setTimeout(() => setAnimarContador(true), 0);
    const fim = setTimeout(() => setAnimarContador(false), 500);
    return () => {
      clearTimeout(inicio);
      clearTimeout(fim);
    };
  }, [total]);

  return (
    <>
      <button
        type="button"
        onClick={() => gaveta.current?.showModal()}
        aria-label={`Abrir favoritos (${total})`}
        className="group relative flex h-11 items-center gap-2 rounded-full border border-borda bg-superficie/90 px-3.5 text-sm font-medium shadow-suave backdrop-blur transition hover:-translate-y-0.5 hover:border-destaque/40 hover:shadow-elevada active:translate-y-0 sm:px-4"
      >
        <IconeCoracao cheio={total > 0} className="size-5 text-primaria transition-transform group-hover:scale-110" />
        <span className="hidden sm:inline">Favoritos</span>
        {total > 0 && (
          <span
            className={
              "grid min-w-5 place-items-center rounded-full bg-primaria px-1.5 text-xs font-semibold text-white " +
              (animarContador ? "coracao-pulo" : "")
            }
          >
            {total}
          </span>
        )}
      </button>

      <dialog
        ref={gaveta}
        aria-label="Seus favoritos"
        onClick={(e) => {
          // clique fora do painel fecha a gaveta
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
        className="gaveta m-0 ml-auto h-dvh max-h-none w-full max-w-md bg-fundo p-0 text-texto shadow-elevada"
      >
        <div className="flex h-full flex-col">
          <header className="flex items-center justify-between border-b border-borda px-6 py-5">
            <div>
              <h2 className="font-cursiva text-4xl leading-none text-primaria">Favoritos</h2>
              <p className="mt-1 text-sm text-texto-suave">
                {/* lista única para os dois modos: por isso "peça" em vez de "vestido" */}
                {total === 0 ? "Nenhuma peça salva ainda" : `${total} ${total === 1 ? "peça salva" : "peças salvas"}`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => gaveta.current?.close()}
              aria-label="Fechar favoritos"
              className="grid size-10 place-items-center rounded-full text-texto-suave transition hover:bg-primaria-suave hover:text-texto"
            >
              <IconeFechar className="size-5" />
            </button>
          </header>

          {total === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-10 text-center">
              <svg viewBox="-50 -40 100 70" className="w-40" aria-hidden>
                <ArranjoVazio />
              </svg>
              <p className="text-texto-suave">
                Toque no <IconeCoracao className="inline size-4 align-[-2px] text-primaria" /> de uma peça para guardar aqui e comparar depois.
              </p>
            </div>
          ) : (
            <ul className="flex-1 space-y-3 overflow-y-auto px-6 py-5">
              {lista.map((f) => (
                <li key={f.url} className="flex gap-3 rounded-2xl border border-borda bg-superficie p-3 shadow-suave">
                  {f.imagem ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={f.imagem} alt="" referrerPolicy="no-referrer" className="h-24 w-18 shrink-0 rounded-xl object-cover" />
                  ) : (
                    <div className="grid h-24 w-18 shrink-0 place-items-center rounded-xl bg-primaria-suave text-primaria">
                      <IconeCoracao className="size-6" />
                    </div>
                  )}
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="line-clamp-2 text-sm leading-snug">{f.titulo}</p>
                    {f.preco && <p className="mt-1 font-semibold">{f.preco}</p>}
                    <div className="mt-auto flex items-center gap-2 pt-2">
                      <a
                        href={f.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full bg-primaria px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-primaria-forte"
                      >
                        Ver na {nomeDaLoja(f)} <IconeExterno className="size-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => remover(f.url)}
                        aria-label={`Remover ${f.titulo}`}
                        className="grid size-8 place-items-center rounded-full text-texto-suave transition hover:bg-primaria-suave hover:text-primaria-forte"
                      >
                        <IconeLixeira className="size-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </dialog>
    </>
  );
}

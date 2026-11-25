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
import { codificarEscolha, linkWhatsApp, MAX_PECAS, MIN_PECAS, pecaDoFavorito } from "@/lib/compartilhar";
import { lojaDoLink, lojaPorId } from "@/lib/lojas";
import { classeCampo } from "./campos";
import { IconeCheck, IconeCoracao, IconeExterno, IconeFechar, IconeLixeira } from "./icones";
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

  // "Qual eu levo?": escolha de 2 a 4 peças para mandar às amigas
  const [escolhendo, setEscolhendo] = useState(false);
  const [marcadas, setMarcadas] = useState<string[]>([]);
  const [nome, setNome] = useState("");
  const podeEnviar = marcadas.length >= MIN_PECAS && marcadas.length <= MAX_PECAS;
  const alternarMarcada = (url: string) => {
    if (marcadas.includes(url)) setMarcadas(marcadas.filter((u) => u !== url));
    else if (marcadas.length >= MAX_PECAS) mostrarAviso(`Dá para mandar até ${MAX_PECAS} peças`);
    else setMarcadas([...marcadas, url]);
  };
  // Peças marcadas, na ordem da lista de favoritos.
  const pecasMarcadas = lista
    .filter((f) => marcadas.includes(f.url))
    .map(pecaDoFavorito)
    .filter((p) => p !== null);
  const chaveLink = JSON.stringify([pecasMarcadas.map((p) => p.url), nome.trim()]);

  // O link é montado ANTES do toque (a compressão é assíncrona). Se fosse montado
  // depois, o Safari (iPhone/Mac) e o app instalado bloqueiam a abertura do
  // WhatsApp e a cópia, por não considerarem mais que foi um toque da pessoa.
  const [linkGerado, setLinkGerado] = useState<{ chave: string; link: string } | null>(null);
  const linkPronto = linkGerado?.chave === chaveLink ? linkGerado.link : null;
  useEffect(() => {
    if (!escolhendo || pecasMarcadas.length < MIN_PECAS) return;
    let ativo = true;
    codificarEscolha(pecasMarcadas, nome).then((hash) => {
      if (ativo) setLinkGerado({ chave: chaveLink, link: `${location.origin}/qual-eu-levo#${hash}` });
    });
    return () => {
      ativo = false;
    };
    // a chave resume as peças e o nome: só recalcula quando eles mudam
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [escolhendo, chaveLink]);

  function copiarLink(link: string) {
    // writeText chamado direto no toque (sem await antes), para o Safari permitir
    navigator.clipboard
      .writeText(link)
      .then(() => mostrarAviso("Link copiado. É só colar na conversa"))
      .catch(() => window.prompt("Copie o link:", link));
  }

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
        onClose={() => setEscolhendo(false)}
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
            <>
              {/* "Qual eu levo?": convite (com 2 ou mais peças) ou instrução do modo de escolha */}
              {total >= MIN_PECAS && !escolhendo && (
                <button
                  type="button"
                  onClick={() => {
                    setEscolhendo(true);
                    setMarcadas(lista.filter((f) => pecaDoFavorito(f)).slice(0, MAX_PECAS).map((f) => f.url));
                  }}
                  className="group mx-6 mt-5 flex items-center gap-3 rounded-2xl border border-dashed border-destaque/50 bg-primaria-suave/60 px-4 py-3 text-left transition hover:border-solid hover:bg-primaria-suave"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-superficie text-primaria shadow-suave transition group-hover:scale-110">
                    <IconeCoracao cheio className="size-5" />
                  </span>
                  <span className="flex-1">
                    <span className="block font-medium">Qual eu levo?</span>
                    <span className="block text-sm text-texto-suave">Mande de 2 a 4 peças para as amigas votarem no WhatsApp.</span>
                  </span>
                </button>
              )}
              {escolhendo && (
                <p className="mx-6 mt-5 rounded-2xl bg-primaria-suave px-4 py-3 text-sm text-primaria-forte" role="status">
                  Toque nas peças para marcar de {MIN_PECAS} a {MAX_PECAS}. Marcadas: <strong>{marcadas.length}</strong>
                </p>
              )}

              <ul className="flex-1 space-y-3 overflow-y-auto px-6 py-5">
                {lista.map((f) => {
                  const compartilhavel = Boolean(pecaDoFavorito(f));
                  const marcada = marcadas.includes(f.url);
                  return (
                    <li
                      key={f.url}
                      className={
                        "relative flex gap-3 rounded-2xl border bg-superficie p-3 shadow-suave transition " +
                        (escolhendo && marcada ? "border-primaria ring-2 ring-primaria/30" : "border-borda")
                      }
                    >
                      {escolhendo && (
                        // no modo de escolha, o cartão inteiro vira um botão de marcar
                        <button
                          type="button"
                          disabled={!compartilhavel}
                          onClick={() => alternarMarcada(f.url)}
                          aria-pressed={marcada}
                          aria-label={`${marcada ? "Desmarcar" : "Marcar"} ${f.titulo}`}
                          className="absolute inset-0 z-10 rounded-2xl disabled:cursor-not-allowed"
                        />
                      )}
                      <div className="relative shrink-0">
                        {f.imagem ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={f.imagem} alt="" referrerPolicy="no-referrer" className="h-24 w-18 rounded-xl object-cover" />
                        ) : (
                          <div className="grid h-24 w-18 place-items-center rounded-xl bg-primaria-suave text-primaria">
                            <IconeCoracao className="size-6" />
                          </div>
                        )}
                        {escolhendo && compartilhavel && (
                          <span
                            className={
                              "absolute left-1 top-1 grid size-6 place-items-center rounded-full border-2 border-white shadow-sm " +
                              (marcada ? "bg-primaria text-white" : "bg-white/80")
                            }
                          >
                            {marcada && <IconeCheck className="size-3.5" strokeWidth={3} />}
                          </span>
                        )}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <p className="line-clamp-2 text-sm leading-snug">{f.titulo}</p>
                        {f.preco && <p className="mt-1 font-semibold">{f.preco}</p>}
                        {escolhendo && !compartilhavel && <p className="mt-1 text-xs text-texto-suave">Esta loja não entra no “Qual eu levo?”.</p>}
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
                  );
                })}
              </ul>

              {escolhendo && (
                <div className="space-y-3 border-t border-borda bg-fundo px-6 py-4">
                  <input
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    maxLength={30}
                    placeholder="Seu nome (opcional)"
                    aria-label="Seu nome, para as amigas saberem quem pediu (opcional)"
                    className={classeCampo}
                  />
                  <div className="flex gap-2">
                    {podeEnviar && linkPronto ? (
                      // link comum (não window.open): abre o WhatsApp na hora, sem bloqueio de pop-up
                      <a
                        href={linkWhatsApp(`Me ajuda a escolher? Qual eu levo? 💕\n${linkPronto}`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-primaria px-4 text-sm font-semibold text-white shadow-elevada transition hover:bg-primaria-forte active:scale-[0.98]"
                      >
                        Mandar no WhatsApp
                      </a>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-primaria px-4 text-sm font-semibold text-white opacity-50"
                      >
                        Mandar no WhatsApp
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => linkPronto && copiarLink(linkPronto)}
                      disabled={!podeEnviar || !linkPronto}
                      className="h-11 rounded-full border border-borda bg-superficie px-4 text-sm font-medium transition hover:border-destaque/50 active:scale-[0.98] disabled:opacity-50"
                    >
                      Copiar link
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEscolhendo(false)}
                    className="w-full text-center text-sm text-texto-suave underline-offset-4 hover:underline"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </dialog>
    </>
  );
}

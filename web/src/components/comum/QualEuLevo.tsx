"use client";

/**
 * Página "Qual eu levo?" que a amiga abre pelo link do WhatsApp.
 * As peças vêm do próprio link (depois do #). A amiga toca na que levaria
 * e responde pelo WhatsApp com a mensagem pronta.
 */
import Link from "next/link";
import { useEffect, useState } from "react";
import { abrirEscolha, linkWhatsApp, type EscolhaAberta } from "@/lib/compartilhar";
import { lojaPorId } from "@/lib/lojas";
import { IconeCoracao, IconeExterno, IconeFlor } from "./icones";
import { Foto } from "./Resultados";

type Estado = { tipo: "lendo" } | { tipo: "invalido" } | { tipo: "ok"; escolha: EscolhaAberta };

const linkExterno = { target: "_blank", rel: "noopener noreferrer" } as const;

function Convite() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 rounded-full bg-primaria px-6 py-3 font-semibold text-white shadow-elevada transition hover:-translate-y-0.5 hover:bg-primaria-forte"
    >
      <IconeFlor className="size-5 text-white/90" /> Quero achar o meu também
    </Link>
  );
}

export function QualEuLevo() {
  const [estado, setEstado] = useState<Estado>({ tipo: "lendo" });
  const [voto, setVoto] = useState<number | null>(null);

  useEffect(() => {
    let ativo = true;
    const ler = () =>
      abrirEscolha(location.hash).then((escolha) => {
        if (!ativo) return;
        setVoto(null);
        setEstado(escolha ? { tipo: "ok", escolha } : { tipo: "invalido" });
      });
    ler();
    window.addEventListener("hashchange", ler);
    return () => {
      ativo = false;
      window.removeEventListener("hashchange", ler);
    };
  }, []);

  if (estado.tipo === "lendo") {
    return <p className="py-24 text-center text-texto-suave" role="status">Abrindo as peças…</p>;
  }

  if (estado.tipo === "invalido") {
    return (
      <div className="surgir mx-auto max-w-md space-y-5 py-16 text-center">
        <h1 className="font-cursiva text-6xl leading-tight text-primaria">Ops!</h1>
        <p className="font-titulo text-xl italic">Esse link não abriu direito.</p>
        <p className="text-texto-suave">
          Ele pode ter expirado (os links duram 90 dias). Peça para quem mandou gerar de novo, pela lista de favoritos do app.
        </p>
        <Convite />
      </div>
    );
  }

  const { nome, pecas } = estado.escolha;
  const escolhida = voto !== null ? pecas[voto] : undefined;
  const nomeLoja = (id: string) => lojaPorId(id)?.nome ?? "loja";
  const resposta = escolhida
    ? `Eu levaria a opção ${voto! + 1}: ${escolhida.titulo} (${nomeLoja(escolhida.loja)}) 💕\n${escolhida.url}`
    : "";

  return (
    <div className="space-y-10 pb-28">
      <header className="surgir space-y-3 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-texto-suave">Achei o Vestido</p>
        <h1 className="font-cursiva text-6xl leading-[1.1] text-primaria sm:text-7xl">Qual eu levo?</h1>
        <p className="mx-auto max-w-xl font-titulo text-xl italic text-texto sm:text-2xl">
          {nome ? `${nome} quer a sua opinião.` : "Sua amiga quer a sua opinião."} Toque na peça que você levaria.
        </p>
      </header>

      <ol className={"mx-auto grid max-w-5xl grid-cols-2 gap-x-4 gap-y-8 " + (pecas.length > 2 ? "sm:grid-cols-4" : "sm:max-w-2xl")}>
        {pecas.map((p, i) => {
          const ativa = voto === i;
          return (
            <li key={p.url} className="surgir flex flex-col" style={{ animationDelay: `${i * 90}ms` }}>
              <button
                type="button"
                onClick={() => setVoto(ativa ? null : i)}
                aria-pressed={ativa}
                aria-label={`Opção ${i + 1}: ${p.titulo}`}
                className={
                  "group relative overflow-hidden rounded-3xl bg-fundo-escuro text-left shadow-suave transition duration-300 " +
                  (ativa ? "ring-4 ring-primaria" : voto !== null ? "opacity-70 hover:opacity-100" : "hover:-translate-y-1 hover:shadow-elevada")
                }
              >
                <Foto src={p.imagem} alt="" className="aspect-[3/4] w-full" />
                <span className="absolute left-2.5 top-2.5 grid size-8 place-items-center rounded-full bg-superficie/95 font-titulo text-lg font-semibold shadow-suave">
                  {i + 1}
                </span>
                <span className="absolute right-2.5 top-2.5 rounded-full bg-superficie/95 px-2.5 py-1 text-[11px] font-semibold shadow-suave">
                  {nomeLoja(p.loja)}
                </span>
                {ativa && (
                  <span className="coracao-pulo absolute inset-x-0 bottom-3 mx-auto flex w-fit items-center gap-1.5 rounded-full bg-primaria px-3 py-1.5 text-sm font-semibold text-white shadow-elevada">
                    <IconeCoracao cheio className="size-4" /> Eu levaria
                  </span>
                )}
              </button>
              <h2 className="mt-3 line-clamp-2 px-1 text-sm leading-snug">{p.titulo}</h2>
              {p.preco && <p className="px-1 text-sm font-semibold">{p.preco}</p>}
              <a href={p.url} {...linkExterno} className="mt-1 inline-flex items-center gap-1 px-1 text-xs text-primaria-forte underline-offset-4 hover:underline">
                Ver na {nomeLoja(p.loja)} <IconeExterno className="size-3" />
              </a>
            </li>
          );
        })}
      </ol>

      <div className="surgir text-center" style={{ animationDelay: "400ms" }}>
        <p className="mb-3 text-sm text-texto-suave">Também está procurando um look?</p>
        <Convite />
      </div>

      {/* resposta: aparece depois de escolher, presa no rodapé da tela */}
      {escolhida && (
        <div className="surgir fixed inset-x-0 bottom-4 z-40 mx-auto flex w-[calc(100%-2rem)] max-w-xl items-center gap-3 rounded-full bg-superficie/95 p-2 pl-5 shadow-elevada backdrop-blur">
          <p className="min-w-0 flex-1 leading-tight">
            <span className="block text-xs text-texto-suave">Sua escolha</span>
            <strong className="block">Opção {voto! + 1}</strong>
          </p>
          <a
            href={linkWhatsApp(resposta)}
            {...linkExterno}
            className="shrink-0 rounded-full bg-primaria px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primaria-forte active:scale-95"
          >
            Responder no WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}

"use client";

/**
 * "Recebeu um convite com traje?": guia dos trajes (esporte fino, passeio,
 * passeio completo, black tie...) numa folha, na etapa da ocasião do modo Vestidos.
 * "Usar na busca" junta o traje à ocasião escolhida.
 */
import { useRef } from "react";
import { DICAS_CONVIDADA, ocasiaoComTraje, ocasiaoSemTraje, TRAJES, trajeDaOcasiao, type Traje } from "@/lib/trajes";
import { Folha } from "../comum/Folha";
import { IconeCheck, IconeFechar, IconeInfo } from "../comum/icones";

function Formalidade({ nivel }: { nivel: number }) {
  return (
    <span className="flex items-center gap-1" aria-label={`Formalidade ${nivel} de 5`} role="img">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={"size-2 rounded-full " + (n <= nivel ? "bg-primaria" : "bg-borda")} />
      ))}
    </span>
  );
}

function CartaoTraje({ traje, ativo, aoUsar }: { traje: Traje; ativo: boolean; aoUsar: () => void }) {
  return (
    <article className={"rounded-3xl border bg-superficie p-4 sm:p-5 " + (ativo ? "border-primaria shadow-cartao" : "border-borda")}>
      <header className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-titulo text-2xl font-semibold capitalize leading-tight">Traje {traje.nome}</h3>
          <p className="font-titulo text-lg italic leading-snug text-texto-suave">{traje.resumo}</p>
        </div>
        <Formalidade nivel={traje.formalidade} />
      </header>
      <dl className="mt-3 space-y-2 text-sm leading-relaxed">
        <div>
          <dt className="font-medium text-secundaria">Quando aparece</dt>
          <dd>{traje.quando}</dd>
        </div>
        <div>
          <dt className="font-medium text-secundaria">Como se vestir</dt>
          <dd>{traje.como}</dd>
        </div>
        <div>
          <dt className="font-medium text-primaria-forte">Evite</dt>
          <dd>{traje.evite}</dd>
        </div>
      </dl>
      <button
        type="button"
        onClick={aoUsar}
        aria-pressed={ativo}
        className={
          "mt-4 flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition active:scale-[0.98] " +
          (ativo ? "bg-primaria-suave text-primaria-forte" : "border border-destaque/40 text-primaria-forte hover:border-primaria hover:bg-primaria hover:text-white")
        }
      >
        {ativo ? (
          <>
            <IconeCheck className="size-4" strokeWidth={2.4} /> Na sua busca
          </>
        ) : (
          `Usar “${traje.nome}” na busca`
        )}
      </button>
    </article>
  );
}

export function GuiaTrajes({ ocasiao, aoMudar }: { ocasiao: string; aoMudar: (ocasiao: string) => void }) {
  const folha = useRef<HTMLDialogElement>(null);
  const atual = trajeDaOcasiao(ocasiao);
  const semTraje = ocasiaoSemTraje(ocasiao);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => folha.current?.showModal()}
          className="inline-flex items-center gap-1.5 rounded-full px-1 py-1 text-sm text-primaria-forte underline-offset-4 transition hover:underline"
        >
          <IconeInfo className="size-4" /> Recebeu um convite com traje? Veja o que significa cada um
        </button>
        {atual && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primaria-suave py-1 pl-3 pr-1 text-sm text-primaria-forte">
            Traje {atual.nome}
            <button
              type="button"
              onClick={() => aoMudar(semTraje)}
              aria-label={`Tirar o traje ${atual.nome} da busca`}
              className="grid size-6 place-items-center rounded-full transition hover:bg-realce"
            >
              <IconeFechar className="size-3.5" />
            </button>
          </span>
        )}
      </div>

      <Folha
        ref={folha}
        id="guia-trajes"
        titulo="Que traje é esse?"
        subtitulo="Do mais descontraído ao mais formal. Escolha um para a gente considerar na busca."
      >
        <div className="space-y-3">
          {TRAJES.map((t) => (
            <CartaoTraje
              key={t.id}
              traje={t}
              ativo={atual?.id === t.id}
              aoUsar={() => {
                aoMudar(atual?.id === t.id ? semTraje : ocasiaoComTraje(ocasiao, t));
                if (atual?.id !== t.id) folha.current?.close();
              }}
            />
          ))}
        </div>
        <aside className="rounded-3xl bg-primaria-suave px-5 py-4">
          <h3 className="font-titulo text-xl font-semibold">Convidada de casamento: vale lembrar</h3>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed marker:text-primaria">
            {DICAS_CONVIDADA.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </aside>
      </Folha>
    </>
  );
}

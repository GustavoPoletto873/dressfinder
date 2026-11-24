/**
 * Camada de serviço: cache LRU, fila de concorrência e logs em volta da busca.
 */
import { LRUCache } from "lru-cache";
import { buscarNaShein, type ResultadoInterno } from "./buscarShein.js";
import { Fila } from "./fila.js";
import type { ResultadoBusca } from "./tipos.js";

const SEIS_HORAS = 6 * 60 * 60 * 1000;
/** Bloqueios ficam pouco tempo no cache, só para não insistir na Shein. */
const QUINZE_MINUTOS = 15 * 60 * 1000;
const TIMEOUT_BUSCA_MS = 20_000;
export const LIMITE_MAXIMO = 24;

/**
 * Pausa automática: depois de vários bloqueios seguidos, paramos de abrir
 * páginas por um tempo e respondemos "bloqueado" na hora. Assim não
 * insistimos na Shein e o app responde rápido usando o plano B.
 */
const BLOQUEIOS_PARA_PAUSAR = 3;
const DURACAO_PAUSA_MS = 5 * 60 * 1000;
let bloqueiosSeguidos = 0;
let pausadoAte = 0;

const cache = new LRUCache<string, ResultadoBusca>({ max: 500, ttl: SEIS_HORAS });
const fila = new Fila(2);
/** Buscas iguais em andamento compartilham o mesmo resultado. */
const emAndamento = new Map<string, Promise<ResultadoBusca>>();

type Logger = { info: (msg: string) => void; warn: (msg: string) => void };

function chaveCache(termo: string): string {
  return termo.trim().toLowerCase().replace(/\s+/g, " ");
}

export function estadoServico() {
  const pausa = Math.max(0, Math.ceil((pausadoAte - Date.now()) / 1000));
  return { cache: cache.size, emExecucao: fila.emExecucao, naFila: fila.naFila, pausadoPorSegundos: pausa };
}

export async function buscar(termo: string, limite: number, log: Logger): Promise<ResultadoBusca> {
  const chave = chaveCache(termo);
  const inicio = Date.now();

  const emCache = cache.get(chave);
  if (emCache) {
    const produtos = emCache.produtos.slice(0, limite);
    log.info(`busca termo="${termo}" status=${emCache.status} produtos=${produtos.length} tempo=0.0s origem=cache`);
    return { status: emCache.status, produtos };
  }

  let promessa = emAndamento.get(chave);
  if (!promessa) {
    // sempre busca o máximo e corta depois, para o cache servir qualquer limite
    promessa = executarComFila(termo, log, inicio).finally(() => emAndamento.delete(chave));
    emAndamento.set(chave, promessa);
  }
  const resultado = await promessa;
  return { status: resultado.status, produtos: resultado.produtos.slice(0, limite) };
}

async function executarComFila(termo: string, log: Logger, inicio: number): Promise<ResultadoBusca> {
  let interno: ResultadoInterno;
  try {
    interno = await fila.executar(async () => {
      // conferido dentro da fila: buscas que esperavam também respeitam a pausa
      if (Date.now() < pausadoAte) {
        return { status: "bloqueado", produtos: [], origem: "nenhuma", detalhe: "pausa após bloqueios seguidos" };
      }
      return buscarNaShein(termo, LIMITE_MAXIMO, TIMEOUT_BUSCA_MS);
    });
  } catch (erro) {
    interno = { status: "erro", produtos: [], origem: "nenhuma", detalhe: (erro as Error).message };
  }

  if (interno.status === "bloqueado" && !interno.detalhe?.startsWith("pausa")) {
    bloqueiosSeguidos += 1;
    if (bloqueiosSeguidos >= BLOQUEIOS_PARA_PAUSAR) {
      pausadoAte = Date.now() + DURACAO_PAUSA_MS;
      bloqueiosSeguidos = 0;
      log.warn(`shein bloqueou ${BLOQUEIOS_PARA_PAUSAR} buscas seguidas: pausando por ${DURACAO_PAUSA_MS / 60_000} min`);
    }
  } else if (interno.status === "ok" || interno.status === "vazio") {
    bloqueiosSeguidos = 0;
  }

  const segundos = ((Date.now() - inicio) / 1000).toFixed(1);
  const detalhe = interno.detalhe ? ` detalhe="${interno.detalhe}"` : "";
  const linha = `busca termo="${termo}" status=${interno.status} produtos=${interno.produtos.length} tempo=${segundos}s origem=${interno.origem}${detalhe}`;
  if (interno.status === "ok" || interno.status === "vazio") log.info(linha);
  else log.warn(linha);

  const resultado: ResultadoBusca = { status: interno.status, produtos: interno.produtos };
  if (interno.status === "ok" || interno.status === "vazio") cache.set(chaveCache(termo), resultado);
  else if (interno.status === "bloqueado" && !interno.detalhe?.startsWith("pausa")) {
    cache.set(chaveCache(termo), resultado, { ttl: QUINZE_MINUTOS });
  }
  return resultado;
}

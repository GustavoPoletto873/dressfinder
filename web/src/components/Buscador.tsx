"use client";

/**
 * Coordena os dois modos (Vestidos e Roupas).
 *
 * Os dois formulários ficam montados o tempo todo, cada um com seu estado:
 * o que a pessoa digitou num modo continua lá quando ela volta. O CSS
 * (.so-vestidos / .so-roupas) mostra só o do tema ativo, já na primeira
 * pintura. Trocar de modo limpa os resultados e cancela a busca em andamento.
 */
import { useEffect, useRef, useState } from "react";
import { linkDaLoja, linkGoogle, lojaPorId } from "@/lib/lojas";
import { sugestoesParaCompletar, type SugestaoLook } from "@/lib/roupas/completeOLook";
import { gerarBuscasPorRegras } from "@/lib/termosRegras";
import { esquemaEntrada, type Entrada, type Modo, type RespostaBusca } from "@/lib/tipos";
import { removerRecente, salvarRecente, useBuscasRecentes, type BuscaRecente } from "./comum/buscasRecentes";
import { Carregando } from "./comum/Carregando";
import { IconeFechar, IconeRelogio } from "./comum/icones";
import { useLojasEscolhidas } from "./comum/lojasEscolhidas";
import { aoTrocarModo, sincronizarCorDaBarra, useModo } from "./comum/modo";
import { Resultados } from "./comum/Resultados";
import { SeletorLojas } from "./comum/SeletorLojas";
import {
  FormularioRoupas,
  paraEnvioRoupas,
  resumoRoupas,
  VALORES_INICIAIS_ROUPAS,
  type ValoresRoupas,
} from "./roupas/FormularioRoupas";
import {
  FormularioVestidos,
  paraEnvioVestidos,
  resumoVestidos,
  VALORES_INICIAIS_VESTIDOS,
  type ValoresVestidos,
} from "./vestidos/FormularioVestidos";

/** Se a API do app falhar, monta links de busca no próprio navegador. */
function respostaLocal(entrada: Entrada): RespostaBusca {
  return {
    buscas: gerarBuscasPorRegras(entrada).map((b) => ({
      ...b,
      links: entrada.lojas.map((id) => {
        const loja = lojaPorId(id)!;
        return { loja: id, nome: loja.nome, ...linkDaLoja(loja, b.termo) };
      }),
      linkGoogle: linkGoogle(entrada.lojas, b.termo),
      status: "erro" as const,
      produtos: [],
      statusAnuncios: "erro" as const,
      anuncios: [],
    })),
    origemTermos: "regras",
    totalProdutos: 0,
    totalAnuncios: 0,
  };
}

/** Chips das buscas recentes do modo atual: tocar refaz a busca. */
function BuscasRecentes({ lista, aoUsar }: { lista: BuscaRecente[]; aoUsar: (b: BuscaRecente) => void }) {
  if (!lista.length) return null;
  return (
    <div className="flex items-center gap-2 text-sm sm:justify-center">
      <span className="flex shrink-0 items-center gap-1 text-texto-suave">
        <IconeRelogio className="size-4" aria-hidden /> Recentes
      </span>
      <ul className="sem-barra -mr-4 flex gap-2 overflow-x-auto pr-4 sm:mr-0 sm:flex-wrap sm:pr-0">
        {lista.slice(0, 4).map((b) => (
          <li key={b.id} className="flex shrink-0 items-center rounded-full border border-borda bg-superficie/90 shadow-suave">
            <button
              type="button"
              onClick={() => aoUsar(b)}
              title={`Refazer: ${b.rotulo}`}
              className="max-w-[15rem] truncate rounded-l-full py-1.5 pl-3.5 pr-1.5 text-texto transition hover:text-primaria-forte"
            >
              {b.rotulo}
            </button>
            <button
              type="button"
              onClick={() => removerRecente(b.id)}
              aria-label={`Apagar a busca recente ${b.rotulo}`}
              className="grid size-7 place-items-center rounded-full text-texto-suave transition hover:bg-primaria-suave hover:text-texto"
            >
              <IconeFechar className="size-3.5" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Classes do cartão do formulário (iguais nos dois modos). */
const CLASSE_CARTAO =
  "mx-auto max-w-3xl scroll-mt-6 rounded-[2.25rem] border border-borda bg-superficie/85 p-5 shadow-suave backdrop-blur-sm sm:p-10";

export function Buscador() {
  const modo = useModo();
  const { lojas } = useLojasEscolhidas();
  const [vestidos, setVestidos] = useState<ValoresVestidos>(VALORES_INICIAIS_VESTIDOS);
  const [roupas, setRoupas] = useState<ValoresRoupas>(VALORES_INICIAIS_ROUPAS);
  const [erros, setErros] = useState<Record<Modo, string[]>>({ vestidos: [], roupas: [] });
  const [carregando, setCarregando] = useState(false);
  const [resposta, setResposta] = useState<RespostaBusca | null>(null);
  const [resumo, setResumo] = useState<string[]>([]);
  const [completar, setCompletar] = useState<SugestaoLook[]>([]);
  const recentes = useBuscasRecentes().filter((b) => b.modo === modo);
  const areaResultados = useRef<HTMLDivElement>(null);
  const formVestidos = useRef<HTMLDivElement>(null);
  const formRoupas = useRef<HTMLDivElement>(null);
  /** Cartão do formulário de um modo (usar só em eventos, nunca durante a renderização). */
  const cartaoDo = (m: Modo) => (m === "roupas" ? formRoupas.current : formVestidos.current);
  /** Busca em andamento: permite cancelar e ignorar respostas que chegarem depois. */
  const buscaAtual = useRef<{ id: number; controle: AbortController } | null>(null);

  useEffect(() => {
    sincronizarCorDaBarra();
    // trocar de modo limpa os resultados e cancela a busca em andamento
    return aoTrocarModo(() => {
      buscaAtual.current?.controle.abort();
      buscaAtual.current = null;
      setCarregando(false);
      setResposta(null);
      setResumo([]);
      setCompletar([]);
    });
  }, []);

  const rolarPara = (el: HTMLElement | null) =>
    requestAnimationFrame(() => el?.scrollIntoView({ behavior: "smooth", block: "start" }));

  const definirErros = (m: Modo, lista: string[]) => setErros((atual) => ({ ...atual, [m]: lista }));

  /**
   * Faz a busca com os valores do formulário do modo atual ou, ao refazer uma
   * busca recente, com os valores dela (o estado do formulário ainda não mudou).
   */
  async function buscar(forcado?: { modo: Modo; valores: ValoresVestidos | ValoresRoupas }) {
    const modoDaBusca = forcado?.modo ?? modo;
    const valoresV = forcado?.modo === "vestidos" ? (forcado.valores as ValoresVestidos) : vestidos;
    const valoresR = forcado?.modo === "roupas" ? (forcado.valores as ValoresRoupas) : roupas;
    const base = modoDaBusca === "roupas" ? paraEnvioRoupas(valoresR) : paraEnvioVestidos(valoresV);
    const envio = { ...base, lojas };
    const validacao = esquemaEntrada.safeParse(envio);
    if (!validacao.success) {
      // as etapas obrigatórias já são conferidas pela jornada; aqui sobram erros como a faixa de preço
      definirErros(modoDaBusca, [...new Set(validacao.error.issues.map((i) => i.message))]);
      rolarPara(cartaoDo(modoDaBusca));
      return;
    }
    definirErros(modoDaBusca, []);
    setCarregando(true);
    setResposta(null);
    const nomesLojas = lojas.map((id) => lojaPorId(id)?.nome).filter(Boolean).join(", ");
    const partesResumo = envio.modo === "roupas" ? resumoRoupas(envio) : resumoVestidos(envio);
    setResumo([...partesResumo, `em ${nomesLojas}`]);
    salvarRecente(modoDaBusca, modoDaBusca === "roupas" ? valoresR : valoresV, partesResumo);
    setCompletar(validacao.data.modo === "roupas" ? sugestoesParaCompletar(validacao.data) : []);
    rolarPara(areaResultados.current);

    buscaAtual.current?.controle.abort();
    const busca = { id: Date.now(), controle: new AbortController() };
    buscaAtual.current = busca;
    const aindaVale = () => buscaAtual.current?.id === busca.id;

    try {
      const r = await fetch("/api/buscar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(envio),
        signal: busca.controle.signal,
      });
      const dados = await r.json().catch(() => null);
      if (!aindaVale()) return; // o modo mudou ou outra busca começou
      if (r.status === 400 || r.status === 429) {
        definirErros(modoDaBusca, dados?.detalhes ?? [dados?.erro ?? "Não foi possível buscar agora."]);
        rolarPara(cartaoDo(modoDaBusca));
        return;
      }
      if (!r.ok || !dados?.buscas) throw new Error(`HTTP ${r.status}`);
      setResposta(dados as RespostaBusca);
    } catch {
      if (!aindaVale()) return; // busca cancelada de propósito
      // a API caiu: ainda assim entregamos buscas prontas montadas aqui mesmo
      setResposta(respostaLocal(validacao.data));
    } finally {
      if (aindaVale()) {
        setCarregando(false);
        buscaAtual.current = null;
      }
    }
  }

  return (
    <div className="space-y-16">
      <div className="space-y-5">
        {/* lojas onde procurar: as mesmas nos dois modos */}
        <SeletorLojas />
        <BuscasRecentes
          lista={recentes}
          aoUsar={(b) => {
            // completa com os valores iniciais (versões antigas podem não ter algum campo)
            if (b.modo === "roupas") {
              const valores = { ...VALORES_INICIAIS_ROUPAS, ...b.valores };
              setRoupas(valores);
              buscar({ modo: "roupas", valores });
            } else {
              const valores = { ...VALORES_INICIAIS_VESTIDOS, ...b.valores };
              setVestidos(valores);
              buscar({ modo: "vestidos", valores });
            }
          }}
        />
        <div ref={formVestidos} className={`so-vestidos ${CLASSE_CARTAO}`}>
          <FormularioVestidos valores={vestidos} aoMudar={setVestidos} aoEnviar={buscar} carregando={carregando} erros={erros.vestidos} />
        </div>
        <div ref={formRoupas} className={`so-roupas ${CLASSE_CARTAO}`}>
          <FormularioRoupas valores={roupas} aoMudar={setRoupas} aoEnviar={buscar} carregando={carregando} erros={erros.roupas} />
        </div>
      </div>

      <div ref={areaResultados} className="scroll-mt-6" aria-busy={carregando}>
        {carregando ? (
          <Carregando />
        ) : resposta ? (
          <Resultados resposta={resposta} resumo={resumo} completar={completar} aoEditar={() => rolarPara(cartaoDo(modo))} />
        ) : null}
      </div>
    </div>
  );
}

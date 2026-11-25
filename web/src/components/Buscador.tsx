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
import { linkBuscaGoogle, linkBuscaShein } from "@/lib/links";
import { gerarBuscasPorRegras } from "@/lib/termosRegras";
import { esquemaEntrada, type Entrada, type Modo, type RespostaBusca } from "@/lib/tipos";
import { Carregando } from "./comum/Carregando";
import { aoTrocarModo, sincronizarCorDaBarra, useModo } from "./comum/modo";
import { Resultados } from "./comum/Resultados";
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
      linkShein: linkBuscaShein(b.termo),
      linkGoogle: linkBuscaGoogle(b.termo),
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

/** Classes do cartão do formulário (iguais nos dois modos). */
const CLASSE_CARTAO =
  "mx-auto max-w-3xl scroll-mt-6 rounded-[2.25rem] border border-borda bg-superficie/85 p-5 shadow-suave backdrop-blur-sm sm:p-10";

export function Buscador() {
  const modo = useModo();
  const [vestidos, setVestidos] = useState<ValoresVestidos>(VALORES_INICIAIS_VESTIDOS);
  const [roupas, setRoupas] = useState<ValoresRoupas>(VALORES_INICIAIS_ROUPAS);
  const [erros, setErros] = useState<Record<Modo, string[]>>({ vestidos: [], roupas: [] });
  const [carregando, setCarregando] = useState(false);
  const [resposta, setResposta] = useState<RespostaBusca | null>(null);
  const [resumo, setResumo] = useState<string[]>([]);
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
    });
  }, []);

  const rolarPara = (el: HTMLElement | null) =>
    requestAnimationFrame(() => el?.scrollIntoView({ behavior: "smooth", block: "start" }));

  const definirErros = (m: Modo, lista: string[]) => setErros((atual) => ({ ...atual, [m]: lista }));

  async function buscar() {
    const modoDaBusca = modo;
    const envio = modoDaBusca === "roupas" ? paraEnvioRoupas(roupas) : paraEnvioVestidos(vestidos);
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
    setResumo(envio.modo === "roupas" ? resumoRoupas(envio) : resumoVestidos(envio));
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
      <div ref={formVestidos} className={`so-vestidos ${CLASSE_CARTAO}`}>
        <FormularioVestidos valores={vestidos} aoMudar={setVestidos} aoEnviar={buscar} carregando={carregando} erros={erros.vestidos} />
      </div>
      <div ref={formRoupas} className={`so-roupas ${CLASSE_CARTAO}`}>
        <FormularioRoupas valores={roupas} aoMudar={setRoupas} aoEnviar={buscar} carregando={carregando} erros={erros.roupas} />
      </div>

      <div ref={areaResultados} className="scroll-mt-6" aria-busy={carregando}>
        {carregando ? (
          <Carregando />
        ) : resposta ? (
          <Resultados resposta={resposta} resumo={resumo} aoEditar={() => rolarPara(cartaoDo(modo))} />
        ) : null}
      </div>
    </div>
  );
}

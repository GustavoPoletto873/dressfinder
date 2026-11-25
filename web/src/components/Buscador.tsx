"use client";

import { useRef, useState } from "react";
import { linkBuscaGoogle, linkBuscaShein } from "@/lib/links";
import { gerarBuscasPorRegras } from "@/lib/termosRegras";
import { esquemaEntrada, type RespostaBusca } from "@/lib/tipos";
import { Carregando } from "./Carregando";
import { Formulario, VALORES_INICIAIS, paraEnvio, type ValoresFormulario } from "./Formulario";
import { Resultados } from "./Resultados";

type DadosEnvio = ReturnType<typeof paraEnvio>;

/** Se a API do app falhar, monta links de busca no próprio navegador. */
function respostaLocal(valores: DadosEnvio): RespostaBusca | null {
  const entrada = esquemaEntrada.safeParse(valores);
  if (!entrada.success) return null;
  return {
    buscas: gerarBuscasPorRegras(entrada.data).map((b) => ({
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

/** Palavras curtas que resumem o pedido, exibidas acima dos resultados. */
function resumir(v: DadosEnvio): string[] {
  const preco =
    v.precoMin && v.precoMax
      ? `R$ ${v.precoMin} a ${v.precoMax}`
      : v.precoMax
        ? `até R$ ${v.precoMax}`
        : v.precoMin
          ? `a partir de R$ ${v.precoMin}`
          : "";
  return [v.ocasiao, v.comprimento, ...v.cor.split(","), v.estilo, v.tecido, ...v.decoteManga.split(","), v.tamanho, preco]
    .map((t) => t.trim())
    .filter(Boolean);
}

export function Buscador() {
  const [valores, setValores] = useState<ValoresFormulario>(VALORES_INICIAIS);
  const [carregando, setCarregando] = useState(false);
  const [erros, setErros] = useState<string[]>([]);
  const [resposta, setResposta] = useState<RespostaBusca | null>(null);
  const [resumo, setResumo] = useState<string[]>([]);
  const areaResultados = useRef<HTMLDivElement>(null);
  const areaFormulario = useRef<HTMLDivElement>(null);

  const rolarPara = (el: HTMLElement | null) =>
    requestAnimationFrame(() => el?.scrollIntoView({ behavior: "smooth", block: "start" }));

  async function buscar() {
    const envio = paraEnvio(valores);
    const validacao = esquemaEntrada.safeParse(envio);
    if (!validacao.success) {
      setErros([...new Set(validacao.error.issues.map((i) => i.message))]);
      // leva a usuária direto ao campo que falta
      if (validacao.error.issues.some((i) => i.path[0] === "ocasiao")) {
        const campo = document.getElementById("ocasiao");
        campo?.scrollIntoView({ behavior: "smooth", block: "center" });
        campo?.focus({ preventScroll: true });
      }
      return;
    }
    setErros([]);
    setCarregando(true);
    setResposta(null);
    setResumo(resumir(envio));
    rolarPara(areaResultados.current);

    try {
      const r = await fetch("/api/buscar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(envio),
      });
      const dados = await r.json().catch(() => null);
      if (r.status === 400 || r.status === 429) {
        setErros(dados?.detalhes ?? [dados?.erro ?? "Não foi possível buscar agora."]);
        rolarPara(areaFormulario.current);
        return;
      }
      if (!r.ok || !dados?.buscas) throw new Error(`HTTP ${r.status}`);
      setResposta(dados as RespostaBusca);
    } catch {
      // a API caiu: ainda assim entregamos buscas prontas montadas aqui mesmo
      setResposta(respostaLocal(envio));
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="space-y-16">
      <div
        ref={areaFormulario}
        className="mx-auto max-w-2xl scroll-mt-6 rounded-[2.25rem] border border-linha bg-papel/85 p-6 shadow-suave backdrop-blur-sm sm:p-10"
      >
        <Formulario valores={valores} aoMudar={setValores} aoEnviar={buscar} carregando={carregando} erros={erros} />
      </div>

      <div ref={areaResultados} className="scroll-mt-6" aria-busy={carregando}>
        {carregando ? (
          <Carregando />
        ) : resposta ? (
          <Resultados resposta={resposta} resumo={resumo} aoEditar={() => rolarPara(areaFormulario.current)} />
        ) : null}
      </div>
    </div>
  );
}

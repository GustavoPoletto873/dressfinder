/**
 * Fila simples que limita quantas tarefas rodam ao mesmo tempo.
 * As demais esperam a vez na ordem de chegada.
 */
export class Fila {
  private ativas = 0;
  private aguardando: (() => void)[] = [];

  constructor(
    private readonly limite: number,
    private readonly tamanhoMaximoFila = 50,
  ) {}

  get emExecucao(): number {
    return this.ativas;
  }

  get naFila(): number {
    return this.aguardando.length;
  }

  async executar<T>(tarefa: () => Promise<T>): Promise<T> {
    if (this.ativas >= this.limite) {
      if (this.aguardando.length >= this.tamanhoMaximoFila) {
        throw new Error("Fila de buscas cheia");
      }
      // a vaga é repassada diretamente por quem terminar (ativas não muda)
      await new Promise<void>((liberar) => this.aguardando.push(liberar));
    } else {
      this.ativas += 1;
    }
    try {
      return await tarefa();
    } finally {
      const proxima = this.aguardando.shift();
      if (proxima) proxima();
      else this.ativas -= 1;
    }
  }
}

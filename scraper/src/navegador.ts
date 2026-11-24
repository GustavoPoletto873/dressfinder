/**
 * Mantém uma única instância do Chromium aberta para todo o serviço.
 * Se o navegador cair, a próxima busca abre um novo.
 */
import { chromium, type Browser } from "playwright";

let navegador: Browser | null = null;
let abrindo: Promise<Browser> | null = null;

export async function obterNavegador(): Promise<Browser> {
  if (navegador?.isConnected()) return navegador;
  if (!abrindo) {
    abrindo = chromium
      .launch({
        headless: true,
        // --disable-dev-shm-usage evita falhas por /dev/shm pequeno dentro de containers
        args: ["--disable-dev-shm-usage"],
      })
      .then((b) => {
        navegador = b;
        b.on("disconnected", () => {
          navegador = null;
        });
        return b;
      })
      .finally(() => {
        abrindo = null;
      });
  }
  return abrindo;
}

export function navegadorConectado(): boolean {
  return navegador?.isConnected() ?? false;
}

export async function fecharNavegador(): Promise<void> {
  if (navegador) await navegador.close().catch(() => undefined);
  navegador = null;
}

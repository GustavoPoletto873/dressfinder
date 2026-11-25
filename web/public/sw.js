/**
 * Service worker do Achei o Vestido.
 * Objetivo: o app instalado abrir mesmo sem internet (os favoritos ficam no
 * navegador, então aparecem). Busca nova continua precisando de internet.
 *
 * - Páginas: rede primeiro; sem internet, a última versão guardada.
 * - Arquivos de /_next/static (têm hash no nome, nunca mudam) e ícones: cache primeiro.
 * - API, fotos das lojas e outros domínios: não passam por aqui.
 */
const VERSAO = "v1";
const CACHE_PAGINAS = `paginas-${VERSAO}`;
const CACHE_ESTATICOS = `estaticos-${VERSAO}`;
const MAX_ESTATICOS = 150;

/** Guarda a página inicial e os arquivos que ela usa, para o primeiro uso sem internet já funcionar. */
async function guardarInicio() {
  const resposta = await fetch("/", { cache: "no-store" });
  if (!resposta.ok) return;
  const paginas = await caches.open(CACHE_PAGINAS);
  await paginas.put("/", resposta.clone());
  const html = await resposta.text();
  const arquivos = [...new Set(html.match(/\/_next\/static\/[^"'\s)\\]+/g) ?? [])];
  const estaticos = await caches.open(CACHE_ESTATICOS);
  await Promise.all(arquivos.map((a) => estaticos.add(a).catch(() => {})));
}

/** Não deixa o cache de arquivos crescer sem limite (cada deploy gera arquivos novos). */
async function aparar() {
  const cache = await caches.open(CACHE_ESTATICOS);
  const chaves = await cache.keys();
  await Promise.all(chaves.slice(0, Math.max(0, chaves.length - MAX_ESTATICOS)).map((c) => cache.delete(c)));
}

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    guardarInicio()
      .catch(() => {})
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n !== CACHE_PAGINAS && n !== CACHE_ESTATICOS).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (evento) => {
  const pedido = evento.request;
  if (pedido.method !== "GET") return;
  const url = new URL(pedido.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  if (pedido.mode === "navigate") {
    evento.respondWith(
      fetch(pedido)
        .then((resposta) => {
          if (resposta.ok) {
            const copia = resposta.clone();
            caches.open(CACHE_PAGINAS).then((c) => c.put(url.pathname, copia));
          }
          return resposta;
        })
        .catch(async () => (await caches.match(url.pathname, { ignoreSearch: true })) ?? (await caches.match("/")) ?? Response.error()),
    );
    return;
  }

  if (url.pathname.startsWith("/_next/static/") || /^\/icone-.*\.png$|^\/icon\.svg$|^\/apple-icon/.test(url.pathname)) {
    evento.respondWith(
      caches.match(pedido).then(
        (guardado) =>
          guardado ??
          fetch(pedido).then((resposta) => {
            if (resposta.ok) {
              const copia = resposta.clone();
              caches
                .open(CACHE_ESTATICOS)
                .then((c) => c.put(pedido, copia))
                .then(aparar);
            }
            return resposta;
          }),
      ),
    );
  }
});

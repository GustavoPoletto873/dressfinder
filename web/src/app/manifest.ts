import type { MetadataRoute } from "next";

/** Manifesto do app instalável (ícone na tela inicial, abre sem a barra do navegador). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Achei o Vestido",
    short_name: "Achei o Vestido",
    description: "Conte como você imagina o vestido ou a roupa e a gente encontra opções nas suas lojas favoritas.",
    lang: "pt-BR",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#fdf9f3",
    theme_color: "#fdf9f3",
    icons: [
      { src: "/icone-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icone-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icone-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    // tocar e segurar o ícone: atalho direto para o modo Roupas
    shortcuts: [{ name: "Achei a Roupa", short_name: "Roupas", url: "/?modo=roupas" }],
  };
}

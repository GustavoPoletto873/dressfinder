"use client";

import { useEffect } from "react";

/** Registra o service worker (public/sw.js) só em produção: o app instalado abre sem internet. */
export function RegistrarSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {
      // sem service worker o app funciona igual, só não abre offline
    });
  }, []);
  return null;
}

"use client";

/**
 * Escolhe as flores do modo atual para os componentes compartilhados.
 */
import type { ComponentType } from "react";
import { KIT_ROUPAS } from "../roupas/decoracao";
import { KIT_VESTIDOS } from "../vestidos/decoracao";
import { useModo } from "./modo";

export interface KitDecoracao {
  /** Ramo grande dos cantos da página. */
  RamoCanto: ComponentType<{ className?: string; atrasoBase?: number }>;
  /** Arranjo pequeno de separação (título, rodapé). */
  Enfeite: ComponentType<{ className?: string }>;
  /** Conteúdo do <svg viewBox="-100 -60 200 150"> da tela de carregamento. */
  ArranjoCarregando: ComponentType;
  /** Conteúdo do <svg viewBox="-50 -40 100 70"> dos favoritos vazios. */
  ArranjoVazio: ComponentType;
  /** Conteúdo do <svg viewBox="-30 -30 60 60"> de produto sem foto. */
  FlorSemFoto: ComponentType;
  /** Conteúdo do <svg viewBox="-12 -12 24 24"> do aviso dos resultados. */
  FlorAviso: ComponentType;
}

export function useKitDecoracao(): KitDecoracao {
  return useModo() === "roupas" ? KIT_ROUPAS : KIT_VESTIDOS;
}

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Data estipulada para o ENEM 2026 (Exemplo: 8 de Novembro de 2026)
export const ENEM_DATE = new Date("2026-11-08T00:00:00-03:00");

export function getDaysUntilEnem(): number {
  const now = new Date();
  const diffTime = ENEM_DATE.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * NAME FORMATTER SÊNIOR
 * Formata o nome para exibir apenas os dois primeiros termos.
 * Evita que o email apareça caso o nome esteja vazio.
 */
export function formatName(name: string | null | undefined, email?: string | null): string {
  if (!name || name.trim() === "" || name.includes("@")) {
    // Caso o nome seja email ou esteja vazio, tentamos tirar do início do email
    if (email) {
      const emailPrefix = email.split("@")[0];
      // Se o prefixo for longo, pegamos só parte dele, mas idealmente formatamos
      return emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1).toLowerCase();
    }
    return "Estudante";
  }

  const parts = name.trim().split(/\s+/);
  if (parts.length <= 2) return name;
  return `${parts[0]} ${parts[1]}`;
}

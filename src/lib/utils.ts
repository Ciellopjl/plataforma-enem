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

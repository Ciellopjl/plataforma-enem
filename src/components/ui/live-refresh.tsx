"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";

/**
 * COMPONENTE INVISÍVEL: Atualiza a página de servidor (RSC) silenciosamente a cada X segundos.
 * Usa useTransition para que a página não perca o estado do scroll ou pisque a tela inteira.
 * Cria o efeito de Tempo Real em páginas estáticas.
 */
export function LiveRefresh({ intervalMs = 5000 }: { intervalMs?: number }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const interval = setInterval(() => {
      startTransition(() => {
        router.refresh();
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [router, intervalMs]);

  return null;
}

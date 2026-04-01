"use client";

import { useEffect } from "react";
import { updateLastSeen } from "@/lib/logger";
import { useSession } from "next-auth/react";

/**
 * COMPONENTE INVISÍVEL: Mantém o status "Online" do aluno enquanto ele navega.
 * Atualiza o lastSeen no banco de dados a cada 10 segundos (Real-time Feel).
 */
export function Heartbeat() {
  const { data: session } = useSession();

  useEffect(() => {
    // SÊNIOR: Só pulsa se o usuário estiver logado
    if (!session?.user) return;

    // Pulsação imediata ao carregar
    updateLastSeen();

    // Ciclo de pulsação a cada 10 segundos
    const interval = setInterval(() => {
      updateLastSeen();
    }, 10000);

    return () => clearInterval(interval);
  }, [session]);

  return null; // Não renderiza nada visualmente
}

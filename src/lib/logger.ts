"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

/**
 * REGISTRADOR SÊNIOR: Grava uma atividade do usuário no banco de dados.
 * Pode ser invocado como Server Action (do client) ou direto no servidor.
 * 
 * @param action - Descrição curta da ação (ex: "Entrou na Plataforma")
 * @param details - Detalhes opcionais (ex: "Nota: 80")
 * @param explicitUserId - Passa o userId diretamente (use quando a sessão ainda não estiver disponível)
 */
export async function logActivity(action: string, details?: string, explicitUserId?: string) {
  try {
    let userId = explicitUserId;

    // Se não receber userId explícito, tenta pegar da sessão
    if (!userId) {
      const session = await auth();
      userId = (session?.user as any)?.id;
      
      // Não registrar atividades do próprio ADMIN para não poluir os logs
      if ((session?.user as any)?.role === "ADMIN") return;
    }

    if (!userId) return;

    await prisma.activityLog.create({
      data: {
        userId,
        action,
        details: details || null,
      },
    });
  } catch (error) {
    // Silencioso — logs nunca devem travar a experiência do usuário
    console.error("[ACTIVITY LOGGER ERROR]", error);
  }
}

/**
 * ATUALIZADOR DE PRESENÇA (Heartbeat): Atualiza o lastSeen do usuário.
 * Chamado como Server Action a cada 30s pelo componente Heartbeat.
 */
export async function updateLastSeen() {
  try {
    const session = await auth();
    const userId = (session?.user as any)?.id;
    if (!userId) return;

    await prisma.user.update({
      where: { id: userId },
      data: { lastSeen: new Date() },
    });
  } catch {
    // Silencioso em caso de erro de conexão
  }
}

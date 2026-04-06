"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * GALAXY BRAIN: Verificação de Segurança (Apenas ADMINS podem rodar estas ações)
 */
const SUPER_ADMIN_EMAIL = "ciellolisboa023@gmail.com";

async function ensureAdmin() {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") {
    throw new Error("Acesso negado: Somente administradores podem realizar esta ação.");
  }
  return session;
}

/**
 * Buscar logs de atividades recentes (Big Brother do Super Admin)
 */
export async function getLogs() {
  await ensureAdmin();
  return await (prisma as any).activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: {
        select: {
          name: true,
          email: true,
          image: true,
        }
      }
    }
  });
}

/**
 * Registrar uma nova ação no sistema de auditoria
 */
export async function createLog(action: string, details?: string) {
  const session = await auth();
  if (!session?.user?.id) return;

  await (prisma as any).activityLog.create({
    data: {
      userId: session.user.id,
      action,
      details
    }
  });
}

/**
 * Listar todos os usuários da plataforma
 */
export async function getUsers() {
  await ensureAdmin();
  return await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      isBlocked: true,
      lastSeen: true,
      createdAt: true,
    }
  }) as any[];
}

/**
 * Alternar status de bloqueio de um usuário
 */
export async function toggleUserBlock(userId: string) {
  const session = await ensureAdmin();
  const currentUserId = session?.user?.id;
  
  // SÊNIOR: Impede que o Super Admin se bloqueie por acidente
  if (currentUserId && userId === currentUserId) {
    throw new Error("Você não pode bloquear a si mesmo.");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isBlocked: true, email: true }
  }) as any;

  if (!user) throw new Error("Usuário não encontrado.");

  // SÊNIOR: SOBERANIA ABSOLUTA - O Super Admin é inalterável
  if (user.email === SUPER_ADMIN_EMAIL) {
    throw new Error("O Super Admin Supremo não pode ser bloqueado.");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isBlocked: !user.isBlocked }
  });

  revalidatePath("/admin");
}

/**
 * Alternar Role entre STUDENT e ADMIN
 */
export async function toggleUserRole(userId: string) {
  const session = await ensureAdmin();
  const currentUserId = session?.user?.id;
  
  // SÊNIOR: Impede que o Super Admin remova seu próprio acesso ADMIN
  if (currentUserId && userId === currentUserId) {
    throw new Error("Você não pode alterar o seu próprio cargo.");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, email: true }
  }) as any;

  if (!user) throw new Error("Usuário não encontrado.");

  // SÊNIOR: SOBERANIA ABSOLUTA - O Super Admin é inalterável
  if (user.email === SUPER_ADMIN_EMAIL) {
    throw new Error("O cargo do Super Admin Supremo não pode ser alterado por outros.");
  }

  const newRole = user.role === "ADMIN" ? "STUDENT" : "ADMIN";

  await prisma.user.update({
    where: { id: userId },
    data: { role: newRole }
  });

  revalidatePath("/admin");
}

/**
 * MODO DEUS: Alternar seu próprio cargo instantaneamente (Apenas para o dono do site)
 */
export async function toggleMyRole() {
  const session = await auth();
  const userId = session?.user?.id;
  const email = session?.user?.email;

  if (email !== SUPER_ADMIN_EMAIL) {
    throw new Error("Acesso negado: Somente o Administrador Supremo pode usar este comando.");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  }) as any;

  const newRole = user.role === "ADMIN" ? "STUDENT" : "ADMIN";

  await prisma.user.update({
    where: { id: userId },
    data: { role: newRole }
  });

  await createLog("God Mode", `Trocou seu próprio cargo para ${newRole}`);
  
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

/**
 * MODO EXTERMÍNIO: Apagar todos os alunos e seus dados progressivos
 * EXCLUSIVO: Apenas o Gmail do Desenvolvedor pode disparar estra ação.
 */
export async function wipeAllStudents() {
  const session = await auth();
  const email = session?.user?.email;

  if (email !== SUPER_ADMIN_EMAIL) {
    throw new Error("Ação Proibida: Somente o Desenvolvedor Original (Gmail) pode resetar os alunos.");
  }

  // SÊNIOR: Como o schema tem onDelete: Cascade nas relações User -> [Essay, Note, Progress, DailyChallenge, QuizAttempt]
  // Podemos apagar os Users com role STUDENT que o resto será limpo automaticamente.
  
  const deletedCount = await prisma.user.deleteMany({
    where: {
      role: "STUDENT"
    }
  });

  await createLog("DATABASE_WIPE", `Limpou todos os ${deletedCount.count} alunos da plataforma.`);
  
  revalidatePath("/admin");
  revalidatePath("/ranking");
  
  return { 
    success: true, 
    message: `${deletedCount.count} alunos e todos os seus registros foram removidos com sucesso.` 
  };
}

/**
 * EXCLUSÃO INDIVIDUAL: Apagar um usuário específico e seus dados (Cascade).
 * EXCLUSIVO: Apenas o Administrador Supremo (Gmail Original) pode deletar.
 */
export async function deleteUser(userId: string) {
  const session = await auth();
  const email = session?.user?.email;

  if (email !== SUPER_ADMIN_EMAIL) {
    throw new Error("Ação Proibida: Somente o Desenvolvedor Original pode excluir usuários individualmente.");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true }
  }) as any;

  if (!user) throw new Error("Usuário não encontrado.");

  if (user.email === SUPER_ADMIN_EMAIL) {
    throw new Error("Você não pode excluir o Super Admin Supremo.");
  }

  await prisma.user.delete({
    where: { id: userId }
  });

  await createLog("USER_DELETE", `Excluiu permanentemente o usuário ${user.name} (${user.email}).`);

  revalidatePath("/admin");
  
  return { 
    success: true, 
    message: `Usuário ${user.name || "Sem Nome"} removido com sucesso.` 
  };
}

/**
 * BUSCAR MENSAGENS DO TUTOR: Ver o que os alunos andam perguntando.
 * EXCLUSIVO: Apenas o Gmail do Desenvolvedor (God Mode).
 */
export async function getTutorMessages() {
  const session = await auth();
  const email = session?.user?.email;

  if (email !== SUPER_ADMIN_EMAIL) {
    throw new Error("Ação Proibida: Somente o Desenvolvedor Original (Gmail) pode ver as mensagens do tutor.");
  }

  return await (prisma as any).tutorMessage.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          image: true
        }
      }
    }
  });
}

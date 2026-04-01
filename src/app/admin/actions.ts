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
    take: 50, // Top 50 ações recentes
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

"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { createLog } from "../actions";

async function ensureAdmin() {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") {
    throw new Error("Acesso negado.");
  }
  return session;
}

// --- USER MANAGEMENT ---
export async function adjustUserPoints(userId: string, amount: number) {
  await ensureAdmin();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Usuário não encontrado.");

  const userUpdated = await prisma.user.update({
    where: { id: userId },
    data: {
      points: { increment: amount },
      totalPoints: { increment: amount }
    }
  });
  revalidatePath("/admin");
  return userUpdated;
}

// --- ESSAY REVIEWS ---
export async function addTeacherFeedback(essayId: string, feedback: string) {
  await ensureAdmin();
  const essay = await prisma.essay.update({
    where: { id: essayId },
    data: { teacherFeedback: feedback }
  });
  await createLog("Revisão de Redação", `Admin revisou redação ID: ${essayId}`);
  revalidatePath("/admin");
  return essay;
}

// --- GET ALL ESSAYS (FOR QUEUE) ---
export async function getEssaysQueue() {
  await ensureAdmin();
  return await prisma.essay.findMany({
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

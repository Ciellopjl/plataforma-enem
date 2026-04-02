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

// --- ADMIN CREATE ---
export async function createAnnouncement(data: { title: string; content: string; type: string; expiresAt?: Date }) {
  await ensureAdmin();
  const announcement = await prisma.announcement.create({
    data: {
      ...data,
      isActive: true
    }
  });
  await createLog("Criação de Aviso", `Admin criou aviso: ${data.title}`);
  revalidatePath("/admin");
  revalidatePath("/dashboard"); // For the student header
  return announcement;
}

// --- ADMIN DELETE ---
export async function deleteAnnouncement(id: string) {
  await ensureAdmin();
  await prisma.announcement.delete({ where: { id } });
  await createLog("Exclusão de Aviso", `Admin removeu o aviso ID: ${id}`);
  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

// --- ADMIN TOGGLE ---
export async function toggleAnnouncement(id: string) {
  await ensureAdmin();
  const announcement = await prisma.announcement.findUnique({ where: { id } });
  if (!announcement) throw new Error("Aviso não encontrado.");

  await prisma.announcement.update({
    where: { id },
    data: { isActive: !announcement.isActive }
  });
  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

// --- PUBLIC FETCH ---
export async function getActiveAnnouncements() {
  return await prisma.announcement.findMany({
    where: {
      isActive: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } }
      ]
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function getAllAnnouncements() {
  await ensureAdmin();
  return await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" }
  });
}

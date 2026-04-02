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

// --- FETCH ACTIONS ---
export async function getSubjects() {
  await ensureAdmin();
  return await prisma.subject.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          lessons: true,
          quizzes: true,
        }
      }
    }
  });
}

export async function getLessons() {
  await ensureAdmin();
  return await prisma.lesson.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      subject: {
        select: {
          name: true
        }
      }
    }
  });
}

export async function getQuizzes() {
  await ensureAdmin();
  return await prisma.quiz.findMany({
    // @ts-ignore - Prisma em sincronização pós-generate
    orderBy: { createdAt: "desc" },
    include: {
      subject: {
        select: {
          name: true
        }
      },
      _count: {
        select: {
          questions: true
        }
      }
    }
  });
}

export async function getResources() {
  await ensureAdmin();
  // @ts-ignore - Prisma em sincronização pós-generate
  return await prisma.resource.findMany({
    orderBy: { createdAt: "desc" }
  });
}

export async function deleteResource(id: string) {
  await ensureAdmin();
  // @ts-ignore - Prisma em sincronização
  await prisma.resource.delete({ where: { id } });
  revalidatePath("/admin");
}

// --- SUBJECTS ---
export async function createSubject(data: { name: string; slug: string; icon: string; color: string }) {
  await ensureAdmin();
  const subject = await prisma.subject.create({ data });
  await createLog("Criação de Matéria", `Nova matéria: ${data.name}`);
  revalidatePath("/admin");
  return subject;
}

export async function deleteSubject(id: string) {
  await ensureAdmin();
  await prisma.subject.delete({ where: { id } });
  revalidatePath("/admin");
}

// --- LESSONS ---
export async function createLesson(data: { title: string; content: string; videoUrl?: string; subjectId: string; order: number }) {
  await ensureAdmin();
  const lesson = await prisma.lesson.create({ data });
  await createLog("Criação de Aula", `Nova aula: ${data.title}`);
  revalidatePath("/admin");
  return lesson;
}

export async function deleteLesson(id: string) {
  await ensureAdmin();
  await prisma.lesson.delete({ where: { id } });
  revalidatePath("/admin");
}

// --- QUIZZES ---
export async function createQuiz(data: { title: string; description?: string; subjectId: string; isFinal?: boolean }) {
  await ensureAdmin();
  const quiz = await prisma.quiz.create({ data });
  await createLog("Criação de Quiz", `Novo quiz: ${data.title}`);
  revalidatePath("/admin");
  return quiz;
}

export async function deleteQuiz(id: string) {
  await ensureAdmin();
  await prisma.quiz.delete({ where: { id } });
  revalidatePath("/admin");
}

// --- QUESTIONS ---
export async function createQuestion(data: { text: string; quizId: string; options: { text: string; isCorrect: boolean }[] }) {
  await ensureAdmin();
  const question = await prisma.question.create({
    data: {
      text: data.text,
      quizId: data.quizId,
      options: {
        create: data.options
      }
    }
  });
  revalidatePath("/admin");
  return question;
}

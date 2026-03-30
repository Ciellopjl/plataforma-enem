"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Função God Mode: Marca TODO o conteúdo do sistema como 100% concluído para o Criador.
 */
export async function setAccountTo100Percent() {
  const session = await auth();
  const devEmail = process.env.DEV_EMAIL;

  if (!session?.user?.email || session.user.email !== devEmail) {
    throw new Error("Acesso negado: Apenas o Criador pode usar o God Mode.");
  }

  const userId = (session.user as any).id;

  try {
    // 1. Buscar todas as lições e conteúdos
    const lessons = await prisma.lesson.findMany({ select: { id: true } });
    const contents = await prisma.content.findMany({ select: { id: true } });

    // 2. Criar ou atualizar progresso para 100% (Lessons)
    await Promise.all(lessons.map(lesson => 
      prisma.progress.upsert({
        where: { userId_lessonId: { userId, lessonId: lesson.id } },
        update: { completed: true },
        create: { userId, lessonId: lesson.id, completed: true }
      })
    ));

    // 3. Criar ou atualizar progresso para 100% (Contents)
    await Promise.all(contents.map(content => 
      prisma.progress.upsert({
        where: { userId_contentId: { userId, contentId: content.id } },
        update: { completed: true },
        create: { userId, contentId: content.id, completed: true }
      })
    ));

    // 4. Se houver quizzes, marcar como concluído com score máximo (Sênior: Usando Upsert para Idempotência)
    const quizzes = await prisma.quiz.findMany({ 
        include: { questions: true } 
    });
    
    await Promise.all(quizzes.map(quiz => 
        prisma.quizAttempt.upsert({
            where: { userId_quizId: { userId, quizId: quiz.id } },
            update: { score: quiz.questions.length, completed: true },
            create: { userId, quizId: quiz.id, score: quiz.questions.length, completed: true }
        })
    ));

    revalidatePath("/dashboard");
    revalidatePath("/materias");
    return { success: true, message: "Restauração 100% concluída com sucesso! 🏆" };
  } catch (error: any) {
    console.error("Erro no God Mode:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Função God Mode: LIMPA todo o progresso do Criador (Reset Total).
 */
export async function resetAccountProgress() {
    const session = await auth();
    const devEmail = process.env.DEV_EMAIL;
    if (!session?.user?.email || session.user.email !== devEmail) throw new Error("Acesso negado.");
  
    const userId = (session.user as any).id;
  
    try {
      // 1. Deletar progresso (Aulas e Conteúdos)
      await prisma.progress.deleteMany({ where: { userId } });
      
      // 2. Deletar tentativas de quiz
      await prisma.quizAttempt.deleteMany({ where: { userId } });
      
      // 3. Resetar pontos e streak no modelo User
      await prisma.user.update({
        where: { id: userId },
        data: { points: 0, totalPoints: 0, streak: 0 }
      });
  
      revalidatePath("/dashboard");
      revalidatePath("/materias");
      revalidatePath("/ranking");
      return { success: true, message: "Progresso resetado com sucesso! Folha em branco. 🏳️" };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

/**
 * Função God Mode: Ajusta os pontos (XP) do Criador instantaneamente.
 */
export async function adjustUserPoints(amount: number) {
  const session = await auth();
  const devEmail = process.env.DEV_EMAIL;

  if (!session?.user?.email || session.user.email !== devEmail) {
    throw new Error("Acesso negado.");
  }

  const userId = (session.user as any).id;

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        points: { increment: amount },
        totalPoints: { increment: amount }
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/ranking");
    return { success: true, newPoints: user.points };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Função God Mode: Faz o reparo automático das trilhas, marcando a última prova de cada matéria como Prova Final.
 */
export async function repairQuizzes() {
  const session = await auth();
  const devEmail = process.env.DEV_EMAIL;
  if (!session?.user?.email || session.user.email !== devEmail) throw new Error("Acesso negado.");

  try {
    const subjects = await prisma.subject.findMany({
      include: { quizzes: true }
    });

    await Promise.all(subjects.map(subject => {
      if (subject.quizzes.length >= 2) {
        // Marcar o segundo quiz (ou o último) como Prova Final
        const lastQuiz = subject.quizzes[subject.quizzes.length - 1];
        return prisma.quiz.update({
          where: { id: lastQuiz.id },
          data: { isFinal: true }
        });
      }
      return Promise.resolve();
    }));

    revalidatePath("/materias");
    return { success: true, message: "Trilhas reparadas! Provas finais ativadas. 🎓" };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

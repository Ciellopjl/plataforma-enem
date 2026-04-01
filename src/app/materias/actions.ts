"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { askAI } from "@/lib/ai-service";
import { logActivity } from "@/lib/logger";

/**
 * Alterna o estado de conclusão de um conteúdo (Aula ou Material) para o usuário logado.
 */
export async function toggleProgress(id: string, type: "content" | "lesson", completed: boolean) {
  const session = await auth();
  if (!session?.user) throw new Error("Não autorizado");

  const userId = (session.user as any).id;
  const POINTS = type === "lesson" ? 15 : 10;

  try {
    if (completed) {
      await prisma.$transaction([
        prisma.progress.upsert({
          where: type === "content" 
            ? { userId_contentId: { userId, contentId: id } }
            : { userId_lessonId: { userId, lessonId: id } },
          update: { completed: true },
          create: {
            completed: true,
            user: { connect: { id: userId } },
            ...(type === "content" ? { content: { connect: { id: id } } } : { lesson: { connect: { id: id } } })
          }
        }),
        prisma.user.update({
          where: { id: userId },
          data: { 
            points: { increment: POINTS },
            totalPoints: { increment: POINTS }
          }
        })
      ]);

      // MONITORAMENTO SÊNIOR: Log de Tarefa Acadêmica
      try {
        let taskName = "";
        let subjectName = "";
        if (type === "lesson") {
          const l = await prisma.lesson.findUnique({ where: { id }, include: { subject: true } });
          if (l) { taskName = l.title; subjectName = l.subject.name; }
        } else {
          const c = await prisma.content.findUnique({ where: { id }, include: { subject: true } });
          if (c) { taskName = c.title; subjectName = c.subject.name; }
        }
        if (taskName) {
           await logActivity(
             `📚 Concluiu ${type === "lesson" ? "Aula" : "Material"}`, 
             `${subjectName} | ${taskName} (+${POINTS} Pts)`
           );
        }
      } catch (err) { /* Erro silencioso se falhar o log */ }

    } else {
      await prisma.$transaction([
        prisma.progress.update({
          where: type === "content" 
            ? { userId_contentId: { userId, contentId: id } }
            : { userId_lessonId: { userId, lessonId: id } },
          data: { completed: false }
        }),
        prisma.user.update({
          where: { id: userId },
          data: { 
            points: { decrement: POINTS },
            totalPoints: { decrement: POINTS }
          }
        })
      ]);
    }

    revalidatePath("/dashboard");
    revalidatePath("/materias");
    revalidatePath(`/materias/[slug]`, "page");
    
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar progresso:", error);
    return { success: false };
  }
}

export async function submitQuizResult(quizId: string, score: number) {
  const session = await auth();
  if (!session?.user) throw new Error("Não autorizado");

  const userId = (session.user as any).id;

  try {
    const existingAttempt = await prisma.quizAttempt.findFirst({
      where: { userId, quizId }
    });

    if (existingAttempt) {
      // Já fez o quiz. Vamos apenas atualizar o score se for maior, mas sem dar mais pontos infinitos
      if (score > existingAttempt.score) {
        await prisma.quizAttempt.update({
          where: { id: existingAttempt.id },
          data: { score }
        });
      }
      return { success: true, message: "Resultado atualizado." };
    }

    await prisma.$transaction([
      prisma.quizAttempt.create({
        data: {
          user: { connect: { id: userId } },
          quiz: { connect: { id: quizId } },
          score,
          completed: true
        }
      }),
      prisma.user.update({
        where: { id: userId },
        data: { 
          points: { increment: score * 5 },
          totalPoints: { increment: score * 5 }
        }
      })
    ]);

    // MONITORAMENTO SÊNIOR: Log de Quiz com detalhes
    await logActivity(`📚 Concluiu Quiz`, `${score} questão(ões) corretas | +${score * 5} pts`);

    revalidatePath("/dashboard");
    revalidatePath("/ranking");
    
    return { success: true };
  } catch (error) {
    console.error("Erro ao salvar quiz:", error);
    return { success: false };
  }
}

/**
 * Salva o resultado de um Quiz DEFINITIVO com Redação e atribui até 500 pontos.
 */
export async function submitFinalExam(quizId: string, mcqScore: number, essayText: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Não autorizado");

  const userId = (session.user as any).id;

  try {
    const quiz = await prisma.quiz.findUnique({ where: { id: quizId }});
    if (!quiz) throw new Error("Prova não encontrada");

    // Llama 70B de Elite avaliando a Redação
    const prompt = `Avalie a seguinte redação com o tema: "${quiz.essayPrompt || 'Tema Livre'}".\n\nTexto do aluno:\n"${essayText}"\n\nRetorne um JSON OBRIGATÓRIO (sem markdown ou conversas adicioais) no formato EXATO:\n{\n  "score": [número inteiro de 0 a 250],\n  "feedback": "[feedback profissional de 2-3 frases focado no ENEM]",\n  "c1": [0 a 50],\n  "c2": [0 a 50],\n  "c3": [0 a 50],\n  "c4": [0 a 50],\n  "c5": [0 a 50]\n}`;
    
    console.log("Invocando Analisador Sênior (Llama 70B) para a Redação Final...");
    const aiResponse = await askAI(prompt, "Você é um avaliador rigoroso da banca do ENEM. Retorne EXCLUSIVAMENTE o JSON estruturado solicitado. Não forneça mais nada além do JSON.", "redacao"); 

    let graded = { score: 100, feedback: "Avaliador indisponível. Nota padrão base.", c1: 20, c2: 20, c3: 20, c4: 20, c5: 20 };
    try {
      let rawJson = aiResponse.text.replace(/```json/g, "").replace(/```/g, "").trim();
      const stIdx = rawJson.indexOf('{');
      const endIdx = rawJson.lastIndexOf('}');
      if (stIdx !== -1 && endIdx !== -1) {
        rawJson = rawJson.substring(stIdx, endIdx + 1);
        graded = JSON.parse(rawJson);
      }
    } catch (e) {
      console.error("Erro ao parsear nota de Redação:", e);
    }

    // MCQ Score (Max 20 questões) -> 12.5 pts cada = 250 pontos max
    const objectivePoints = mcqScore * 12.5;
    const finalTotalPoints = Math.round(objectivePoints + (graded.score || 0));

    const existingAttempt = await prisma.quizAttempt.findFirst({
      where: { userId, quizId }
    });

    if (existingAttempt) {
      return { success: false, error: "Este exame já foi corrigido e faturado na sua conta. Tente recarregar a página." };
    }

    await prisma.$transaction([
      prisma.quizAttempt.create({
        data: {
          user: { connect: { id: userId } },
          quiz: { connect: { id: quizId } },
          score: mcqScore,
          completed: true
        }
      }),
      prisma.essay.create({
        data: {
          userId,
          title: "Redação de Certificação: " + (quiz.title || "Exame"),
          content: essayText,
          score: graded.score,
          feedback: graded.feedback,
          c1: graded.c1, c2: graded.c2, c3: graded.c3, c4: graded.c4, c5: graded.c5,
          aiProbability: 0,
          aiReason: "Autenticado via AI Tutor Final Exam",
        }
      }),
      prisma.user.update({
        where: { id: userId },
        data: { 
          points: { increment: finalTotalPoints },
          totalPoints: { increment: finalTotalPoints }
        }
      })
    ]);

    // MONITORAMENTO SÊNIOR: Log de Exame Final 🕵️‍♂️📈🚀
    await logActivity("Concluiu Exame Final", `Pontuação Total: ${finalTotalPoints}`);

    revalidatePath("/dashboard");
    revalidatePath("/ranking");
    revalidatePath("/materias/[slug]", "page");

    return { success: true, aiFeedback: graded, totalPointsEarned: finalTotalPoints };
  } catch (err: any) {
    console.error("Erro na submitFinalExam:", err);
    return { success: false, error: err.message };
  }
}

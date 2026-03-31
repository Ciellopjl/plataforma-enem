"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getQuizModel } from "@/lib/ai-service";
import { generateText } from "ai";

export async function submitDailyChallenge(
  challengeId: string, 
  userAnswers: Record<string, string>
) {
  const session = await auth();
  if (!session?.user) throw new Error("Não autorizado");
  
  const userId = (session.user as any).id;

  // 1. Validar se o desafio existe, pertence ao usuário e ainda não foi concluído
  const challenge = await prisma.dailyChallenge.findUnique({
    where: { id: challengeId },
    include: {
      quiz: { include: { questions: true } }
    }
  });

  if (!challenge) throw new Error("Desafio não encontrado");
  if (challenge.userId !== userId) throw new Error("Acesso negado");
  if (challenge.completed) throw new Error("Desafio já foi finalizado");

  // 2. Corrigir as questões e montar os dados de revisão
  let score = 0;
  let correctCount = 0;
  const reviewData: { questionId: string; userOptionId: string; correct: boolean; correctOptionId: string }[] = [];
  
  for (const question of challenge.quiz.questions) {
    const userAnswerOptionId = userAnswers[question.id];
    const isCorrect = userAnswerOptionId === question.correctOptionId;
    
    if (isCorrect) {
      correctCount++;
      score += 20;
    }

    reviewData.push({
      questionId: question.id,
      userOptionId: userAnswerOptionId || "",
      correct: isCorrect,
      correctOptionId: question.correctOptionId || "",
    });
  }

  // 3. Atualizar o desafio como 'Concluído' e registrar a nota
  await prisma.dailyChallenge.update({
    where: { id: challengeId },
    data: {
      completed: true,
      score: score,
      responses: userAnswers
    }
  });

  // 4. Calcular streak e atualizar pontos
  const userNow = await prisma.user.findUnique({ where: { id: userId } });
  const lastDate = userNow?.lastChallengeDate;
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1); yesterday.setHours(0,0,0,0);
  const todayStart = new Date(); todayStart.setHours(0,0,0,0);
  
  // Streak: se fez ontem → continua; se não fez → zera para 1
  const newStreak = lastDate && lastDate >= yesterday && lastDate < todayStart
    ? (userNow?.streak || 0) + 1
    : 1;

  await prisma.user.update({
    where: { id: userId },
    data: {
      points: { increment: score },
      totalPoints: { increment: score },
      streak: newStreak,
      lastChallengeDate: new Date(),
    },
  });

  let newBadges: any[] = [];
  try {
    // 5. Verificar badges conquistadas
    const allChallenges = await prisma.dailyChallenge.findMany({
      where: { userId, completed: true }
    });
    const perfectCount = allChallenges.filter(c => c.score === 100).length;
    const totalCorrectAll = allChallenges.reduce((acc, c) => acc + Math.round((c.score || 0) / 20), 0);
    const updatedUser = await prisma.user.findUnique({ where: { id: userId } });

    const { checkAndAwardBadges } = await import("@/lib/badges");
    newBadges = await checkAndAwardBadges(userId, {
      totalPoints: updatedUser?.totalPoints || 0,
      streak: newStreak,
      totalChallenges: allChallenges.length,
      perfectScores: perfectCount,
      totalCorrect: totalCorrectAll,
    });

    revalidatePath("/dashboard");
    revalidatePath("/analise");
    revalidatePath("/ranking");
    revalidatePath("/conquistas");
  } catch (badgeError) {
    console.error("[ACTIONS] ⚠️ Erro não crítico ao processar medalhas/cache:", badgeError);
    // Não lançamos erro aqui para não travar a experiência do aluno
  }

  return { 
    success: true, 
    score, 
    correctCount, 
    total: challenge.quiz.questions.length, 
    reviewData, 
    newBadges, 
    streak: newStreak 
  };
}

export async function explainQuestion(questionText: string, options: string[], correctOptionText: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Não autorizado");

  const systemPrompt = `Você é um professor tutor do ENEM de alto desempenho. 
Sua missão é explicar questões de forma didática, curta e direta.

ESTRUTURA DA RESPOSTA (Obrigatório):
1. ✅ POR QUE ESTÁ CERTA: (1-2 linhas explicando o conceito central).
2. ❌ POR QUE AS OUTRAS ESTÃO ERRADAS: (1 linha agrupando os erros das distrações).
3. 💡 DICA DE MESTRE: (Uma dica "pulo do gato" para o ENEM).`;

  const prompt = `Questão: ${questionText}
Alternativas: ${options.join(" | ")}
Resposta correta: ${correctOptionText}`;

  try {
    const { askAI } = await import("@/lib/ai-service");
    const { text: responseText } = await askAI(
      prompt,
      systemPrompt,
      "quiz"
    );

    return { explanation: responseText };
  } catch (err: any) {
    console.error("Erro na explicação Groq:", err);
    return { 
      explanation: `**Conceito Principal:** Esta questão aborda o tema central de forma analítica.\n\n**Resposta Correta:** ${correctOptionText}\n\n**Dica ENEM:** No ENEM, questões deste tipo geralmente exigem interpretação contextualizada. Leia o texto-base com atenção antes de analisar as alternativas.\n\n*(Explicação simplificada — IA em manutenção)*` 
    };
  }
}

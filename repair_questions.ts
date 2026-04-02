
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function repair() {
  console.log('🚀 Iniciando reparo de questões e desafios...');

  // 1. Corrigir Question.correctOptionId baseado em Option.isCorrect
  const questions = await prisma.question.findMany({
    where: { correctOptionId: null },
    include: { options: true }
  });

  console.log(`🔍 Encontradas ${questions.length} questões sem correctOptionId.`);

  for (const q of questions) {
    const correctOption = q.options.find(o => o.isCorrect);
    if (correctOption) {
      await prisma.question.update({
        where: { id: q.id },
        data: { correctOptionId: correctOption.id }
      });
      // console.log(`✅ Questão ${q.id} atualizada com correctOptionId: ${correctOption.id}`);
    } else {
      console.warn(`⚠️ Questão ${q.id} não possui nenhuma opção marcada como isCorrect!`);
      // Se não tem nenhuma marcada, marcamos a primeira como fallback para não quebrar o fluxo
      if (q.options.length > 0) {
        await prisma.question.update({
          where: { id: q.id },
          data: { correctOptionId: q.options[0].id }
        });
      }
    }
  }

  // 2. Re-avaliar DailyChallenges que estão com score 0 e foram concluídos
  // Apenas para o usuário atual ou todos? Vamos fazer para todos que estão com 0.
  const challengesToFix = await prisma.dailyChallenge.findMany({
    where: { 
      completed: true,
      score: 0
    },
    include: {
      quiz: {
        include: {
          questions: true
        }
      }
    }
  });

  console.log(`\n🔍 Encontrados ${challengesToFix.length} desafios concluídos com score 0 para re-avaliação.`);

  for (const challenge of challengesToFix) {
    let newScore = 0;
    let correctCount = 0;
    const responses = challenge.responses as Record<string, string> || {};

    for (const question of challenge.quiz.questions) {
      const userAnswerId = responses[question.id];
      if (userAnswerId && userAnswerId === question.correctOptionId) {
        newScore += 20;
        correctCount++;
      }
    }

    if (newScore > 0) {
      await prisma.dailyChallenge.update({
        where: { id: challenge.id },
        data: { score: newScore }
      });
      console.log(`✅ Desafio ${challenge.id} re-avaliado: Novo score ${newScore} (${correctCount} acertos).`);
      
      // Opcional: Atualizar pontos do usuário? 
      // Como é um reparo, vamos incrementar os pontos faltantes.
      await prisma.user.update({
        where: { id: challenge.userId },
        data: {
          points: { increment: newScore },
          totalPoints: { increment: newScore }
        }
      });
    } else {
      console.log(`ℹ️ Desafio ${challenge.id} analisado, mas o score continua 0 (respostas erradas ou não respondidas).`);
    }
  }

  console.log('\n✨ Reparo concluído!');
}

repair()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());

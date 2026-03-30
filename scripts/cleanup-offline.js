const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function cleanup() {
  console.log("🧹 Iniciando limpeza de desafios offline (com cascata)...");
  
  try {
    const offlineQuizzes = await prisma.quiz.findMany({
      where: {
        OR: [
          { title: { contains: "(Offline)" } },
          { description: { contains: "IA temporariamente indisponível" } },
          { description: { contains: "Modo Contingência" } }
        ]
      }
    });

    console.log(`🔍 Encontrados ${offlineQuizzes.length} desafios corrompidos/offline.`);

    for (const quiz of offlineQuizzes) {
      console.log(`🗑️ Deletando Quiz: ${quiz.title} (${quiz.id})`);
      
      // 1. Deletar DailyChallenges
      await prisma.dailyChallenge.deleteMany({ where: { quizId: quiz.id } });
      
      // 2. Encontrar as questões deste quiz para deletar as opções primeiro
      const questions = await prisma.question.findMany({ where: { quizId: quiz.id } });
      const questionIds = questions.map(q => q.id);
      
      // 3. Deletar Opções
      await prisma.option.deleteMany({ where: { questionId: { in: questionIds } } });
      
      // 4. Deletar Questões
      await prisma.question.deleteMany({ where: { quizId: quiz.id } });
      
      // 5. Deletar o Quiz
      await prisma.quiz.delete({ where: { id: quiz.id } });
    }

    console.log("✅ Limpeza concluída!");
  } catch (err) {
    console.error("❌ Erro durante a limpeza:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();

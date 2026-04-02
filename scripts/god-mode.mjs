import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

// Carregamento manual do .env para garantir que o script funcione fora do Next.js
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  const envFile = fs.readFileSync(envPath, "utf8");
  envFile.split("\n").forEach(line => {
    const [key, ...values] = line.split("=");
    if (key && values.length > 0 && !key.startsWith("#")) {
      process.env[key.trim()] = values.join("=").trim().replace(/^"|"$/g, '');
    }
  });
}
loadEnv();

const prisma = new PrismaClient();

const BADGE_IDS = [
  "first_challenge", "streak_3", "streak_7", "streak_30", 
  "points_100", "points_500", "points_1000", 
  "perfect_score", "perfect_score_3", 
  "challenges_10", "challenges_30", "correct_50"
];

async function main() {
  const email = "ciellolisboa023@gmail.com";
  console.log(`🚀 Iniciando Operação God Mode v2 para: ${email}`);

  let user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    console.warn("⚠️ Usuário não encontrado no banco de dados. Criando perfil...");
    user = await prisma.user.create({
        data: {
            email,
            name: "Mestre ENEM",
            role: "ADMIN"
        }
    });
  }

  const userId = user.id;

  // 1. Buscar toda a estrutura da plataforma
  const [subjects, lessons, contents] = await Promise.all([
    prisma.subject.findMany({
      include: {
        quizzes: {
          include: { _count: { select: { questions: true } } }
        }
      }
    }),
    prisma.lesson.findMany({ select: { id: true } }),
    prisma.content.findMany({ select: { id: true } })
  ]);

  console.log(`📚 Estrutura: ${subjects.length} matérias, ${lessons.length} aulas, ${contents.length} materiais.`);

  // 2. Marcar 100% de Progresso (Aulas e Materiais)
  console.log("⚡ Sincronizando progresso de conteúdos (100%)...");
  
  for (const lesson of lessons) {
    await prisma.progress.upsert({
      where: { userId_lessonId: { userId, lessonId: lesson.id } },
      update: { completed: true },
      create: { userId, lessonId: lesson.id, completed: true }
    });
  }

  for (const content of contents) {
    await prisma.progress.upsert({
      where: { userId_contentId: { userId, contentId: content.id } },
      update: { completed: true },
      create: { userId, contentId: content.id, completed: true }
    });
  }

  // 3. Simular 100% de Aproveitamento nos Quizzes (Milestones das Matérias)
  console.log("📝 Gerando aprovação total em todos os simulados...");
  for (const subject of subjects) {
    for (const quiz of subject.quizzes) {
      await prisma.quizAttempt.upsert({
        where: { userId_quizId: { userId, quizId: quiz.id } },
        update: {
          score: quiz._count.questions,
          completed: true,
          createdAt: new Date()
        },
        create: {
          userId,
          quizId: quiz.id,
          score: quiz._count.questions,
          completed: true
        }
      });
    }
  }

  // 4. Desbloquear todas as Conquistas (Badges)
  console.log("🏆 Desbloqueando todas as conquistas...");
  await prisma.userBadge.createMany({
    data: BADGE_IDS.map(badgeId => ({ userId, badgeId })),
    skipDuplicates: true
  });

  // 5. Update de Stats Máximas e Admin
  console.log("👑 Elevando status do usuário e ativando Admin...");
  await prisma.user.update({
    where: { id: userId },
    data: {
      points: 9999,
      totalPoints: 9999,
      streak: 500,
      role: "ADMIN"
    }
  });

  console.log("✅ OPERAÇÃO CONCLUÍDA! 100% REAL EM TODO O SITE PARA " + email);
}

main()
  .catch(e => {
    console.error("❌ Erro na operação:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

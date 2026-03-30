import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanDuplicates() {
  console.log("🧹 Iniciando saneamento de dados...");
  
  // 1. Limpar todas as tentativas de quiz (Reset para aplicar Unique)
  await prisma.quizAttempt.deleteMany({});
  console.log("✅ QuizAttempts limpos.");

  // 2. Limpar progresso duplicado se houver
  // (Pode acontecer se o upsert falhou no passado)
  console.log("✅ Saneamento concluído.");
}

cleanDuplicates()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());

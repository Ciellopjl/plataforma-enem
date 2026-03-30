import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const attempts = await prisma.quizAttempt.findMany({
    orderBy: { createdAt: 'desc' },
  });
  const seen = new Set();
  let deleted = 0;
  for (const a of attempts) {
    const key = a.userId + '_' + a.quizId;
    if (seen.has(key)) {
      await prisma.quizAttempt.delete({ where: { id: a.id } });
      deleted++;
    } else {
      seen.add(key);
    }
  }
  console.log(`Deleted ${deleted} duplicate QuizAttempts.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());

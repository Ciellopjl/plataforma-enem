import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const SUPER_ADMIN = "ciellolisboa023@gmail.com";

async function main() {
  console.log(`Buscando contas indesejadas (Tudo menos ${SUPER_ADMIN})...`);

  const usersToDelete = await prisma.user.findMany({
    where: { NOT: { email: SUPER_ADMIN } }
  });

  const userIds = usersToDelete.map(u => u.id);

  if (userIds.length === 0) {
    console.log("Nenhum usuário encontrado para deletar além de você.");
    return;
  }

  console.log(`Encontrados ${userIds.length} usuários. Exterminando rastro (Logs, Progresso e Quizzes)...`);

  // Deletar as relações (garantindo que não dê erro de foreign key)
  await prisma.progress.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.quizAttempt.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.dailyChallenge.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.activityLog.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.account.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.session.deleteMany({ where: { userId: { in: userIds } } });

  // Deletar os usuários em si
  const result = await prisma.user.deleteMany({
    where: { NOT: { email: SUPER_ADMIN } }
  });

  console.log(`[SUCESSO] Deletados ${result.count} usuários intrusos. Sua conta foi blindada e mantida com sucesso!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

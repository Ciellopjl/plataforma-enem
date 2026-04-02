import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function finalPurge() {
  const me = "ciellolisboa023@gmail.com";
  const others = await prisma.user.findMany({
    where: { email: { not: me } }
  });

  console.log(`🔍 Encontrei ${others.length} outros usuários.`);

  for (const other of others) {
    console.log(`💀 Deletando ${other.email}...`);
    // Limpar dependências manualmente se necessário, mas delete solitário deve funcionar se FKs permitirem
    try {
      await prisma.user.delete({ where: { id: other.id } });
    } catch (e) {
      // Se falhar por FK, forçar limpeza de dependências
      await prisma.progress.deleteMany({ where: { userId: other.id } });
      await prisma.quizAttempt.deleteMany({ where: { userId: other.id } });
      await prisma.user.delete({ where: { id: other.id } });
    }
  }

  console.log("✅ PURGA FINAL CONCLUÍDA.");
}

finalPurge().catch(console.error).finally(() => prisma.$disconnect());

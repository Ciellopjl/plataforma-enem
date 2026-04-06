import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function purgeAllExceptMe() {
  const me = "ciellolisboa023@gmail.com";
  console.log(`🚀 INICIANDO LIMPEZA TOTAL DA BASE - MANTENDO APENAS ${me}`);

  // 1. Encontrar o ID do mestre
  const master = await prisma.user.findUnique({
    where: { email: me },
    select: { id: true }
  });

  if (!master) {
    console.log("❌ Erro: Usuário mestre não encontrado! Abortando para evitar wipe total.");
    return;
  }

  // 2. Limpar todas as tabelas dependentes (que não têm Cascade Delete em tudo)
  console.log("🧹 Limpando dados órfãos e dependências...");
  
  await Promise.all([
    prisma.progress.deleteMany({ where: { userId: { not: master.id } } }),
    prisma.quizAttempt.deleteMany({ where: { userId: { not: master.id } } }),
    prisma.essay.deleteMany({ where: { userId: { not: master.id } } }),
    prisma.userBadge.deleteMany({ where: { userId: { not: master.id } } }),
    prisma.activityLog.deleteMany({ where: { userId: { not: master.id } } }),
    prisma.account.deleteMany({ where: { userId: { not: master.id } } }),
    prisma.session.deleteMany({ where: { userId: { not: master.id } } }),
  ]);

  // 3. O Golpe Final: Deletar todos os outros usuários
  const deleted = await prisma.user.deleteMany({
    where: {
      id: { not: master.id }
    }
  });

  console.log(`✅ ${deleted.count} usuários foram eliminados.`);
  console.log("✅ AGORA SÓ EXISTE VOCÊ NESTA PLATAFORMA.");
}

purgeAllExceptMe().catch(console.error).finally(() => prisma.$disconnect());

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanup() {
  const bots = [
    "1lugar_mestre@test.com",
    "2lugar_mestre@test.com",
    "3lugar_mestre@test.com"
  ];

  console.log("🧹 REMOVENDO BOTS DE TESTE...");
  
  const deleted = await prisma.user.deleteMany({
    where: {
      email: { in: bots }
    }
  });

  console.log(`✅ ${deleted.count} bots removidos com sucesso.`);

  // Garantir que o Ciel seja ADMIN absoluto
  const ciel = await prisma.user.update({
    where: { email: "ciellolisboa023@gmail.com" },
    data: { role: "ADMIN" }
  });

  console.log(`✅ ${ciel.name} agora é um ADMINISTRADOR real no banco.`);
}

cleanup().catch(console.error).finally(() => prisma.$disconnect());

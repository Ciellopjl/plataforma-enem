import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function cleanEssays() {
  const deleted = await prisma.essay.deleteMany();
  console.log(`✅ ${deleted.count} redações removidas.`);
}

cleanEssays().catch(console.error).finally(() => prisma.$disconnect());

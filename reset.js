const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function reset() {
  await prisma.dailyChallenge.deleteMany({});
  console.log("Todos os desafios diários foram apagados. O usuário pode fazer de novo!");
}

reset().finally(() => prisma.$disconnect());

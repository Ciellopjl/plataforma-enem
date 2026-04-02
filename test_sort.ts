import "dotenv/config";
import { prisma } from "./src/lib/prisma";

async function check() {
  console.log("Checking DB with orderBy: { createdAt: 'desc' }...");
  const q = await prisma.quiz.findMany({
    orderBy: { createdAt: "desc" },
    take: 1
  });
  console.log("Quiz found:", q.length);
}

check().catch(err => {
  console.error("PRISMA ERRO NO SCRIPT:", err);
  process.exit(1);
}).finally(() => process.exit(0));

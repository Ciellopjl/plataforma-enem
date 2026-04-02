import "dotenv/config";
import { prisma } from "./src/lib/prisma";

async function check() {
  console.log("Checking DB using APP's prisma singleton...");
  const s = await prisma.subject.findMany({
    include: {
      _count: {
        select: {
          lessons: true,
          quizzes: true,
        }
      }
    }
  });
  console.log("Subjects found:", JSON.stringify(s, null, 2));
}

check().catch(console.error).finally(() => process.exit(0));

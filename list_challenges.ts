
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const challenges = await prisma.dailyChallenge.findMany({
    include: {
      quiz: {
        include: {
          questions: true
        }
      }
    }
  });

  console.log(`Encontrados ${challenges.length} desafios no total.`);
  challenges.forEach(c => {
    console.log(`- ID: ${c.id}, Tema: ${c.quiz.title}, Score: ${c.score}, Concluído: ${c.completed}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());

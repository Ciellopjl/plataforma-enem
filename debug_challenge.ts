
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const challengeId = 'cmnh5cn8s0010ch3ejc82zn94';
  const challenge = await prisma.dailyChallenge.findUnique({
    where: { id: challengeId },
    include: {
      quiz: {
        include: {
          questions: {
            include: {
              options: true
            }
          }
        }
      }
    }
  });

  if (!challenge) {
    console.log('Challenge not found');
    return;
  }

  console.log('Challenge Stats:');
  console.log('Score:', challenge.score);
  console.log('Responses:', JSON.stringify(challenge.responses, null, 2));

  console.log('\nQuestions Detail:');
  challenge.quiz.questions.forEach((q, i) => {
    console.log(`Q${i+1}: ${q.text}`);
    console.log(`  Correct Option ID: ${(q as any).correctOptionId}`);
    console.log('  Options:');
    q.options.forEach(o => {
      console.log(`    - [${o.id}] ${o.text}`);
    });
    const userResp = (challenge.responses as any)?.[q.id];
    console.log(`  User Response ID: ${userResp}`);
    console.log(`  Is Correct? ${userResp === (q as any).correctOptionId}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());

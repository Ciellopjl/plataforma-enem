import { PrismaClient } from '@prisma/client'
import { generateDailyChallenge } from './src/lib/gemini.js'

const prisma = new PrismaClient()

async function main() {
  console.log("Procurando o Quiz Pocket Matemática e a Challenge associada...");
  const fakeQuestion = await prisma.question.findFirst({
    where: { text: { contains: "Pergunta de teste" } },
    include: { quiz: true }
  });

  if (!fakeQuestion) {
    console.log("Não achei a Pergunta de Teste. Talvez já tenha sido resolvida.");
    return;
  }

  const quizId = fakeQuestion.quizId;
  const quiz = fakeQuestion.quiz;
  console.log(`Encontrei o Quiz ID: ${quizId} - Título: ${quiz.title}`);

  // Deletar opções e perguntas antigas
  console.log("Limpando perguntas antigas...");
  const questionsToDel = await prisma.question.findMany({ where: { quizId } });
  for (const q of questionsToDel) {
    await prisma.option.deleteMany({ where: { questionId: q.id } });
    await prisma.question.delete({ where: { id: q.id } });
  }

  // Gerar novas perguntas
  console.log("Gerando 5 novas perguntas via IA...");
  const aiData = await generateDailyChallenge("Matemática", 5, "medio");
  
  console.log("Salvando novas perguntas no banco...");
  for (const q of aiData.questions) {
     const createdQuestion = await prisma.question.create({
       data: {
         text: q.text,
         quizId: quizId,
         options: {
           create: q.options.map((optText: string) => ({ text: optText }))
         }
       },
       include: { options: true }
     });
     
     const correctOptIndex = q.correctOptionIndex ?? 0;
     const correctDbOption = createdQuestion.options[correctOptIndex];
     
     await prisma.question.update({
       where: { id: createdQuestion.id },
       data: { correctOptionId: correctDbOption?.id } as any
     });
  }

  console.log("✅ Quiz atualizado com 5 perguntas reais da matéria!");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())

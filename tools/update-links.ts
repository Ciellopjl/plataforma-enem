import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("Atualizando URLs dos vídeos de Linguagens...");

  const linguagens = await prisma.subject.findUnique({ 
    where: { slug: "linguagens" },
    include: { lessons: { orderBy: { order: "asc" } } }
  });

  if (!linguagens) {
    console.error("Matéria 'Linguagens' não encontrada no banco!");
    return;
  }

  const newUrls = [
    "https://www.youtube.com/watch?v=f5Sk0KmaehQ", // Interpretação de Textos Verbais e Não Verbais
    "https://www.youtube.com/watch?v=aqSJLQ7sANA", // Funções da Linguagem
    "https://www.youtube.com/watch?v=3xUjHZO0yXw", // Vanguardas Europeias
    "https://www.youtube.com/watch?v=iJ3yzYMwpPg"  // Figuras de Linguagem
  ];

  for (let i = 0; i < linguagens.lessons.length; i++) {
    const lesson = linguagens.lessons[i];
    if (newUrls[i]) {
      await prisma.lesson.update({
        where: { id: lesson.id },
        data: { videoUrl: newUrls[i] }
      });
      console.log(`Aula ${lesson.order} atualizada com o link: ${newUrls[i]}`);
    }
  }

  console.log("URLs atualizadas com sucesso!");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())

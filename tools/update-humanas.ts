import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("Atualizando URLs dos vídeos de Ciências Humanas...");

  const humanas = await prisma.subject.findUnique({ 
    where: { slug: "humanas" },
    include: { lessons: { orderBy: { order: "asc" } } }
  });

  if (!humanas) {
    console.error("Matéria 'Ciências Humanas' não encontrada no banco!");
    return;
  }

  const newUrls = [
    "https://www.youtube.com/watch?v=TiJBt5RrA-E", // Era Vargas
    "https://www.youtube.com/watch?v=bxyGgRr_fsU", // Geopolítica Moderna e Conflitos Frios
    "https://www.youtube.com/watch?v=Ne5NG1sen7M", // Racionalismo x Empirismo
    "https://www.youtube.com/watch?v=ibXWCrMQ_3w"  // Sociologia Urbana e Movimentos Sociais
  ];

  for (let i = 0; i < humanas.lessons.length; i++) {
    const lesson = humanas.lessons[i];
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

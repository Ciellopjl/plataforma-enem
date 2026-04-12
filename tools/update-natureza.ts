import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("Atualizando URLs dos vídeos de Ciências da Natureza...");

  const natureza = await prisma.subject.findUnique({ 
    where: { slug: "natureza" },
    include: { lessons: { orderBy: { order: "asc" } } }
  });

  if (!natureza) {
    console.error("Matéria 'Ciências da Natureza' não encontrada no banco!");
    return;
  }

  const newUrls = [
    "https://www.youtube.com/watch?v=KKELP-3_Dlk", // Ecologia e Impactos Ambientais
    "https://www.youtube.com/watch?v=W9fnE9NdFzo", // Dinâmica e Leis de Newton
    "https://www.youtube.com/watch?v=eiJJstzniDs", // Estequiometria Básica e Balanceamento
    "https://www.youtube.com/watch?v=rjH2xzCwNx0"  // Citologia e Organelas Funcionais
  ];

  for (let i = 0; i < natureza.lessons.length; i++) {
    const lesson = natureza.lessons[i];
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

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("Injetando Quizzes Básicos nos novos módulos...");

  const slugs = ["natureza", "humanas", "linguagens"];

  for (const slug of slugs) {
    const subject = await prisma.subject.findUnique({ where: { slug } });
    if (!subject) continue;

    // Verifica se já tem um quiz básico (isFinal = false) para a matéria
    const existing = await prisma.quiz.findFirst({
      where: { subjectId: subject.id, isFinal: false }
    });

    if (!existing) {
      console.log(`Criando Desafio Básico para ${subject.name}...`);
      await prisma.quiz.create({
        data: {
          title: `Desafio Básico: ${subject.name}`,
          description: `Fixe o conteúdo assistido nas aulas teóricas de ${subject.name}.`,
          isFinal: false,
          subjectId: subject.id,
        }
      });
    } else {
      console.log(`Desafio Básico já existe para ${subject.name}.`);
    }
  }

  console.log("Desafios Básicos populados com sucesso!");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("Iniciando injeção de conteúdos dinâmicos...");

  // Conteúdos para Linguagens
  const linguagens = await prisma.subject.findUnique({ where: { slug: "linguagens" } });
  if (linguagens) {
    console.log("Adicionando conteúdos a Linguagens...");
    await prisma.lesson.createMany({
      data: [
        { title: "Interpretação de Textos Verbais e Não Verbais", content: "Aprenda a analisar imagens, charges e artigos de opinião conectando com a realidade sociopolítica.", videoUrl: "https://youtube.com", order: 1, subjectId: linguagens.id },
        { title: "Funções da Linguagem", content: "Função fática, emotiva, apelativa e poética. Identificando o foco do emissor.", videoUrl: "https://youtube.com", order: 2, subjectId: linguagens.id },
        { title: "Vanguardas Europeias", content: "Surrealismo, Cubismo, Expressionismo e a influência na arte moderna.", videoUrl: "https://youtube.com", order: 3, subjectId: linguagens.id },
        { title: "Figuras de Linguagem", content: "Metáfora, metonímia, eufemismo, antítese e muito mais.", videoUrl: "https://youtube.com", order: 4, subjectId: linguagens.id }
      ]
    });
  }

  // Conteúdos para Ciências da Natureza
  const natureza = await prisma.subject.findUnique({ where: { slug: "natureza" } });
  if (natureza) {
    console.log("Adicionando conteúdos a Ciências da Natureza...");
    await prisma.lesson.createMany({
      data: [
        { title: "Ecologia e Impactos Ambientais", content: "Ciclos biogeoquímicos, cadeias alimentares e pegada de carbono no século 21.", videoUrl: "https://youtube.com", order: 1, subjectId: natureza.id },
        { title: "Dinâmica e Leis de Newton", content: "As 3 leis de Newton na prática. Blocos, atrito e conservação de energia quantificada.", videoUrl: "https://youtube.com", order: 2, subjectId: natureza.id },
        { title: "Estequiometria Básica e Balanceamento", content: "Regras de três na química. Calculando o lucro reacional de substâncias impuras.", videoUrl: "https://youtube.com", order: 3, subjectId: natureza.id },
        { title: "Citologia e Organelas Funcionais", content: "Como a célula produz energia, guarda DNA e fabrica as proteínas da vida.", videoUrl: "https://youtube.com", order: 4, subjectId: natureza.id }
      ]
    });
  }

  // Conteúdos para Ciências Humanas
  const humanas = await prisma.subject.findUnique({ where: { slug: "humanas" } });
  if (humanas) {
    console.log("Adicionando conteúdos a Ciências Humanas...");
    await prisma.lesson.createMany({
      data: [
        { title: "Era Vargas", content: "Estado Novo, CLT e modernização base do Brasil contemporâneo.", videoUrl: "https://youtube.com", order: 1, subjectId: humanas.id },
        { title: "Geopolítica Moderna e Conflitos Frios", content: "A ascensão do leste asiático, OTAN e a nova guerra fria tecnológica.", videoUrl: "https://youtube.com", order: 2, subjectId: humanas.id },
        { title: "Racionalismo x Empirismo", content: "A matriz filosófica de Descartes vs Locke.", videoUrl: "https://youtube.com", order: 3, subjectId: humanas.id },
        { title: "Sociologia Urbana e Movimentos Sociais", content: "A estratificação da sociedade, favelização e reivindicação de direitos trabalhistas.", videoUrl: "https://youtube.com", order: 4, subjectId: humanas.id }
      ]
    });
  }

  console.log("Conteúdos foram inseridos com SUCESSO! ✅");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())

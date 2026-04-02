import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import { Pool } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";

const neonPool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaNeon(neonPool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🛠️  Sincronizando Currículo de Matemática Sênior (13 Aulas)...");

  // 1. Identificar a matéria
  const subject = await prisma.subject.findUnique({ where: { slug: "matematica" } });
  if (!subject) {
    console.error("❌ Erro: Matéria 'Matemática' não encontrada.");
    return;
  }

  // 2. Zerar trilha antiga (para garantir ordem e títulos novos)
  // Nota: Isso não apaga progresso se as IDs forem mantidas, mas aqui vamos resetar a trilha de aulas especificamente
  await prisma.lesson.deleteMany({ where: { subjectId: subject.id } });

  const finalMathCurriculum = [
    { title: "Porcentagem", url: "https://www.youtube.com/embed/6HA5l25DNPM" },
    { title: "Regra de três", url: "https://www.youtube.com/embed/mumCAwHremI" },
    { title: "Média, moda, mediana", url: "https://www.youtube.com/embed/IgoKxQK5hGQ" },
    { title: "Probabilidade", url: "https://www.youtube.com/embed/iNCkGogNtKI" },
    { title: "Estatística (gráficos e tabelas)", url: "https://www.youtube.com/embed/XzZGAwfKs_k" },
    { title: "Função do 1º Grau", url: "https://www.youtube.com/embed/4q2N2HzSivA" },
    { title: "Função do 2º Grau", url: "https://www.youtube.com/embed/ZpW9Xb5iyt4" },
    { title: "Equações (1º e 2º Grau)", url: "https://www.youtube.com/embed/tfm9kUrO5GI" },
    { title: "Geometria Plana", url: "https://www.youtube.com/embed/EzGf1UEnnsY" },
    { title: "Geometria Espacial", url: "https://www.youtube.com/embed/rJUEH0MPwrE" },
    { title: "Razão e Proporção", url: "https://www.youtube.com/embed/MvoCTWC3aoY" },
    { title: "Juros Simples", url: "https://www.youtube.com/embed/WFN5dxBTMgA" },
    { title: "Juros Compostos", url: "https://www.youtube.com/embed/ZMsieXqXwMg" }
  ];

  for (const [index, aula] of finalMathCurriculum.entries()) {
    console.log(`✅ Adicionando: ${aula.title}`);
    await prisma.lesson.create({
      data: {
        title: aula.title,
        videoUrl: aula.url,
        content: `### Roteiro Sênior: ${aula.title}\nEsta aula da curadoria exclusiva foca nos pontos chave para o ENEM. Assista ao vídeo e faça anotações dos conceitos principais.`,
        order: index + 1,
        subjectId: subject.id
      }
    });
  }

  console.log("\n🚀 Operação Blindada concluída! A trilha de Matemática está 100% sintonizada.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

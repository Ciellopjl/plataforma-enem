import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedEssay() {
  console.log("📝 Cadastrando Redação Real para Teste Sênior...");
  
  const user = await prisma.user.findFirst({ where: { role: "STUDENT" } });
  if (!user) {
    console.error("Nenhum estudante encontrado. Crie um primeiro.");
    return;
  }

  await prisma.essay.create({
    data: {
      userId: user.id,
      title: "Impactos da Inteligência Artificial na Educação Brasileira",
      content: "A inteligência artificial tem transformado diversos setores da sociedade contemporânea, e a educação não é exceção. Desde a personalização do ensino até a automação de tarefas administrativas, o potencial das tecnologias cognitivas é vasto. Contudo, é necessário refletir sobre o acesso desigual a essas ferramentas e os riscos Éticos envolvidos na coleta de dados de estudantes...",
      score: 820,
      feedback: "Excelente argumentação, mas a proposta de intervenção poderia ser mais detalhada. (Correção Automática via IA)",
      c1: 160,
      c2: 200,
      c3: 160,
      c4: 160,
      c5: 140,
      aiProbability: 15,
      aiReason: "Estrutura complexa e uso de termos técnicos."
    }
  });

  console.log("✅ REDAÇÃO CADASTRADA!");
}

seedEssay().catch(console.error).finally(() => prisma.$disconnect());

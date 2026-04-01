/**
 * SCRIPT: Popula o banco com logs de atividade de teste
 * Execute com: npx ts-node --project tsconfig.json -e "require('./src/scripts/seed-logs.ts')"
 * Ou: npx tsx src/scripts/seed-logs.ts
 */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Busca todos os alunos (não admins)
  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    select: { id: true, name: true, email: true }
  });

  if (students.length === 0) {
    console.log('❌ Nenhum aluno encontrado no banco. Faça login com uma conta de aluno primeiro.');
    return;
  }

  console.log(`✅ Encontrados ${students.length} aluno(s). Gerando logs de demonstração...`);

  const acoes = [
    { action: '🔐 Entrou na Plataforma', details: 'via Google' },
    { action: '🎯 Concluiu Desafio Diário', details: 'Desafio: Matemática | 4/5 corretas | +80 pts | Sequência: 3d' },
    { action: '📚 Concluiu Quiz', details: '3 questão(ões) corretas | +15 pts' },
    { action: '✍️ Corrigiu Redação', details: 'Nota Final: 720 | Humano: 94%' },
    { action: '🎯 Concluiu Desafio Diário', details: 'Desafio: História | 5/5 corretas | +100 pts | Sequência: 4d' },
    { action: '🔐 Entrou na Plataforma', details: 'via Google' },
    { action: '📚 Concluiu Quiz', details: '5 questão(ões) corretas | +25 pts' },
    { action: '🏆 Concluiu Exame Final', details: 'Pontuação Total: 380' },
  ];

  let total = 0;
  for (const student of students) {
    // Distribui alguns logs aleatórios para cada aluno
    const numLogs = Math.floor(Math.random() * 4) + 1; // 1-4 logs por aluno
    for (let i = 0; i < numLogs; i++) {
      const acao = acoes[Math.floor(Math.random() * acoes.length)];
      // Cria com timestamp variado nas últimas 24h
      const hoursAgo = Math.floor(Math.random() * 24);
      const createdAt = new Date();
      createdAt.setHours(createdAt.getHours() - hoursAgo);

      await prisma.activityLog.create({
        data: {
          userId: student.id,
          action: acao.action,
          details: acao.details,
          createdAt,
        }
      });
      total++;
    }
    console.log(`  📝 ${student.name || student.email}: ${numLogs} log(s) criados`);
  }

  console.log(`\n✨ ${total} logs de demonstração criados com sucesso!`);
  console.log('📊 Acesse /admin e vá na aba "Logs de Atividade" para ver.');
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

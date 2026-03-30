import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Sincronizando pontos do ciclo com pontos totais...');
  const users = await prisma.user.findMany();
  
  for (const user of users) {
    if (user.points !== user.totalPoints) {
      // Pega o maior valor para não perder progresso
      const higherPoints = Math.max(user.points, user.totalPoints);
      
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          points: higherPoints, 
          totalPoints: higherPoints 
        }
      });
      console.log(`✅ Usuário ${user.email || user.name} atualizado para ${higherPoints} pontos.`);
    }
  }
  console.log('✨ Sincronização concluída!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

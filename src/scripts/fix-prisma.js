const { execSync } = require('child_process');

console.log('Resolvendo travamento do Prisma Client (EPERM) rodando no Windows...');

try {
  console.log('1. Derrubando qualquer processo ativo no Next.js (Porta 3000)...');
  execSync('npx kill-port 3000');
  console.log('Processo finalizado.');
} catch (e) {
  console.log('A porta 3000 já parecia livre ou falhou em finalizar.');
}

try {
  console.log('2. Atualizando os tipos do Prisma com os novos campos (userId, hasEssay)...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('Prisma atualizado com Sucesso!');
} catch (e) {
  console.error('Erro ao gerar prisma:', e.message);
}

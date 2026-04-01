const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugDatabase() {
  console.log("🔍 [AUDITORIA SÊNIOR] Conectando ao Banco...");
  try {
    const emailToTest = "cellodosom327@gmail.com";
    
    // 1. Verificar Usuário
    const user = await prisma.user.findUnique({
      where: { email: emailToTest.toLowerCase().trim() }
    });
    
    console.log("👤 Usuário Encontrado:", user ? "SIM" : "NÃO");
    if (!user) {
      console.log("⚠️ Verificando se existe e-mail com letras maiúsculas...");
      const allUsers = await prisma.user.findMany({ select: { email: true } });
      console.log("E-mails cadastrados:", allUsers.map(u => u.email));
    }

    // 2. Testar Inserção de Token (O que a Action faz)
    console.log("📝 Testando gravação de Token de teste...");
    const testToken = await prisma.verificationToken.create({
       data: {
         identifier: emailToTest,
         token: "999999",
         expires: new Date(Date.now() + 3600000)
       }
    });
    console.log("✅ Gravação de Token: OK!");

    // 3. Limpar teste
    await prisma.verificationToken.delete({
       where: { identifier_token: { identifier: emailToTest, token: "999999" } }
    });
    console.log("✅ Limpeza de Teste: OK!");

  } catch (err) {
    console.error("❌ ERRO FATAL NO DB:", err);
  } finally {
    await prisma.$disconnect();
  }
}

debugDatabase();

import "dotenv/config";
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL || "");

async function clear() {
  console.log("⚠️ LIMPANDO BANCO DE DADOS (CONTEÚDO EDUCACIONAL)...");
  
  try {
    // Delete in reverse order of dependencies
    await sql`DELETE FROM "Option"`;
    await sql`DELETE FROM "Question"`;
    await sql`DELETE FROM "QuizAttempt"`;
    await sql`DELETE FROM "Quiz"`;
    await sql`DELETE FROM "Progress"`;
    await sql`DELETE FROM "Lesson"`;
    await sql`DELETE FROM "Subject"`;
    await sql`DELETE FROM "Resource"`;
    
    console.log("✅ BANCO LIMPO COM SUCESSO!");
  } catch (err) {
    console.error("❌ ERRO AO LIMPAR:", err);
  }
}

clear().then(() => process.exit(0));

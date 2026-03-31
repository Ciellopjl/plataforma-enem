import { readFileSync } from 'fs';
import { createGroq } from "@ai-sdk/groq";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import path from 'path';

// Função Senior para ler .env sem dependências externas
function loadEnv() {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    const envContent = readFileSync(envPath, 'utf-8');
    const lines = envContent.split('\n');
    
    for (const line of lines) {
      if (line.includes('=') && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=').trim().replace(/^"(.*)"$/, '$1'); // Limpa as aspas se houver
        process.env[key.trim()] = value;
      }
    }
  } catch (err) {
    console.warn("⚠️ Aviso: Não foi possível ler o arquivo .env manualmente.");
  }
}

loadEnv();

async function testAI() {
  console.log("🚀 Iniciando Auditoria Sênior de Conectividade - ENEM 2026\n");

  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  console.log(`- Groq Key: ${groqKey ? '✅ Carregada' : '❌ Ausente'}`);
  console.log(`- Gemini Key: ${geminiKey ? '✅ Carregada' : '❌ Ausente'}\n`);

  if (!groqKey) {
    console.error("❌ ERRO: GROQ_API_KEY não foi encontrada.");
    process.exit(1);
  }

  // 1. Tentar Groq (Primário)
  try {
    console.log("🤖 Testando Groq Llama 3...");
    const groq = createGroq({ apiKey: groqKey });
    const { text } = await generateText({
      model: groq("llama-3.1-8b-instant"),
      prompt: "Olá, sou o desenvolvedor. Você está online?",
    });
    console.log(`✅ GROQ OK: ${text.trim()}\n`);
  } catch (err) {
    console.error(`⚠️ GROQ FALHOU: ${err.message}`);
    
    // 2. Fallback Gemini
    if (geminiKey) {
      try {
        console.log("⚡ Acionando Fallback Gemini...");
        const gemini = createGoogleGenerativeAI({ apiKey: geminiKey });
        const { text } = await generateText({
          model: gemini("gemini-1.5-flash"),
          prompt: "Olá, o sistema primário caiu. Você está aí?",
        });
        console.log(`✅ GEMINI OK (Fallback): ${text.trim()}\n`);
      } catch (gemErr) {
        console.error(`❌ GEMINI TAMBÉM FALHOU: ${gemErr.message}`);
      }
    }
  }

  console.log("🏁 Auditoria concluída.");
}

testAI();

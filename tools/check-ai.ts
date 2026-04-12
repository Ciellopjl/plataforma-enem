import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * FERRAMENTA DE DIAGNÓSTICO MESTRE ENEM (SÊNIOR)
 * Verifica o status real das suas chaves de API.
 */

async function checkKeys() {
  console.log("\n🔍 INICIANDO DIAGNÓSTICO DE IA...\n");

  // 1. Testar Grok (xAI) - PRIORIDADE ATUAL
  const grokKey = process.env.GROK_API_KEY;
  if (grokKey && !grokKey.includes("Sua_Chave")) {
    const grok = createOpenAI({ apiKey: grokKey, baseURL: "https://api.x.ai/v1" });
    try {
      console.log("📡 Testando Grok (xAI)...");
      const { text } = await generateText({ model: grok("grok-2-latest"), prompt: "Hi" });
      console.log("✅ GROK ONLINE! Resposta:", text.trim());
    } catch (e: any) {
      if (e.message.includes("403")) {
          console.error("❌ GROK BLOQUEADO (403): Verifique se você tem créditos/saldo no console.x.ai.");
      } else if (e.message.includes("401")) {
          console.error("❌ GROK UNAUTHORIZED (401): Sua chave API está incorreta.");
      } else {
          console.error("❌ GROK ERRO:", e.message);
      }
    }
  } else {
    console.log("⚪ Grok não configurado no .env");
  }

  console.log("-" .repeat(30));

  // 2. Testar Groq (Llama)
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey && !groqKey.includes("Sua_Chave")) {
    const groq = createGroq({ apiKey: groqKey });
    try {
      console.log("📡 Testando Groq (Llama)...");
      const { text } = await generateText({ model: groq("llama-3.1-8b-instant"), prompt: "Hi" });
      console.log("✅ GROQ ONLINE! Resposta:", text.trim());
    } catch (e: any) {
      console.error("❌ GROQ ERRO:", e.message);
    }
  } else {
    console.log("⚪ Groq não configurado no .env");
  }

  console.log("-" .repeat(30));

  // 3. Testar Gemini (Google)
  const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
  if (geminiKey && !geminiKey.includes("Sua_Chave")) {
    const google = createGoogleGenerativeAI({ apiKey: geminiKey });
    try {
      console.log("📡 Testando Gemini (Google)...");
      const { text } = await generateText({ model: google("gemini-1.5-flash"), prompt: "Hi" });
      console.log("✅ GEMINI ONLINE! Resposta:", text.trim());
    } catch (e: any) {
      console.error("❌ GEMINI ERRO:", e.message);
    }
  } else {
    console.log("⚪ Gemini não configurado no .env");
  }

  console.log("\n💡 DICA SENIOR: Se todas as APIs falharem, a plataforma usará automaticamente o 'Modo Mestre IA' (contingência offline invisível) para garantir que o usuário nunca pare de estudar.\n");
}

checkKeys();

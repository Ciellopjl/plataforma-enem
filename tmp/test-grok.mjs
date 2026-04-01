import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import fs from "fs";
import path from "path";

// Sênior: Lendo o .env para testar a chave REAL da xAI
const envPath = path.resolve(process.cwd(), ".env");
const envContent = fs.readFileSync(envPath, "utf-8");
const grokMatch = envContent.match(/GROK_API_KEY="([^"]+)"/);
const apiKey = grokMatch ? grokMatch[1] : null;

async function test() {
  if (!apiKey) {
    console.error("ERRO: GROK_API_KEY não encontrada no .env");
    return;
  }

  // Configuração compatível com OpenAI da xAI
  const xai = createOpenAI({
    apiKey,
    baseURL: "https://api.x.ai/v1",
  });

  try {
    console.log("--- TESTANDO GROK (xAI) COM CHAVE DO .ENV ---");
    const { text } = await generateText({
      model: xai("grok-beta"), // Usando o modelo beta estável da xAI
      prompt: "Responda apenas 'GROK ATIVO' se estiver funcionando.",
    });
    console.log("RESULTADO DO TESTE:", text);
  } catch (e) {
    console.error("ERRO NO TESTE DO GROK:", e.message);
  }
}

test();

import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";
import fs from "fs";
import path from "path";

// Sênior: Lendo o .env para testar a chave REAL que o usuário salvou
const envPath = path.resolve(process.cwd(), ".env");
const envContent = fs.readFileSync(envPath, "utf-8");
const groqMatch = envContent.match(/GROQ_API_KEY="([^"]+)"/);
const apiKey = groqMatch ? groqMatch[1] : null;

async function test() {
  if (!apiKey) {
    console.error("ERRO: GROQ_API_KEY não encontrada no .env");
    return;
  }

  const groq = createGroq({ apiKey });

  try {
    console.log("--- TESTANDO GROQ COM CHAVE DO .ENV ---");
    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt: "Responda apenas 'CONECTADO' se estiver funcionando.",
    });
    console.log("RESULTADO FINAL:", text);
  } catch (e) {
    console.error("ERRO FINAL NO GROQ:", e.message);
  }
}

test();

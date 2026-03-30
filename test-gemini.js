require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("ERRO: GEMINI_API_KEY não encontrada no .env");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    console.log("Tentando gerar conteúdo simples...");
    const result = await model.generateContent("Diga 'Olá mundo' em JSON no formato { 'msg': 'string' }");
    console.log("Resposta:", result.response.text());
  } catch (err) {
    console.error("FALHA NA API GEMINI:", err.message);
    if (err.stack) console.error(err.stack);
  }
}

test();

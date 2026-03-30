const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

// Carregando .env manualmente se o dotenv não estiver disponível no node runtime direto
const envFile = fs.readFileSync(path.join(__dirname, '../.env'), 'utf8');
const envVars = Object.fromEntries(envFile.split('\n').filter(l => l && !l.startsWith('#')).map(l => {
    const [k, ...v] = l.split('=');
    return [k.trim(), v.join('=').trim().replace(/^"|"$/g, '')];
}));

const apiKey = envVars.GEMINI_API_KEY;

async function testHealth() {
    if (!apiKey) {
        console.error("❌ GEMINI_API_KEY não encontrada no .env!");
        process.exit(1);
    }
    console.log(`🤖 Testando Conectividade... (Key: ${apiKey.substring(0, 6)}...)`);
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
        const result = await model.generateContent("Dê um 'Bom dia' curto em português.");
        console.log(`✅ CONECTADO! Resposta da IA: "${result.response.text().trim()}"`);
    } catch (err) {
        console.error("❌ FALHA CRÍTICA NA CONECTIVIDADE:", err.message);
        if (err.stack) console.error(err.stack);
    }
}

testHealth();

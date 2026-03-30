const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const apiKey = envContent.match(/GEMINI_API_KEY="?([^"\s]+)"?/)[1];

async function listModels() {
    console.log(`🔍 [DEBUG] Listando modelos disponíveis para a chave...`);
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (!response.ok) {
            console.error(`❌ Erro HTTP ${response.status}:`, data);
            return;
        }
        
        console.log("✅ Modelos disponíveis:");
        if (data.models) {
            data.models.forEach(m => console.log(`- ${m.name} (${m.displayName})`));
        } else {
            console.log("Nenhum modelo retornado. Verifique se a chave é válida.");
            console.log("Raw response:", JSON.stringify(data, null, 2));
        }
    } catch (err) {
        console.error("❌ Erro ao listar modelos:", err.message);
    }
}

listModels();

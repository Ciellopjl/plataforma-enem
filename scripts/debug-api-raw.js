const fs = require('fs');
const path = require('path');

// Manuel .env loading because I'm a senior and don't rely on global state when debugging
const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const apiKey = envContent.match(/GEMINI_API_KEY="?([^"\s]+)"?/)[1];

async function testRawAPI() {
    console.log(`🤖 Senior Debug: Testando Key ${apiKey.substring(0, 5)}... via Raw FETCH`);
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const body = {
        contents: [{
            parts: [{ text: "Gere 1 questão simples de matemática do ENEM em JSON: { \"text\": \"...\", \"options\": [...], \"correctOptionIndex\": 0 }" }]
        }],
        generationConfig: {
            responseMimeType: "application/json"
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error(`❌ HTTP ERROR ${response.status}:`, JSON.stringify(data, null, 2));
        } else {
            console.log("✅ API SUCCESS! Response:", JSON.stringify(data.candidates[0].content.parts[0].text, null, 2));
        }
    } catch (err) {
        console.error("❌ FETCH ERROR:", err.message);
    }
}

testRawAPI();

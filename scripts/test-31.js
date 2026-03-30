const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const apiKey = envContent.match(/GEMINI_API_KEY="?([^"\s]+)"?/)[1];

async function test31() {
    console.log(`🤖 Senior Debug: Testing Gemini 3.1...`);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-live-preview:generateContent?key=${apiKey}`;
    
    const body = {
        contents: [{
            parts: [{ text: "Gere exatamente 5 questões de biologia em JSON { \"questions\": [...] }" }]
        }],
        generationConfig: { responseMimeType: "application/json" }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await response.json();
        if (!response.ok) {
            console.error("❌ 3.1 Error:", JSON.stringify(data, null, 2));
        } else {
            const parsed = JSON.parse(data.candidates[0].content.parts[0].text);
            console.log(`✅ 3.1 Success! Received ${parsed.questions.length} questions.`);
        }
    } catch (err) {
        console.error("❌ Fetch Error:", err.message);
    }
}

test31();

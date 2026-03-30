const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function test() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY not found in .env");
    process.exit(1);
  }
  console.log("Testing API Key:", apiKey.substring(0, 6) + "...");
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const result = await model.generateContent("Respond with 'OK' if you see this.");
    console.log("Response:", result.response.text());
    console.log("SUCCESS: Gemini API is reachable.");
  } catch (error) {
    console.error("FAILURE: Gemini API error:", error.message);
  }
}

test();

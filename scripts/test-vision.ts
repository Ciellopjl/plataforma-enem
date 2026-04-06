import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { config } from "dotenv";
config();

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

async function test(modelName: string) {
  try {
    const { text } = await generateText({
      model: groq(modelName),
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "what is in this pixel?" },
            { type: "image", image: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=" },
          ],
        },
      ],
    });
    console.log(`SUCCESS for ${modelName}:`, text);
  } catch (e: any) {
    console.log(`FAIL for ${modelName}:`, e.message);
  }
}

async function run() {
  await test("llama-3.2-11b-vision-preview");
  await test("llama-3.2-90b-vision-preview");
  await test("llama-3.2-11b-vision");
  await test("llama-3.2-90b-vision");
  await test("llama-3.2-11b");
}

run();

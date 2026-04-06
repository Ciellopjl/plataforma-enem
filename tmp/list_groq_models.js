const { Groq } = require('groq-sdk');

async function listModels() {
  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
  });

  const models = await groq.models.list();
  console.log(JSON.stringify(models, null, 2));
}

listModels().catch(console.error);

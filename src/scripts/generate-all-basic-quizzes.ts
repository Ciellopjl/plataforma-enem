import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const GROQ_API_KEY = process.env.GROQ_API_KEY;

async function generateBasicQuizForSubject(subjectName: string) {
  const prompt = `Gere exatamente 5 questões de múltipla escolha (com 4 alternativas cada, apenas 1 correta) de nível FÁCIL/INTERMEDIÁRIO para a disciplina de ${subjectName}. 
  Formato JSON estrito (sem markdown, sem texto fora do JSON):
  {
    "title": "Desafio Básico: ${subjectName}",
    "description": "Fixação de conhecimentos básicos da matéria.",
    "questions": [
      {
        "text": "Pergunta aqui",
        "options": [
          { "text": "A", "isCorrect": true },
          { "text": "B", "isCorrect": false },
          { "text": "C", "isCorrect": false },
          { "text": "D", "isCorrect": false }
        ]
      }
    ]
  }`;

  console.log(`Gerando para: ${subjectName}...`);
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 3000
    })
  });

  const data = await response.json();
  const rawData = data.choices[0].message.content;
  
  // Limpeza
  let jsonString = rawData;
  const st = jsonString.indexOf('{');
  const en = jsonString.lastIndexOf('}');
  if (st !== -1 && en !== -1) {
      jsonString = jsonString.substring(st, en + 1);
  }
  
  return JSON.parse(jsonString);
}

async function main() {
  const subjects = await prisma.subject.findMany({
    include: { quizzes: true }
  });

  for (const subject of subjects) {
    const hasBasic = subject.quizzes.some(q => !q.isFinal);
    if (!hasBasic) {
      console.log(`\nA matéria "${subject.name}" não tem quiz básico. Gerando...`);
      try {
        const quizData = await generateBasicQuizForSubject(subject.name);
        
        const dbQuiz: any = await prisma.quiz.create({
          data: {
            title: quizData.title || `Desafio Básico de ${subject.name}`,
            description: quizData.description,
            subjectId: subject.id,
            isFinal: false,
            questions: {
              create: quizData.questions.map((q: any) => ({
                text: q.text,
                options: {
                  create: q.options.map((o: any) => ({
                    text: o.text
                  }))
                }
              }))
            }
          },
          include: {
            questions: { include: { options: true } }
          }
        });

        // Corrigir Respostas
        for (let i = 0; i < quizData.questions.length; i++) {
          const expectedQ = quizData.questions[i];
          const actualQ = dbQuiz.questions[i];
          const correctIndex = expectedQ.options.findIndex((o: any) => o.isCorrect);
          if (correctIndex !== -1 && actualQ.options[correctIndex]) {
            await prisma.question.update({
              where: { id: actualQ.id },
              data: { correctOptionId: actualQ.options[correctIndex].id }
            });
          }
        }
        console.log(`[SUCESSO] Desafio básico de ${subject.name} gerado!`);
      } catch (err) {
        console.error(`[ERRO] Falha ao gerar quiz para ${subject.name}:`, err);
      }
    } else {
      console.log(`[OK] A matéria "${subject.name}" já possui um quiz básico.`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

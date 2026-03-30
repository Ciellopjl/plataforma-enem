import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { QuizInteractive } from "./quiz-interactive";

export default async function DesafioDiarioPage({ params }: { params: { id: string } }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const userId = (session.user as any).id;

  // Busca o desafio e todas as perguntas e opções
  const challenge = await prisma.dailyChallenge.findUnique({
    where: { 
      id: params.id,
      userId: userId, // Garante que só o dono acesse
    },
    include: {
      quiz: {
        include: {
          questions: {
            include: {
              options: true
            }
          }
        }
      }
    }
  });

  if (!challenge) {
    return notFound();
  }

  // Removemos o redirect agressivo que estava expulsando o usuário rápido demais!
  
  // Formata os dados pro Client Component sem mandar correctOptionId (Segurança Sênior!)
  const safeQuestions = challenge.quiz.questions.map(q => ({
    id: q.id,
    text: q.text,
    options: q.options.map(o => ({
      id: o.id,
      text: o.text
    }))
  }));

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8 md:py-16 relative">
      <div className="absolute top-0 inset-x-0 h-96 bg-primary-900/10 blur-[100px] pointer-events-none" />
      
      <div className="max-w-3xl mx-auto space-y-8 relative z-10">
        <header className="space-y-4 text-center">
          <p className="text-primary-400 text-sm font-bold uppercase tracking-widest">IA Groq Llama 3 sênior</p>
          <h1 className="text-3xl md:text-5xl font-black">{challenge.quiz.title}</h1>
          <p className="text-zinc-400">{challenge.quiz.description}</p>
        </header>

        <section className="mt-12">
           <QuizInteractive 
             challengeId={challenge.id} 
             questions={safeQuestions}
             alreadyCompleted={challenge.completed}
             alreadyScore={challenge.score}
           />
        </section>
      </div>
    </div>
  );
}

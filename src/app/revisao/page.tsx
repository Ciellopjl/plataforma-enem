export const dynamic = 'force-dynamic';
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { 
  History, AlertCircle, CheckCircle2, XCircle, 
  HelpCircle, ChevronRight, Moon, Sparkles, BookOpen 
} from "lucide-react";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";

import { RevisionCard } from "./revision-card";

export default async function RevisaoPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id;

  // Buscar desafios dos últimos 7 dias que tenham respostas salvas
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const challenges = await prisma.dailyChallenge.findMany({
    where: {
      userId,
      completed: true,
      date: { gte: sevenDaysAgo },
    },
    include: {
      quiz: {
        include: {
          subject: true,
          questions: {
            include: { options: true }
          }
        }
      }
    },
    orderBy: { date: "desc" }
  });

  // Filtrar apenas as questões que o usuário errou
  const wrongQuestions: any[] = [];

  challenges.forEach(challenge => {
    const responses = (challenge as any).responses as Record<string, string> || {};
    challenge.quiz.questions.forEach(question => {
      const userAnswerId = responses[question.id];
      if (userAnswerId && userAnswerId !== question.correctOptionId) {
        wrongQuestions.push({
          id: question.id,
          text: question.text,
          options: question.options.map(o => ({ id: o.id, text: o.text })),
          correctOptionId: question.correctOptionId,
          userAnswerId,
          subject: {
            name: challenge.quiz.subject.name,
            color: challenge.quiz.subject.color || "bg-primary-500"
          },
          date: challenge.date
        });
      }
    });
  });

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="border-b border-white/5 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-primary-400 mb-3">
             <div className="p-2 bg-primary-500/10 rounded-lg border border-primary-500/20 shadow-lg shadow-primary-500/10">
                <Moon size={18} className="fill-primary-400/20" />
             </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Módulo Sênior • Revisão Noturna</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4 leading-none">
            Estudo de <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">Alta Performance</span>
          </h1>
          <p className="text-zinc-400 max-w-2xl text-sm md:text-base leading-relaxed">
            Sua jornada para a aprovação é pavimentada pelos seus erros. Analise cada um com calma, entenda a lógica e garanta que não errará novamente.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4 bg-zinc-900/50 backdrop-blur-xl p-5 rounded-[2rem] border border-white/5 shadow-2xl">
          <div className="text-right">
            <div className="text-2xl font-black text-white leading-none mb-1">{wrongQuestions.length}</div>
            <div className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Gaps Identificados</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shadow-lg shadow-red-500/20">
            <AlertCircle className="text-red-400 w-6 h-6" />
          </div>
        </div>

        {/* Glow de Background sênior */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary-500/5 blur-[100px] rounded-full pointer-events-none" />
      </header>

      {wrongQuestions.length > 0 ? (
        <div className="grid grid-cols-1 gap-10">
          {wrongQuestions.map((q, i) => (
            <RevisionCard 
              key={`${q.id}-${i}`}
              index={i}
              question={q}
              userAnswerId={q.userAnswerId}
              subject={q.subject}
              date={q.date}
            />
          ))}
        </div>
      ) : (
        <div className="py-24 glass rounded-[4rem] border-white/5 flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in duration-1000">
          <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 shadow-2xl shadow-emerald-500/20">
            <CheckCircle2 className="text-emerald-400 w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-white">Nenhum Gap Recente!</h2>
            <p className="text-zinc-500 max-w-sm font-medium">
              Sua memória e técnica estão afiadas. Você não cometeu erros nos últimos 7 dias. Continue com este foco implacável!
            </p>
          </div>
          <Link href="/dashboard" className="px-10 py-4 bg-white text-black text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-200 transition-all shadow-xl shadow-white/5">
            Voltar ao Painel de Mestre
          </Link>
        </div>
      )}
    </div>
  );
}

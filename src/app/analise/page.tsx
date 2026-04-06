export const dynamic = 'force-dynamic';
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { 
  BarChart3, TrendingUp, Target, CheckCircle2, 
  XCircle, PieChart, Calendar, ChevronRight, AlertCircle, Clock, Sparkles 
} from "lucide-react";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";
import { StudyCalendar } from "@/components/ui/study-calendar";
import Link from "next/link";

export default async function AnalisePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id;

  // Buscar histórico de desafios diários
  const dailyChallenges = await prisma.dailyChallenge.findMany({
    where: { userId, completed: true },
    include: {
      quiz: { include: { subject: true } }
    },
    orderBy: { date: "desc" },
    take: 30
  });

  // Buscar histórico de simulados e provas finais
  const quizAttempts = await prisma.quizAttempt.findMany({
    where: { userId, completed: true },
    include: {
      quiz: { include: { subject: true } }
    },
    orderBy: { createdAt: "desc" },
    take: 30
  });

  // Unificar e formatar histórico
  const history = [
    ...dailyChallenges.map(d => ({
      id: "dc_" + d.id,
      date: new Date(d.date),
      score: d.score || 0,
      title: "Desafio Diário: " + d.quiz.title,
      isFinal: false,
      subject: d.quiz.subject
    })),
    ...quizAttempts.map(q => ({
      id: "qa_" + q.id,
      date: new Date(q.createdAt),
      score: q.score || 0,
      title: q.quiz.title,
      isFinal: q.quiz.isFinal,
      subject: q.quiz.subject,
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 30);

  const totalPoints = history.reduce((acc, curr) => acc + curr.score, 0);
  const avgScore = history.length > 0 ? Math.round(totalPoints / history.length) : 0;
  
  // Agrupar por matéria
  const subjectStats: Record<string, { total: number; correct: number; color: string }> = {};
  
  history.forEach((h) => {
    const subject = h.subject;
    if (!subjectStats[subject.name]) {
      subjectStats[subject.name] = { total: 0, correct: 0, color: subject.color || "bg-primary-500" };
    }
    // Consideramos peso de 5 questões por tentativa normal, ou 20 se for prova final
    const maxQ = h.isFinal ? 20 : 5;
    subjectStats[subject.name].total += maxQ; 
    const correctAnswers = h.isFinal ? Math.round(h.score / 12.5) : Math.round(h.score / 5);
    subjectStats[subject.name].correct += Math.min(maxQ, correctAnswers);
  });

  const subjectsSorted = Object.entries(subjectStats)
    .sort((a, b) => (b[1].correct / b[1].total) - (a[1].correct / a[1].total));

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="border-b border-white/5 pb-6">
        <h1 className="text-4xl font-black text-white tracking-tight mb-2">Análise de Performance</h1>
        <p className="text-zinc-400">
          Acompanhe sua evolução e descubra onde você precisa focar mais.
        </p>
      </header>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "XP Total", value: `${totalPoints} pts`, icon: TrendingUp, color: "text-primary-400" },
          { label: "Média p/ Desafio", value: `${avgScore} pts`, icon: Target, color: "text-emerald-400" },
          { label: "Desafios Concluintes", value: history.length, icon: CheckCircle2, color: "text-blue-400" },
          { label: "Aproveitamento Geral", value: `${Math.round((avgScore / 100) * 100)}%`, icon: PieChart, color: "text-purple-400" },
        ].map((stat, i) => (
          <div key={i} className="glass p-6 rounded-3xl border-white/5">
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={cn("w-6 h-6", stat.color)} />
            </div>
            <div className="text-2xl font-black text-white">{stat.value}</div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendário de Estudos */}
        <div className="lg:col-span-1">
          <StudyCalendar challengeDates={history.map(h => new Date(h.date))} />
        </div>

        {/* Performance por Matéria */}
        <div className="lg:col-span-2 glass p-8 rounded-[2rem] border-white/5">
          <div className="flex items-center gap-3 mb-8">
            <BarChart3 className="text-primary-400" />
            <h3 className="text-xl font-bold text-white">Domínio por Disciplina</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {subjectsSorted.length > 0 ? subjectsSorted.map(([name, stats]) => {
              const pct = Math.round((stats.correct / stats.total) * 100);
              return (
                <div key={name} className="space-y-2">
                  <div className="flex justify-between text-sm items-end">
                    <span className="font-bold text-zinc-200">{name}</span>
                    <span className="text-zinc-500 font-mono text-[10px] uppercase font-black">{stats.correct}/{stats.total} acertos • {pct}%</span>
                  </div>
                  <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/5">
                    <div 
                      className={cn("h-full rounded-full transition-all duration-1000", stats.color)}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            }) : (
              <div className="col-span-2 flex flex-col items-center justify-center py-10 text-zinc-500 text-sm italic">
                <AlertCircle className="w-10 h-10 mb-3 opacity-20" />
                <p>Nenhuma informação disponível. Resolva seu primeiro desafio hoje!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Histórico Recente */}
      <div className="glass p-8 rounded-[2rem] border-white/5">
        <div className="flex items-center gap-3 mb-8">
          <Calendar className="text-emerald-400" />
          <h3 className="text-xl font-bold text-white">Histórico de Atividade</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {history.length > 0 ? history.map((h) => (
            <div key={h.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/2 border border-white/5 hover:bg-white/5 transition-colors group">
              <div className={cn("w-1 h-12 rounded-full", h.subject.color)} />
              <div className="flex-1">
                <h4 className="font-bold text-white text-xs group-hover:text-primary-400 transition-colors line-clamp-1">
                  {h.title}
                </h4>
                <p className="text-[10px] text-zinc-500 uppercase font-black">{h.date.toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <div className={cn(
                  "font-black text-lg",
                  h.isFinal ? "text-rose-400" : h.score >= 20 ? "text-emerald-400" : h.score >= 10 ? "text-yellow-400" : "text-zinc-400"
                )}>
                  {h.score} pts
                </div>
                <p className="text-[10px] text-zinc-600 font-bold uppercase">{h.isFinal ? "Certificação" : "XP"}</p>
              </div>
            </div>
          )) : (
            <div className="col-span-full flex flex-col items-center justify-center py-10 text-zinc-500 text-sm italic">
              <p>O seu histórico aparecerá aqui após o primeiro desafio.</p>
            </div>
          )}
        </div>
      </div>

      {/* Previsão de Nota IA */}
      <div className="glass p-10 rounded-[3rem] border-primary-500/20 bg-gradient-to-br from-primary-900/10 to-transparent relative overflow-hidden group">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-shrink-0 w-32 h-32 bg-primary-500/10 rounded-full flex items-center justify-center border border-primary-500/30 group-hover:scale-110 transition-transform duration-700 shadow-2xl shadow-primary-500/20">
            <Sparkles className="text-primary-400 w-16 h-16 animate-pulse" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-black text-white mb-4">Previsão de Nota ENEM</h2>
            <p className="text-zinc-400 text-sm max-w-xl leading-relaxed">
              Com base nos seus <span className="text-white font-bold">{history.length} simulados</span> e na sua média de <span className="text-white font-bold">{avgScore} pontos</span>, nossa IA estima que sua nota no ENEM estaria na faixa de:
            </p>
          </div>
          <div className="bg-zinc-950/50 backdrop-blur-xl border border-white/10 rounded-[2rem] px-10 py-8 text-center min-w-[240px]">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-400 mb-2">Nota Estimada TRI</div>
            <div className="text-5xl font-black text-white">
              {history.length > 0 ? (Math.round(avgScore * 7.5)) : "410"}
            </div>
            <div className="text-xs text-zinc-500 font-bold mt-2">
              {history.length > 0 
                ? `Intervalo: ${Math.round(avgScore * 7.5)-30} ~ ${Math.round(avgScore * 7.5)+30}` 
                : "Nivelamento Inicial"}
            </div>
          </div>
        </div>
        
        {history.length === 0 && (
          <div className="mt-8 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
             <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest text-center">
                Você ainda não realizou desafios. Complete seu primeiro simulado diário para uma análise precisa.
             </p>
             <Link href="/dashboard" className="px-6 py-2 bg-primary-600 hover:bg-primary-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all">
                Iniciar Primeiro Desafio
             </Link>
          </div>
        )}
        
        {/* Background glow sênior */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-primary-500/5 blur-[100px] rounded-full" />
      </div>
    </div>
  );
}

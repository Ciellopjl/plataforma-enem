export const dynamic = 'force-dynamic';
import { ProgressBar, Button } from "@/components/ui/base-ui";
import { SubjectCard } from "@/components/ui/subject-card";
import { Trophy, Flame, Target, BookOpen, Clock, GraduationCap, Star, Users, Shield, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { cn, getDaysUntilEnem, formatName } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

import { DailyChallengeCard } from "@/components/ui/daily-challenge";
import { DevResetButton } from "@/components/ui/dev-reset-button";
import { CreatorControl } from "@/components/ui/creator-control";
import { LiveRefresh } from "@/components/ui/live-refresh";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  let user = null;
  let dbSubjects: any[] = [];
  let error = null;
  let percentile = 15;

  try {
    // Buscar dados reais do usuário
    user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      include: {
        progress: {
          include: {
            content: true,
            lesson: true
          }
        },
      }
    });

    // Buscar matérias do banco com Quizzes e Tentativas para cálculo real de progresso
    dbSubjects = await prisma.subject.findMany({
      include: {
        contents: true,
        lessons: {
          include: {
            progress: { where: { userId: (session.user as any).id } }
          }
        },
        quizzes: {
          include: {
            questions: true,
            attempts: { 
              where: { userId: (session.user as any).id },
              orderBy: { score: "desc" },
              take: 1
            }
          }
        }
      }
    });

    if (user) {
      const totalUsers = await prisma.user.count();
      const usersAhead = await prisma.user.count({
        where: { points: { gt: user.points } }
      });
      percentile = totalUsers > 1 ? Math.max(1, Math.ceil((usersAhead / totalUsers) * 100)) : 1;
    }
  } catch (e) {
    console.error("Erro ao carregar dados do Dashboard:", e);
    error = "Não foi possível conectar ao banco de dados.";
  }

  const points = user?.points || 0;

  // Mapear sujeitos e progresso (Sincronizado com a Régua Sênior da /api/subjects/[slug])
  const subjects = dbSubjects.map(subject => {
    // 1. Aulas concluídas
    const totalLessons = subject.lessons.length;
    const completedLessons = subject.lessons.filter((l: any) => 
      l.progress?.some((p: any) => p.completed)
    ).length;

    // 2. Status dos Quizzes (Básico e Final)
    const basicQuiz = subject.quizzes.find((q: any) => !q.isFinal);
    const finalQuiz = subject.quizzes.find((q: any) => q.isFinal);

    let basicPassed = false;
    if (basicQuiz && basicQuiz.attempts.length > 0) {
      const bestAttempt = basicQuiz.attempts[0];
      if (bestAttempt.score >= basicQuiz.questions.length && basicQuiz.questions.length > 0) {
        basicPassed = true;
      }
    }

    const finalPassed = finalQuiz ? finalQuiz.attempts.some((a: any) => a.completed) : false;

    // 3. Cálculo Holístico (Milestones)
    const totalMilestones = totalLessons + (basicQuiz ? 1 : 0) + (finalQuiz ? 1 : 0);
    const completedMilestones = completedLessons + (basicPassed ? 1 : 0) + (finalPassed ? 1 : 0);
    const progressPercentage = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

    return {
      name: subject.name,
      slug: subject.slug,
      color: subject.color || "bg-primary-600",
      iconName: subject.icon || "BookOpen",
      progress: progressPercentage
    };
  });

  // ─── Cálculos reais de progresso ───────────────────────────────
  const totalSubjects = dbSubjects.length;
  
  // Matérias com pelo menos 1 item (conteúdo ou aula) concluído pelo usuário
  const completedSubjects = dbSubjects.filter(subject => {
    const hasCompletedContent = subject.contents.some((c: any) =>
      user?.progress?.some((p: any) => p.contentId === c.id && p.completed)
    );
    const hasCompletedLesson = subject.lessons?.some((l: any) =>
      user?.progress?.some((p: any) => p.lessonId === l.id && p.completed)
    );
    return hasCompletedContent || hasCompletedLesson;
  }).length;

  const weeklyPct = totalSubjects > 0 ? Math.round((completedSubjects / totalSubjects) * 100) : 0;

  // Dias até o próximo reset semanal (domingo)
  const today = new Date();
  const daysUntilReset = 7 - today.getDay() || 7;

  const isDevUser = session.user.email === process.env.DEV_EMAIL;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
        <h1 className="text-3xl font-bold text-red-500">Erro de Conexão</h1>
        <p className="text-zinc-400 max-w-md">
          A plataforma não conseguiu se conectar ao banco de dados. 
          Verifique se o seu arquivo <code className="bg-zinc-800 px-2 py-1 rounded">.env</code> está configurado corretamente.
        </p>
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <LiveRefresh intervalMs={10000} />
      {isDevUser && <CreatorControl />}
      {isDevUser && <DevResetButton />}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl border border-white/5 overflow-hidden relative shrink-0">
            {session.user.image ? (
              <img src={session.user.image} alt={session.user.name || "Perfil"} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-primary-500/20 flex items-center justify-center text-primary-500 text-2xl font-black">
                {session.user.name?.[0]?.toUpperCase() || "?"}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Painel de Estudos</h1>
            <p className="text-zinc-400">
              Bem-vindo de volta, {formatName(session.user.name, session.user.email)}! 
              {getDaysUntilEnem() > 0 ? ` Faltam ${getDaysUntilEnem()} dias para o ENEM.` : " Chegou o ENEM! Mantenha a calma e arrebente."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass px-4 py-2 rounded-2xl flex items-center gap-2 border-primary-500/20 shadow-lg shadow-primary-500/10 transition-all hover:scale-105">
            <Flame className={cn(
              "w-5 h-5",
              (user?.streak || 0) > 0 ? "text-orange-500 fill-orange-500/20 animate-pulse" : "text-zinc-600"
            )} />
            <span className="font-bold text-zinc-100">
              {(user?.streak || 0)} {(user?.streak || 0) === 1 ? 'Dia' : 'Dias'} de Ofensiva
            </span>
          </div>
        </div>
      </header>

      {/* Área da IA: Desafio Diário Sênior */}
      <section>
        <DailyChallengeCard />
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass p-6 rounded-3xl border-white/[0.05] relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <Trophy className="text-yellow-500 w-8 h-8" />
            <span className="text-xs font-bold px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded-lg">Top {percentile}%</span>
          </div>
          <div className="text-2xl font-bold text-white">{points} Pontos</div>
          <p className="text-sm text-zinc-400">Sua pontuação no ciclo atual</p>
        </div>

        <div className="md:col-span-2 glass p-6 rounded-3xl border-white/[0.05]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-zinc-400 text-sm">
              <Clock size={16} />
              Meta Semanal
            </div>
            <span className="text-sm font-bold text-primary-400">{weeklyPct}%</span>
          </div>
          <ProgressBar value={weeklyPct} className="h-4 ring-4 ring-primary-500/5" />
          <div className="mt-4 flex gap-4 text-xs text-zinc-500">
            <span>Matérias Concluídas: {completedSubjects}/{totalSubjects}</span>
            <span>Próximo Reset: {daysUntilReset} dias</span>
          </div>
        </div>
      </div>

      {/* Seção de Acesso Rápido Sênior */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Simulados", icon: Trophy, href: "/simulados", color: "text-primary-400" },
          { label: "Biblioteca", icon: BookOpen, href: "/biblioteca", color: "text-emerald-400" },
          { label: "Ranking", icon: Star, href: "/ranking", color: "text-yellow-400" },
          { label: "Anotações", icon: Clock, href: "/anotacoes", color: "text-sky-400" },
        ].map((action, i) => (
          <Link key={i} href={action.href} className="block w-full">
            <div className="glass w-full p-4 rounded-3xl border-white/[0.03] hover:border-white/10 hover:bg-white/[0.02] transition-all flex flex-col items-center gap-3 cursor-pointer">
              <action.icon className={cn("w-6 h-6", action.color)} />
              <span className="text-xs font-bold text-zinc-100 uppercase tracking-widest">{action.label}</span>
            </div>
          </Link>
        ))}
      </section>

      {/* Painel Administrativo Exclusivo Sênior */}
      {((session.user as any).role === "ADMIN" || isDevUser) && (
        <section className="animate-in fade-in slide-in-from-left-4 duration-1000">
           <div className="flex items-center gap-3 mb-4">
             <div className="h-px bg-primary-500/10 flex-1" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-500/50">Centro de Comando Admin</span>
             <div className="h-px bg-primary-500/10 flex-1" />
           </div>
           <Link href="/admin" className="block w-full text-left">
              <div className="w-full glass p-8 rounded-[2rem] border-primary-500/20 hover:border-primary-500/40 bg-zinc-950/40 hover:bg-primary-500/5 transition-all flex flex-col md:flex-row items-center justify-between gap-6 group cursor-pointer overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 text-6xl font-black text-primary-500/5 opacity-0 group-hover:opacity-100 transition-all">
                  ADMIN
                </div>
                <div className="flex items-center gap-6 relative z-10">
                  <div className="bg-primary-500/10 p-4 rounded-2xl group-hover:scale-110 group-hover:bg-primary-500/20 transition-all">
                    <Shield className="text-primary-400 w-8 h-8" />
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="text-xl font-bold text-white tracking-tight">Gestão da Plataforma</h3>
                    <p className="text-sm text-zinc-400">Controle de alunos, bloqueios e permissões de acesso.</p>
                  </div>
                </div>
                <div className="px-8 py-4 bg-primary-500 text-black font-black rounded-2xl group-hover:bg-primary-400 transition-colors flex items-center gap-2 shadow-lg shadow-primary-500/20 relative z-10">
                  Gerenciar Alunos <ShieldCheck size={18} />
                </div>
              </div>
           </Link>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <BookOpen className="text-primary-400" size={24} />
            Suas Matérias
          </h2>
          <Link href="/materias">
            <Button variant="ghost" size="sm">Ver todas</Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {subjects.map((subject) => (
            <SubjectCard key={subject.slug} {...subject} />
          ))}
        </div>
      </section>


    </div>
  );
}

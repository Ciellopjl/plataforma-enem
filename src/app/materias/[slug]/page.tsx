"use client";

import { ChevronLeft, Play, Award, Zap, Lock, CheckCircle2, Flame, GraduationCap } from "lucide-react";
import { ProgressBar } from "@/components/ui/base-ui";
import { cn } from "@/lib/utils";
import { SubjectIcon } from "@/components/ui/subject-icon";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { LessonViewer } from "../lesson-viewer";
import { QuizViewer } from "../quiz-viewer";

export default function SubjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [subject, setSubject] = useState<any>(null);
  const [view, setView] = useState<"trail" | "lesson" | "quiz">("trail");
  const [activeItem, setActiveItem] = useState<any>(null);
  const [activeQuizIsFinal, setActiveQuizIsFinal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isGeneratingFinal, setIsGeneratingFinal] = useState(false);
  const [isGeneratingBasic, setIsGeneratingBasic] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`/api/subjects/${slug}`);
      const data = await res.json();
      setSubject(data);
      setTimeout(() => setLoading(false), 500);
    }
    fetchData();
  }, [slug]);

  if (loading || !subject) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-pulse">
        <div className="w-16 h-16 bg-zinc-800 rounded-3xl" />
        <div className="h-4 w-48 bg-zinc-800 rounded-full" />
      </div>
    );
  }

  if (view === "lesson" && activeItem) {
    return (
      <LessonViewer
        lesson={activeItem}
        initialCompleted={activeItem.completed}
        onBack={() => setView("trail")}
        onCompleteChange={(completed) => {
          setSubject((prev: any) => {
            const newLessons = prev.lessons.map((l: any) =>
              l.id === activeItem.id ? { ...l, completed } : l
            );
            
            // Cálculo Holístico (Igual à API)
            const totalL = newLessons.length;
            const compL = newLessons.filter((l: any) => l.completed).length;
            const hasBasic = !!prev.basicQuiz;
            const hasFinal = !!prev.finalQuiz;
            
            const totalM = totalL + (hasBasic ? 1 : 0) + (hasFinal ? 1 : 0);
            const compM = compL + (prev.basicPassed ? 1 : 0) + (prev.finalPassed ? 1 : 0);
            
            return {
              ...prev,
              lessons: newLessons,
              progress: totalM > 0 ? Math.round((compM / totalM) * 100) : 0
            };
          });
        }}
      />
    );
  }

  if (view === "quiz" && activeItem) {
    return (
      <QuizViewer
        quiz={activeItem}
        isFinal={activeQuizIsFinal}
        onBack={() => setView("trail")}
        onBasicPassed={() => {
          setSubject((prev: any) => {
            const hasBasic = !!prev.basicQuiz;
            const hasFinal = !!prev.finalQuiz;
            const totalL = prev.lessons.length;
            const compL = prev.lessons.filter((l: any) => l.completed).length;
            
            const totalM = totalL + (hasBasic ? 1 : 0) + (hasFinal ? 1 : 0);
            const compM = compL + 1 + (prev.finalPassed ? 1 : 0);

            return { ...prev, basicPassed: true, progress: Math.round((compM / totalM) * 100) };
          });
        }}
        onFinalPassed={() => {
          setSubject((prev: any) => {
            const hasBasic = !!prev.basicQuiz;
            const hasFinal = !!prev.finalQuiz;
            const totalL = prev.lessons.length;
            const compL = prev.lessons.filter((l: any) => l.completed).length;
            
            const totalM = totalL + (hasBasic ? 1 : 0) + (hasFinal ? 1 : 0);
            const compM = compL + (prev.basicPassed ? 1 : 0) + 1;

            return { ...prev, finalPassed: true, progress: Math.round((compM / totalM) * 100) };
          });
        }}
      />
    );
  }

  const basicQuiz = subject.basicQuiz;
  const finalQuiz = subject.finalQuiz;
  const basicPassed: boolean = subject.basicPassed ?? false;
  const finalPassed: boolean = subject.finalPassed ?? false;
  // Desbloqueia quiz básico quando todas as aulas estão concluídas
  const allLessonsCompleted = subject.lessons.every((l: any) => l.completed);
  const basicUnlocked = allLessonsCompleted;

  return (
    <div className="space-y-10 animate-in fade-in zoom-in-95 duration-700 pb-20">
      <div className="flex items-center justify-between">
        <Link
          href="/materias"
          className="p-2 -ml-2 hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors"
        >
          <ChevronLeft size={24} />
        </Link>
        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-4 py-1.5 glass rounded-full border-white/5">
          Matéria Premium
        </span>
      </div>

      <header className="space-y-6">
        <div className="flex items-center gap-6 animate-in slide-in-from-left-4 duration-500">
          <div className={cn("p-6 rounded-[2rem] shadow-xl transition-transform hover:rotate-3", subject.color || "bg-primary-600")}>
            <SubjectIcon name={subject.icon || "BookOpen"} size={48} className="text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-white tracking-tight">{subject.name}</h1>
            <p className="text-zinc-500 text-lg">Sua trilha definitiva de aprendizado para o ENEM 2026.</p>
          </div>
        </div>

        <div className="glass p-8 rounded-[2.5rem] space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary-500 to-transparent opacity-50" />
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <span className="text-primary-400 font-black text-4xl">{subject.progress}%</span>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Progresso Total</p>
            </div>
            <div className="flex -space-x-2">
              <div className={cn("w-8 h-8 rounded-full border-2 border-zinc-950 flex items-center justify-center transition-colors", subject.progress > 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-900 text-zinc-600")}><CheckCircle2 size={14} /></div>
              <div className={cn("w-8 h-8 rounded-full border-2 border-zinc-950 flex items-center justify-center transition-colors", basicPassed ? "bg-amber-500/30 text-amber-400" : "bg-zinc-900 text-zinc-600")}><Zap size={14} /></div>
              <div className={cn("w-8 h-8 rounded-full border-2 border-zinc-950 flex items-center justify-center transition-colors", finalPassed ? "bg-rose-500/30 text-rose-400 font-bold" : "bg-zinc-900 text-zinc-600")}><Award size={14} /></div>
            </div>
          </div>
          <ProgressBar value={subject.progress} color={subject.color || "bg-primary-600"} className="h-3" />
        </div>
      </header>

      <section className="space-y-6">
        <h2 className="text-2xl font-black text-white px-2">Trilha de Conhecimento</h2>

        <div className="grid grid-cols-1 gap-4 relative">
          <div className="absolute left-10 top-8 bottom-8 w-0.5 bg-white/5 -z-10" />

          {/* 1. Aulas */}
          {subject.lessons.map((lesson: any, i: number) => (
            <div
              key={lesson.id}
              onClick={() => { setActiveItem(lesson); setView("lesson"); }}
              className="glass p-6 rounded-3xl flex items-center gap-6 group hover:translate-x-2 hover:border-primary-500/30 transition-all cursor-pointer border-white/5"
            >
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-black/20",
                lesson.completed ? "bg-emerald-500 text-white" : "bg-primary-600 text-white group-hover:scale-110"
              )}>
                {lesson.completed ? <CheckCircle2 size={24} /> : <Play size={24} fill="currentColor" />}
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Módulo 0{i + 1} • Aula</span>
                <h3 className="text-xl font-bold text-white group-hover:text-primary-400 transition-colors line-clamp-1">
                  {lesson.title}
                </h3>
              </div>
              <Zap className="text-zinc-700 group-hover:text-primary-500 transition-colors" size={24} />
            </div>
          ))}

          {/* 2. Desafio Básico */}
          {basicQuiz && (
            <div
              onClick={async () => {
                if (!basicUnlocked || isGeneratingBasic) return;
                
                // Se o quiz já tem questões, abre direto
                if (basicQuiz.questions && basicQuiz.questions.length > 0) {
                  setActiveItem(basicQuiz);
                  setActiveQuizIsFinal(false);
                  setView("quiz");
                  return;
                }

                // Se não tem questões, gera agora via IA
                setIsGeneratingBasic(true);
                try {
                  const res = await fetch("/api/generate-basic-quiz", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ quizId: basicQuiz.id })
                  });
                  const data = await res.json();
                  
                  if (data.quiz) {
                    setActiveItem(data.quiz);
                    setActiveQuizIsFinal(false);
                    setView("quiz");
                    
                    // Atualiza o estado local para não gerar de novo
                    setSubject((prev: any) => ({
                      ...prev,
                      basicQuiz: data.quiz
                    }));
                  } else {
                    console.error("Falha ao gerar questões do desafio: " + (data.error || "Tente novamente."));
                    // O sistema deve tentar novamente ou cair silenciosamente
                  }
                } catch (e) {
                   console.error("Erro de conexão ao gerar desafio:", e);
                } finally {
                   setIsGeneratingBasic(false);
                }
              }}
              className={cn(
                "glass p-6 rounded-3xl flex items-center gap-6 group transition-all border-white/5 relative overflow-hidden",
                basicUnlocked
                  ? "hover:translate-x-2 hover:border-amber-500/30 cursor-pointer"
                  : "opacity-50 grayscale cursor-not-allowed"
              )}
            >
              {isGeneratingBasic && (
                <div className="absolute inset-0 bg-amber-900/40 backdrop-blur-sm z-20 flex items-center justify-center gap-2 text-amber-300 font-bold uppercase tracking-widest text-xs">
                   <Zap className="animate-pulse" size={16} /> Preparando Desafio de Fixação...
                </div>
              )}
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-black/20 transition-all",
                basicPassed ? "bg-emerald-500" : basicUnlocked ? "bg-amber-500 group-hover:scale-110" : "bg-zinc-700"
              )}>
                {basicPassed ? <CheckCircle2 size={24} /> : basicUnlocked ? <Award size={24} /> : <Lock size={24} />}
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Prática • Fixação</span>
                <div className="flex items-center gap-2">
                  <h3 className={cn(
                    "text-xl font-bold transition-colors",
                    basicUnlocked ? "text-white group-hover:text-amber-400" : "text-zinc-500"
                  )}>
                    Desafio Básico da Aula
                  </h3>
                  {basicUnlocked && (
                    <span className="flex items-center gap-1 text-[8px] px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black uppercase">
                      <CheckCircle2 size={8} /> Alinhado
                    </span>
                  )}
                </div>
                {!basicUnlocked && (
                  <p className="text-xs text-zinc-600 mt-0.5">Conclua a aula para desbloquear</p>
                )}
                {basicPassed && (
                  <p className="text-xs text-emerald-500 mt-0.5 font-bold">✓ 100% conquistado — Prova Final desbloqueada!</p>
                )}
              </div>
              <Zap className={cn("transition-colors", basicUnlocked ? "text-zinc-700 group-hover:text-amber-500" : "text-zinc-800")} size={24} />
            </div>
          )}

          {/* 3. Prova Final Dinâmica */}
          <div
            onClick={async () => {
              if (!basicPassed || isGeneratingFinal) return;
              
              setIsGeneratingFinal(true);
              try {
                const res = await fetch("/api/generate-final-exam", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ subjectId: subject.id })
                });
                const data = await res.json();
                
                if (data.quiz) {
                  setActiveItem(data.quiz);
                  setActiveQuizIsFinal(true);
                  setView("quiz");
                } else {
                  console.error("Falha na IA ao forjar o exame: " + (data.error || "Tente novamente."));
                }
              } catch (e) {
                 console.error("Erro de conexão ao gerar prova:", e);
              } finally {
                 setIsGeneratingFinal(false);
              }
            }}
            className={cn(
              "p-6 rounded-3xl flex items-center gap-6 group transition-all border",
              basicPassed
                ? "glass cursor-pointer hover:translate-x-2 border-rose-500/30 hover:border-rose-500/60 bg-rose-500/5 hover:bg-rose-500/10 animate-in fade-in duration-700 relative overflow-hidden"
                : "glass border-white/5 opacity-40 grayscale cursor-not-allowed"
            )}
          >
            {isGeneratingFinal && (
              <div className="absolute inset-0 bg-rose-900/40 backdrop-blur-sm z-20 flex items-center justify-center gap-2 text-rose-300 font-bold uppercase tracking-widest text-xs">
                 <Flame className="animate-pulse" size={16} /> A IA está gerando sua prova exclusiva...
              </div>
            )}
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-black/20 transition-all",
              basicPassed ? "bg-rose-600 group-hover:scale-110 shadow-rose-500/30" : "bg-zinc-700"
            )}>
              {basicPassed ? <GraduationCap size={24} /> : <Lock size={24} />}
            </div>
            <div className="flex-1">
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-widest",
                basicPassed ? "text-rose-400" : "text-zinc-500"
              )}>
                Certificação • Prova Final (IA)
              </span>
                <div className="flex items-center gap-2">
                  <h3 className={cn(
                    "text-xl font-bold transition-colors",
                    basicPassed ? "text-white group-hover:text-rose-400" : "text-zinc-500 uppercase italic tracking-tighter"
                  )}>
                    {basicPassed ? "Gerar Exame Final Definitivo" : "Bloqueado"}
                  </h3>
                  {basicPassed && (
                    <span className="flex items-center gap-1 text-[8px] px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black uppercase">
                      <CheckCircle2 size={8} /> Alinhado
                    </span>
                  )}
                </div>
              {!basicPassed && (
                <p className="text-xs text-zinc-600 mt-0.5">Tire 100% no Desafio Básico para desbloquear</p>
              )}
            </div>
            {basicPassed && <Flame className="text-rose-500 animate-pulse" size={24} />}
          </div>
        </div>
      </section>
    </div>
  );
}

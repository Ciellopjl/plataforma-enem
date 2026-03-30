"use client";

import { useState, useEffect } from "react";
import { generateStudyPlan } from "./actions";
import { 
  Calendar, Loader2, Sparkles, BookOpen, 
  ChevronRight, Target, Brain, ShieldCheck 
} from "lucide-react";
import { cn } from "@/lib/utils";

type PlanItem = {
  day: string;
  subjects: string[];
  focus: string;
};

export default function PlanoPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ plan: PlanItem[]; advice: string } | null>(null);

  useEffect(() => {
    fetchPlan();
  }, []);

  const fetchPlan = async () => {
    setLoading(true);
    try {
      const res = await generateStudyPlan();
      setData(res);
    } catch {
      alert("Erro ao gerar plano. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toLocaleDateString("pt-BR", { weekday: "long" }).toLowerCase();

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="border-b border-white/5 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary-400 mb-2">
            <Target size={20} className="fill-primary-400/20" />
            <span className="text-xs font-black uppercase tracking-widest">Mentor IA</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">Plano de Estudos Semanal</h1>
          <p className="text-zinc-400">
            Cronograma gerado dinamicamente com base nas suas fraquezas reais nos simulados recentes.
          </p>
        </div>
        <button 
          onClick={fetchPlan}
          disabled={loading}
          className="glass px-6 py-3 rounded-2xl border-white/5 hover:bg-white/5 transition-all text-sm font-bold text-white flex items-center gap-2"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} className="text-primary-400" />}
          Recalcular Plano
        </button>
      </header>

      {loading ? (
        <div className="py-40 flex flex-col items-center justify-center text-center space-y-6 animate-pulse">
           <div className="w-24 h-24 bg-primary-500/10 rounded-full flex items-center justify-center border border-primary-500/20">
              <Brain size={40} className="text-primary-400 animate-bounce" />
           </div>
           <div>
              <h2 className="text-2xl font-black text-white">Mentor IA Analisando seu Desempenho...</h2>
              <p className="text-zinc-500 text-sm">Organizando seu tempo para foco máximo nas matérias difíceis.</p>
           </div>
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Card de Mentor */}
          <div className="xl:col-span-1 space-y-6">
             <div className="glass p-8 rounded-[2rem] border-primary-500/20 bg-primary-500/5 shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                   <ShieldCheck className="text-primary-400 mb-4" size={32} />
                   <h3 className="text-xl font-black text-white mb-2">Conselho do Mentor</h3>
                   <p className="text-zinc-300 italic text-sm leading-relaxed">
                      "{data.advice}"
                   </p>
                </div>
                <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-primary-500/5 blur-[60px] rounded-full" />
             </div>

             <div className="glass p-8 rounded-[2rem] border-white/5">
                <h4 className="font-black text-white text-xs uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                   Objetivo da Semana
                </h4>
                <div className="space-y-4">
                   {[
                      "Reforçar base em Natureza",
                      "Praticar Redação (Competência 3)",
                      "Melhorar TRI em Matemática"
                   ].map(goal => (
                      <div key={goal} className="flex items-center gap-3 p-3 rounded-xl bg-white/2 border border-white/5 text-xs text-zinc-400 font-bold">
                         <ChevronRight size={14} className="text-primary-500" /> {goal}
                      </div>
                   ))}
                </div>
             </div>
          </div>

          {/* Cronograma Interativo */}
          <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
             {data.plan.map((item, i) => {
                const isToday = item.day.toLowerCase().includes(today);
                return (
                  <div 
                    key={i} 
                    className={cn(
                      "glass p-6 rounded-[2rem] border transition-all duration-300 group",
                      isToday ? "border-primary-500/40 bg-primary-500/10 shadow-xl shadow-primary-500/5 ring-4 ring-primary-500/5" : "border-white/5 hover:bg-white/5"
                    )}
                  >
                    <div className="flex items-center justify-between mb-4">
                       <span className={cn(
                          "text-[10px] font-black uppercase tracking-[0.2em]",
                          isToday ? "text-primary-400" : "text-zinc-500"
                       )}>{item.day}</span>
                       {isToday && (
                          <div className="px-2 py-0.5 bg-primary-500 text-white text-[8px] font-black uppercase rounded-full">Hoje</div>
                       )}
                    </div>

                    <div className="space-y-3 mb-4">
                       {item.subjects.map(s => (
                          <div key={s} className="flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                             <div className="w-2 h-2 rounded-full bg-primary-500" />
                             <span className="text-sm font-black text-white">{s}</span>
                          </div>
                       ))}
                    </div>

                    <p className="text-[11px] text-zinc-400 leading-snug bg-black/20 p-3 rounded-xl border border-white/5">
                       {item.focus}
                    </p>
                  </div>
                );
             })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

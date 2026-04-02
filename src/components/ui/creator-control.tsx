"use client";

import { useState } from "react";
import { Zap, ShieldAlert, Plus, Minus, Trophy, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { setAccountTo100Percent, adjustUserPoints, repairQuizzes } from "@/app/dashboard/admin-actions";
import { cn } from "@/lib/utils";

export function CreatorControl() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleRepair = async () => {
    setLoading(true);
    const res = await repairQuizzes();
    setLoading(false);
    if (res.success) {
      setMessage(res.message || "");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handle100Percent = async () => {
    if (!confirm("Isso marcará TODAS as lições e quizzes como concluídos. Confirmar?")) return;
    setLoading(true);
    const res = await setAccountTo100Percent();
    setLoading(false);
    if (res.success) {
      setMessage(res.message || "");
      setTimeout(() => window.location.reload(), 2000);
    }
  };

  const handlePoints = async (amount: number) => {
    setLoading(true);
    const res = await adjustUserPoints(amount);
    setLoading(false);
    if (res.success) {
      setMessage(`Pontos atualizados!`);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <section className="animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="glass px-6 py-3 rounded-2xl border-amber-500/20 bg-amber-500/5 shadow-xl shadow-amber-500/5 flex flex-wrap lg:flex-nowrap items-center gap-6 justify-between relative overflow-hidden group">
        {/* Título Minimalista */}
        <div className="flex items-center gap-3">
          <div className="bg-amber-500/10 p-2 rounded-xl border border-amber-500/30">
            <ShieldAlert className="text-amber-400 w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm font-black text-white tracking-tight uppercase">Controle Mestre</h3>
            <span className="text-[8px] font-bold text-amber-500/60 uppercase tracking-widest leading-none">God Mode</span>
          </div>
        </div>

        {/* Controles Agrupados e Densos */}
        <div className="flex flex-wrap items-center gap-4">
           {/* XP Control */}
           <div className="flex items-center bg-zinc-950/40 border border-white/5 rounded-xl h-10 overflow-hidden">
              <button 
                onClick={() => handlePoints(-100)}
                disabled={loading}
                className="px-3 h-full hover:bg-white/5 text-zinc-500 transition-colors border-r border-white/5"
              >
                <Minus size={12} />
              </button>
              <div className="px-3 text-[9px] font-black uppercase tracking-tighter text-zinc-400">100 XP</div>
              <button 
                onClick={() => handlePoints(100)}
                disabled={loading}
                className="px-3 h-full hover:bg-white/5 text-amber-500 transition-colors border-l border-white/5"
              >
                <Plus size={12} />
              </button>
           </div>

           <div className="h-4 w-px bg-white/5 hidden lg:block" />

           {/* Finish Progrss */}
           <button
             onClick={handle100Percent}
             disabled={loading}
             className="h-10 px-5 bg-white/5 border border-white/5 text-zinc-400 font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-white/10 hover:text-white transition-all flex items-center gap-2 group/btn"
           >
             {loading ? <Loader2 className="animate-spin" size={12} /> : <CheckCircle2 className="group-hover/btn:text-emerald-400 transition-colors" size={12} />}
             Restaurar 100%
           </button>

           {/* Final Exam */}
           <button
             onClick={handleRepair}
             disabled={loading}
             className="h-10 px-5 bg-white text-black font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-zinc-200 transition-all flex items-center gap-2"
           >
             {loading ? <Loader2 className="animate-spin" size={12} /> : <Trophy size={12} />}
             Prova Final
           </button>
        </div>

        {message && (
          <div className="absolute inset-y-0 right-4 flex items-center animate-in slide-in-from-right-4">
             <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase tracking-widest rounded-lg">
                {message}
             </span>
          </div>
        )}
      </div>
    </section>
  );
}

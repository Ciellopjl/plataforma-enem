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
    <section className="animate-in fade-in slide-in-from-top-4 duration-1000">
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="text-amber-400 animate-pulse" size={16} />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500/90 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">Creator God Mode</span>
        <div className="h-px bg-gradient-to-r from-amber-500/20 to-transparent flex-1" />
      </div>

      <div className="glass p-8 rounded-[3rem] border-amber-500/30 bg-amber-500/5 shadow-[0_0_30px_rgba(245,158,11,0.05)] flex flex-col lg:flex-row items-center gap-8 justify-between relative overflow-hidden group">
        {/* Efeito de brilho de fundo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[80px] -z-10 group-hover:bg-amber-500/10 transition-colors duration-1000" />
        
        <div className="flex items-center gap-6">
           <div className="bg-amber-500/20 p-5 rounded-3xl ring-1 ring-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <ShieldAlert className="text-amber-400 w-10 h-10" />
           </div>
           <div>
              <h3 className="text-xl font-black text-white tracking-tight">Controle Mestre</h3>
              <p className="text-xs text-amber-500/70 font-semibold tracking-wide">Privilégios administrativos ativos para o Criador.</p>
           </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
           {/* Adicionar Pontos */}
           <div className="flex items-center bg-zinc-950/50 border border-white/10 rounded-xl overflow-hidden">
              <button 
                onClick={() => handlePoints(-100)}
                disabled={loading}
                className="p-3 hover:bg-white/5 text-zinc-500 transition-colors border-r border-white/10"
              >
                <Minus size={16} />
              </button>
              <div className="px-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">100 XP</div>
              <button 
                onClick={() => handlePoints(100)}
                disabled={loading}
                className="p-3 hover:bg-white/5 text-amber-500 transition-colors border-l border-white/10"
              >
                <Plus size={16} />
              </button>
           </div>

           {/* 100% Progress */}
           <button
             onClick={handle100Percent}
             disabled={loading}
             className="px-8 py-4 bg-zinc-950/80 border border-white/5 text-zinc-300 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-2 group/btn"
           >
             {loading ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 className="group-hover/btn:text-emerald-400 transition-colors" size={14} />}
             Restaurar 100%
           </button>

           {/* Repair Quizzes */}
           <button
             onClick={handleRepair}
             disabled={loading}
             className="px-8 py-4 bg-white text-black font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all flex items-center gap-2"
           >
             {loading ? <Loader2 className="animate-spin" size={14} /> : <Trophy size={14} />}
             Ativar Prova Final
           </button>
        </div>
      </div>
      
      {message && (
        <div className="mt-4 text-center animate-in zoom-in-95 duration-300">
           <span className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full">
              {message}
           </span>
        </div>
      )}
    </section>
  );
}

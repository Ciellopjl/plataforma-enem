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
        <Sparkles className="text-amber-500 animate-pulse" size={16} />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500/80">Creator God Mode</span>
        <div className="h-px bg-amber-500/10 flex-1" />
      </div>

      <div className="glass p-6 rounded-[2.5rem] border-amber-500/20 bg-amber-500/5 flex flex-col md:flex-row items-center gap-6 justify-between">
        <div className="flex items-center gap-5">
           <div className="bg-amber-500/20 p-4 rounded-2xl">
              <ShieldAlert className="text-amber-500 w-8 h-8" />
           </div>
           <div>
              <h3 className="text-lg font-black text-white">Controle Mestre</h3>
              <p className="text-xs text-amber-500/60 font-medium">Somente você, Ciello, tem acesso a estes poderes.</p>
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
             className="px-6 py-3 bg-zinc-900 border border-white/5 text-zinc-400 font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-white/5 transition-all flex items-center gap-2"
           >
             {loading ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
             Restaurar 100%
           </button>

           {/* Repair Quizzes */}
           <button
             onClick={handleRepair}
             disabled={loading}
             className="px-6 py-3 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-zinc-200 transition-all flex items-center gap-2"
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

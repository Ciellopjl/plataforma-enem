"use client";

import { useState } from "react";
import { Zap, ShieldAlert, Plus, Minus, Loader2 } from "lucide-react";
import { adjustUserPoints } from "@/app/dashboard/admin-actions";
import { cn } from "@/lib/utils";

export function CreatorControl() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [xpAmount, setXpAmount] = useState(100);



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
           {/* XP Control Personalizado */}
           <div className="flex items-center bg-zinc-950/40 border border-white/5 rounded-xl h-10 overflow-hidden">
              <button 
                onClick={() => handlePoints(-xpAmount)}
                disabled={loading}
                className="px-3 h-full hover:bg-white/5 text-zinc-500 transition-colors border-r border-white/5"
              >
                <Minus size={12} />
              </button>
              <div className="flex items-center h-full">
                <input 
                  type="number" 
                  value={xpAmount}
                  onChange={(e) => setXpAmount(Number(e.target.value))}
                  className="w-14 bg-transparent border-none text-center text-[10px] font-black text-zinc-100 focus:ring-0 p-0 selection:bg-amber-500/30"
                />
                <span className="text-[8px] font-black uppercase text-zinc-500 pr-3 select-none">XP</span>
              </div>
              <button 
                onClick={() => handlePoints(xpAmount)}
                disabled={loading}
                className="px-3 h-full hover:bg-white/5 text-amber-500 transition-colors border-l border-white/5"
              >
                <Plus size={12} />
              </button>
           </div>

           <div className="h-4 w-px bg-white/5 hidden lg:block" />


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

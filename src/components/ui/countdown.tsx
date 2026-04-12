"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface CountdownProps {
  targetDate: string; // ISO String
}

export function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const target = new Date(targetDate).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = target - now;

      if (distance < 0) {
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
        clearInterval(interval);
        // Pode dar refresh na página automaticamente quando o tempo expirar
        setTimeout(() => window.location.reload(), 2000); 
        return;
      }

      setTimeLeft({
        d: Math.floor(distance / (1000 * 60 * 60 * 24)),
        h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (!isClient || !timeLeft) {
    return (
      <div className="flex items-center justify-center gap-2 text-zinc-500 font-black uppercase text-xs animate-pulse">
        Carregando ciclo...
      </div>
    );
  }

  // Se zerou, mostrar algo diferente
  if (timeLeft.d === 0 && timeLeft.h === 0 && timeLeft.m === 0 && timeLeft.s === 0) {
    return (
      <div className="flex items-center justify-center gap-2 text-rose-500 font-black uppercase text-xs animate-pulse ring-1 ring-rose-500/20 px-4 py-2 rounded-full bg-rose-500/10">
        Calculando novo ciclo...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center justify-center gap-2 text-primary-400 text-[10px] font-black uppercase tracking-[0.3em]">
        <Clock size={12} className="animate-pulse" /> Tempo Restante do Elo
      </div>
      <div className="flex items-center gap-2">
        <TimeUnit value={timeLeft.d} label="Dias" />
        <span className="text-zinc-600 font-bold mb-3">:</span>
        <TimeUnit value={timeLeft.h} label="Hrs" />
        <span className="text-zinc-600 font-bold mb-3">:</span>
        <TimeUnit value={timeLeft.m} label="Min" />
        <span className="text-zinc-600 font-bold mb-3">:</span>
        <TimeUnit value={timeLeft.s} label="Seg" />
      </div>
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-10 h-10 flex items-center justify-center glass bg-primary-500/5 text-primary-400 font-black text-lg rounded-xl border border-primary-500/10 shadow-[0_0_15px_rgba(139,92,246,0.1)]">
        {value.toString().padStart(2, "0")}
      </div>
      <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
        {label}
      </span>
    </div>
  );
}

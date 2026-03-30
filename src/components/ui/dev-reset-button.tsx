"use client";

import { useState } from "react";
import { RefreshCw, Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function DevResetButton() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  const handleReset = async () => {
    setStatus("loading");
    try {
      const res = await fetch("/api/daily-challenge", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatus("done");
      setTimeout(() => {
        setStatus("idle");
        router.refresh(); // Atualiza o dashboard para mostrar o botão de desafio novamente
      }, 1500);
    } catch (err) {
      setStatus("idle");
      alert("Erro ao resetar.");
    }
  };

  return (
    <div className="flex justify-end">
      <button
        onClick={handleReset}
        disabled={status !== "idle"}
        title="Reset de Desenvolvimento — visível apenas para você"
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all
          border-yellow-500/30 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 disabled:opacity-50"
      >
        {status === "loading" ? (
          <><Loader2 size={14} className="animate-spin" /> Resetando...</>
        ) : status === "done" ? (
          <><Check size={14} /> Resetado!</>
        ) : (
          <><RefreshCw size={14} /> 🛠 Reset Desafio Dev</>
        )}
      </button>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { wipeAllStudents } from "../actions";
import { useRouter } from "next/navigation";

interface WipeStudentsButtonProps {
  userEmail: string | null | undefined;
  devEmail: string;
}

export function WipeStudentsButton({ userEmail, devEmail }: WipeStudentsButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  if (userEmail !== devEmail) return null;

  const handleWipe = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const result = await wipeAllStudents();
      if (result.success) {
        alert(result.message);
        router.refresh();
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
      setIsConfirming(false);
    }
  };

  return (
    <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-3xl mt-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h4 className="text-red-400 font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Zona de Extermínio (Exclusivo Dev)
          </h4>
          <p className="text-zinc-500 text-xs mt-1">
            Esta ação apagará <strong>todos os alunos</strong> e seus dados (redações, progressos, medalhas).
          </p>
        </div>

        {!isConfirming ? (
          <button
            onClick={() => setIsConfirming(true)}
            className="bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 px-6 py-2.5 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 border border-red-500/20 active:scale-95"
          >
            <Trash2 className="w-4 h-4" /> Resetar Alunos
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsConfirming(false)}
              disabled={isLoading}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleWipe}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-red-600/20 active:scale-95"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "CONFIRMAR RESET TOTAL"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

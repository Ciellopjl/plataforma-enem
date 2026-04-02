"use client";

import { useState } from "react";
import { User, Lock, Loader2, Info, GraduationCap, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { updateProfile } from "../login/auth-actions";
import { useSession } from "next-auth/react";
import Image from "next/image";

export default function FinalizarCadastroPage() {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Nome inicial vindo do Google (se houver)
  const initialName = session?.user?.name || "";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await updateProfile(formData);
      if (res.success) {
        // Sênior: Forçar atualização da sessão no cliente para limpar o 'needsPassword'
        await update({ needsPassword: false });
        
        // Redireciona para o dashboard com reload total
        window.location.href = "/dashboard";
      } else {
        setError(res.error || "Algo deu errado.");
      }
    } catch (err: any) {
      setError("Erro ao conectar com o servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-zinc-950 font-sans relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary-600/10 blur-[120px] rounded-full mix-blend-screen -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/10 blur-[100px] rounded-full mix-blend-screen -z-10" />

      <div className="w-full max-w-xl space-y-8 animate-in slide-in-from-bottom-12 duration-1000">
        
        {/* Branding Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-[3rem] bg-zinc-900 border border-white/10 text-primary-500 mb-2 relative group overflow-hidden">
             <div className="absolute inset-0 bg-primary-500/20 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
             <Image src="/logo-enem.png" alt="Logo" width={60} height={60} className="relative z-10" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
            QUASE <span className="text-primary-500">PRONTO!</span>
          </h1>
          <p className="text-zinc-500 text-[10px] font-black tracking-[0.4em] uppercase">Módulo de Reconhecimento Sênior</p>
        </div>

        {/* Console Box */}
        <div className="glass p-8 sm:p-12 rounded-[3.5rem] border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-3xl bg-zinc-900/40 border-t-primary-500/20">
          
          <div className="space-y-8">
            <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-white font-black text-xs uppercase tracking-widest">
                    <ShieldCheck className="text-primary-500" size={16} /> Identidade Digital
                </div>
                <p className="text-zinc-500 text-xs font-medium leading-relaxed max-w-sm mx-auto">
                    Para garantir sua vaga, defina seu nome oficial (que aparecerá nos certificados e no Ranking) e uma senha segura de acesso.
                </p>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-xs font-bold text-red-400 flex items-center gap-3 animate-pulse">
                <Info size={16} /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Nome do Aluno */}
              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-widest uppercase text-zinc-500 ml-1">Nome Completo (Auditado por IA)</label>
                <div className="relative group">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-primary-500 transition-colors" size={20} />
                  <input 
                    name="name"
                    type="text" 
                    defaultValue={initialName}
                    placeholder="Como quer ser chamado?"
                    required
                    className="w-full bg-black/40 border border-white/5 rounded-[2rem] py-5 pl-14 pr-6 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all font-medium"
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[9px] font-black text-zinc-700 uppercase tracking-tighter opacity-0 group-focus-within:opacity-100 transition-opacity">
                    SEM APELIDOS IMPRÓPRIOS
                  </div>
                </div>
              </div>

              {/* Senha de Acesso */}
              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-widest uppercase text-zinc-500 ml-1">Crie sua Senha Secreta</label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-primary-500 transition-colors" size={20} />
                  <input 
                    name="password"
                    type={showPassword ? "text" : "password"} 
                    placeholder="Mínimo 6 caracteres"
                    required
                    minLength={6}
                    className="w-full bg-black/40 border border-white/5 rounded-[2rem] py-5 pl-14 pr-12 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="bg-white/5 p-4 rounded-3xl border border-white/5 flex items-start gap-3">
                <Info className="text-zinc-500 shrink-0 mt-0.5" size={14} />
                <p className="text-[10px] leading-relaxed text-zinc-600 italic">
                  Sua conta do Google continuará funcionando. A senha é um nível adicional de segurança caso você mude o método de acesso no futuro.
                </p>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full relative group mt-4 h-16"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-indigo-600 rounded-[2rem] blur-md opacity-50 group-hover:opacity-100 transition-opacity duration-500 shadow-[0_10px_30px_#8b5cf633]" />
                <div className="relative h-full flex items-center justify-center gap-3 bg-white text-zinc-950 font-black text-sm uppercase tracking-widest rounded-[2rem] hover:bg-zinc-100 active:scale-[0.98] transition-all disabled:opacity-50">
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                    <>EFETIVAR MATRÍCULA <GraduationCap size={20} /></>
                  )}
                </div>
              </button>
            </form>
          </div>
        </div>

        {/* Final Disclaimer */}
        <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700">
          Mestre ENEM • Privatização de Dados Criptografados
        </p>
      </div>
    </div>
  );
}

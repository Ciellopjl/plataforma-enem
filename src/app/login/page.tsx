"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // Inicia o fluxo de login do Google através do NextAuth client
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("Erro ao fazer login:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 animate-in fade-in duration-1000">
      <div className="w-full max-w-[420px] space-y-8 animate-in slide-in-from-bottom-8 duration-700">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2.5rem] bg-primary-600/10 border border-primary-500/20 text-primary-500 mb-2 relative group overflow-hidden">
             <div className="absolute inset-0 bg-primary-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
             <Image 
                src="/logo-enem.png" 
                alt="Logo ENEM 2026" 
                width={70} 
                height={70} 
                className="relative z-10 transition-transform duration-500 group-hover:scale-110 object-contain"
             />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight italic uppercase">ENEM <span className="text-primary-500">2026</span></h1>
          <p className="text-zinc-500 text-sm font-bold tracking-widest uppercase">Portal do Aluno</p>
        </div>

        <div className="glass p-10 rounded-[2.5rem] border-white/[0.05] shadow-2xl space-y-8 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary-500/10 blur-[60px] rounded-full" />
          
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-zinc-100 font-bold mb-2">
              <Zap className="text-primary-500" size={20} fill="currentColor" />
              Acesso Exclusivo
            </div>
            
            <p className="text-zinc-500 text-sm leading-relaxed">
              Sincronize seu progresso e ranking utilizando sua conta Google oficial da plataforma.
            </p>

            <button 
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-4 py-4 bg-white text-black hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-3xl font-black text-lg active:scale-[0.98] shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              </div>
              {isLoading ? "Validando..." : "Entrar com Google"}
            </button>
          </div>

          <div className="pt-4 border-t border-white/[0.05] text-center">
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
              Segurança Criptografada • Neon DB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

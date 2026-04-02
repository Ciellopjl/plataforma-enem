"use client";

import { useState, useEffect } from "react";
import { Zap, ShieldCheck, Mail, Lock, Loader2, Info, Eye, EyeOff } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { registerUser } from "./actions";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);
  const router = useRouter();

  // Sênior: Capturar erro de acesso negado pelo Google (Trava de Auto-Registro)
  useEffect(() => {
    if (errorParam === "AccessDenied" || errorParam === "OAuthSignin") {
      setMessage({ 
        text: "Este Gmail não está cadastrado. Realize sua 'Nova Matrícula' primeiro para liberar o acesso.", 
        type: "error" 
      });
      setIsLogin(false); // Joga o cara pra aba de cadastro pra facilitar
    }
  }, [errorParam]);

  // Função para Entrar
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setMessage({ text: result.error, type: "error" });
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setMessage({ text: "Erro inesperado ao conectar.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para Cadastrar (Obs: Agora o cadastro é via Google, mas mantemos a função para referência se necessário)
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await registerUser(formData);
      if (res.success) {
        setMessage({ text: res.message!, type: "success" });
        setTimeout(() => {
          setIsLogin(true); // Joga de volta pro Login
          setMessage(null);
        }, 3000);
      } else {
        setMessage({ text: res.error!, type: "error" });
      }
    } catch (error) {
      setMessage({ text: "Servidor fora do ar.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-10 flex flex-col justify-center items-center p-4 bg-zinc-950 font-sans relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary-500/10 blur-[120px] rounded-full mix-blend-screen -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-purple-500/10 blur-[100px] rounded-full mix-blend-screen -z-10" />

      <div className="w-full max-w-md space-y-8 animate-in slide-in-from-bottom-8 duration-700">
        
        {/* Header Branding */}
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
          <p className="text-zinc-500 text-xs font-black tracking-widest uppercase">Sistema de Matrícula Blindada</p>
        </div>

        {/* Console Glassmorphism */}
        <div className="glass p-8 sm:p-10 rounded-[2.5rem] border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-2xl bg-zinc-900/40">
          
          {/* Tab Selector */}
          <div className="flex bg-black/40 p-1 rounded-2xl mb-8 relative border border-white/5">
            <div 
              className="absolute inset-y-1 w-[calc(50%-4px)] bg-zinc-800/80 rounded-xl shadow-lg border border-white/10 transition-all duration-300 ease-out"
              style={{ left: isLogin ? '4px' : 'calc(50%)' }}
            />
            <button 
              onClick={() => { setIsLogin(true); setMessage(null); }}
              className={`flex-1 py-3 text-sm font-bold z-10 transition-colors ${isLogin ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Entrar na Conta
            </button>
            <button 
              onClick={() => { setIsLogin(false); setMessage(null); }}
              className={`flex-1 py-3 text-sm font-bold z-10 transition-colors ${!isLogin ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Nova Matrícula
            </button>
          </div>

          <div className="space-y-6">
            {isLogin && (
              <>
                <div className="flex items-center gap-2 text-zinc-100 font-bold text-sm tracking-wide">
                  <Zap className="text-primary-500" size={18} fill="currentColor" /> Portal do Aluno
                </div>
                <p className="text-zinc-500 text-xs font-medium leading-relaxed mb-6">
                  Sua sessão permanecerá criptografada no aparelho. Bem-vindo de volta.
                </p>
              </>
            )}

            {/* Error / Success Message */}
            {message && (
              <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2 border ${
                message.type === "error" 
                  ? "bg-red-500/10 text-red-400 border-red-500/20" 
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              }`}>
                <div className="shrink-0"><Info size={16} /></div> 
                <span>{message.text}</span>
              </div>
            )}

            {/* Dynamic Form / Info Area */}
            {isLogin ? (
              <form onSubmit={handleLogin} className="space-y-4">
                {/* E-mail Input */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black tracking-widest uppercase text-zinc-500 ml-1">Gmail do Google</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                    <input 
                      name="email"
                      type="email" 
                      placeholder="voce@gmail.com"
                      required
                      className="w-full bg-black/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all font-medium custom-placeholder"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black tracking-widest uppercase text-zinc-500 ml-1">Senha de Acesso</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-primary-500 transition-colors" size={18} />
                    <input 
                      name="password"
                      type={showPassword ? "text" : "password"} 
                      placeholder="Sua senha..."
                      required
                      className="w-full bg-black/50 border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <div className="flex justify-end pr-2 mt-2">
                    <button 
                      type="button"
                      onClick={() => router.push("/login/esqueceu-senha")}
                      className="text-[10px] font-black uppercase text-zinc-600 hover:text-primary-500 transition-colors tracking-widest cursor-pointer"
                    >
                      Esqueci minha senha
                    </button>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full relative group mt-6"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-400 rounded-2xl blur-md opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative flex items-center justify-center gap-3 py-4 bg-zinc-100 text-zinc-950 font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-white active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100">
                    {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Autorizar Acesso"}
                  </div>
                </button>
              </form>
            ) : (
              <div className="py-8 flex flex-col items-center justify-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="relative">
                   <div className="absolute inset-0 bg-primary-500/20 blur-2xl rounded-full scale-150 animate-pulse" />
                   <div className="relative w-16 h-16 rounded-[2rem] bg-zinc-900 border border-white/10 flex items-center justify-center text-primary-500 shadow-2xl">
                      <ShieldCheck size={32} />
                   </div>
                </div>
                
                <div className="text-center space-y-2">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">Verificação de Identidade</h3>
                  <p className="text-[11px] text-zinc-500 leading-relaxed font-medium max-w-[240px] mx-auto">
                    Para garantir a proteção dos dados e certificados, as novas matrículas são exclusivas via Google Seguro.
                  </p>
                </div>
              </div>
            )}

            {/* Separator - Only show on Login tab */}
            {isLogin && (
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.3em]">
                  <span className="bg-zinc-900 px-4 text-zinc-600">Ou continue com</span>
                </div>
              </div>
            )}

            {/* Google Login Button */}
            <button 
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="w-full glass flex items-center justify-center gap-3 py-4 rounded-2xl border border-white/5 hover:border-white/10 hover:bg-white/[0.02] transition-all group"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path
                  fill="#ffffff"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#ffffff"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#ffffff"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="#ffffff"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-zinc-300 font-bold text-xs uppercase tracking-widest">
                {isLogin ? "Entrar com Google" : "Cadastrar com Google"}
              </span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="text-center pt-2">
           <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-black inline-flex items-center gap-2">
             <ShieldCheck size={12} className="text-primary-500" /> Auto-Login e Criptografia Hashed
           </p>
        </div>

      </div>
    </div>
  );
}

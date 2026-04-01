"use client";

import { useState } from "react";
import { Mail, ArrowLeft, Loader2, Info, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { requestResetAction } from "../password-reset-actions";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "error" | "info" | "success" } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const res = await requestResetAction(email);
      if (res.success) {
        setMessage({ text: res.message!, type: "success" });
      } else {
        setMessage({ text: res.error!, type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Servidor indisponível.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-600/5 blur-[120px] rounded-full -z-10" />

      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Link 
          href="/login" 
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Voltar para o Login
        </Link>

        <div className="text-left space-y-2">
          <h1 className="text-3xl font-black text-white tracking-tight italic uppercase">RECUPERAR <span className="text-primary-500">CONTA</span></h1>
          <p className="text-zinc-500 text-xs font-medium">Enviaremos um código de 6 dígitos para o seu e-mail cadastrado.</p>
        </div>

        <div className="glass p-8 rounded-[2.5rem] border-white/10 shadow-2xl bg-zinc-900/40 backdrop-blur-2xl">
          {message?.type === "success" ? (
             <div className="text-center space-y-6 animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto text-emerald-500">
                   <CheckCircle2 size={40} />
                </div>
                <div className="space-y-2">
                   <h2 className="text-white font-black uppercase tracking-tight">E-mail Enviado!</h2>
                   <p className="text-zinc-500 text-xs font-medium leading-relaxed">
                      Verifique sua caixa de entrada (ou o terminal se for dev). <br /> 
                      O código expira em 60 minutos.
                   </p>
                </div>
                <Link 
                  href={`/login/resetar-senha?email=${encodeURIComponent(email)}`}
                  className="block w-full py-4 bg-primary-500 hover:bg-primary-400 text-zinc-950 font-black text-sm uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                >
                  Inserir Código Agora
                </Link>
             </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {message && (
                <div className={`p-4 rounded-xl text-[10px] font-black uppercase tracking-wide flex items-center gap-3 border ${
                  message.type === "error" ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-primary-500/10 text-primary-500 border-primary-500/20"
                }`}>
                  <Info size={14} /> {message.text}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-widest uppercase text-zinc-600 ml-1">Seu Gmail Cadastrado</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" size={18} />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="voce@gmail.com"
                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-medium"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-zinc-100 hover:bg-white text-zinc-950 font-black text-sm uppercase tracking-widest rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Solicitar Código"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

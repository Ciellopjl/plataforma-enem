"use client";

import { useState, Suspense } from "react";
import { Lock, ArrowLeft, Loader2, Info, CheckCircle2, ShieldEllipsis } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { resetPasswordAction } from "../password-reset-actions";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";
  
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage({ text: "As senhas não coincidem.", type: "error" });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ text: "A senha deve ter no mínimo 6 caracteres.", type: "error" });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await resetPasswordAction(email, code, newPassword);
      if (res.success) {
        setMessage({ text: res.message!, type: "success" });
        setTimeout(() => {
          router.push("/login"); // Redireciona pro login após sucesso
        }, 3000);
      } else {
        setMessage({ text: res.error!, type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Servidor fora do ar.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Link 
        href="/login/esqueceu-senha" 
        className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Voltar
      </Link>

      <div className="text-left space-y-2">
        <h1 className="text-3xl font-black text-white tracking-tight italic uppercase">NOVA <span className="text-primary-500">SENHA</span></h1>
        <p className="text-zinc-500 text-xs font-medium">Insira o código de 6 dígitos enviado para seu e-mail.</p>
      </div>

      <div className="glass p-8 rounded-[2.5rem] border-white/10 shadow-2xl bg-zinc-900/40 backdrop-blur-2xl overflow-hidden relative">
        {message?.type === "success" ? (
          <div className="text-center space-y-6 animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto text-emerald-500">
                <CheckCircle2 size={40} />
            </div>
            <div className="space-y-2">
                <h2 className="text-white font-black uppercase tracking-tight">Senha Restaurada!</h2>
                <p className="text-zinc-500 text-xs font-medium leading-relaxed">
                  Sua conta foi reativada com a nova credencial. <br />
                  Redirecionando para o login...
                </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {message && (
              <div className={`p-4 rounded-xl text-[10px] font-black uppercase tracking-wide flex items-center gap-3 border ${
                message.type === "error" ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
              }`}>
                <Info size={14} /> {message.text}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black tracking-widest uppercase text-zinc-600 ml-1">Código de 6 Dígitos</label>
              <div className="relative">
                <ShieldEllipsis className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" size={18} />
                <input 
                  type="text" 
                  required
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="EX: 123456"
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-medium tracking-[0.5em] text-center"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black tracking-widest uppercase text-zinc-600 ml-1">Nova Senha Forte</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" size={18} />
                <input 
                  type="password" 
                  required
                  min={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nova senha..."
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black tracking-widest uppercase text-zinc-600 ml-1">Confirme a Nova Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" size={18} />
                <input 
                  type="password" 
                  required
                  min={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme a senha..."
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-medium"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-zinc-100 hover:bg-white text-zinc-950 font-black text-sm uppercase tracking-widest rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Redefinir Agora"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-600/5 blur-[120px] rounded-full -z-10" />
      <Suspense fallback={<Loader2 className="animate-spin text-white" size={40} />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}

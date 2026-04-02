'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/base-ui';
import { Bot, RefreshCcw, ShieldAlert, MessageCircle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log do sênior para monitoramento
    console.error('[GLOBAL ERROR]:', error);
  }, [error]);

  const isConnectionError = 
    error.message?.includes('P1001') || 
    error.message?.includes('P2024') || 
    error.message?.toLowerCase().includes('database') ||
    error.message?.toLowerCase().includes('connection');

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-primary-500/20 blur-[60px] rounded-full animate-pulse" />
        <div className="bg-zinc-900 border border-white/5 p-6 rounded-[2.5rem] shadow-2xl relative z-10">
          <Bot className="w-16 h-16 text-primary-500" />
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-4 border-zinc-900 animate-bounce" />
        </div>
      </div>

      <h1 className="text-3xl font-black text-white mb-4 tracking-tight">
        {isConnectionError ? "Sincronizando com a Base de Dados..." : "Opa! Ocorreu um Imprevisto"}
      </h1>
      
      <p className="text-zinc-400 max-w-md mb-8 leading-relaxed">
        {isConnectionError 
          ? "O Mestre ENEM está organizando as questões agora! Isso acontece quando nosso banco de dados entra em modo de economia. Aguarde alguns segundos."
          : "Tivemos um pequeno soluço técnico no sistema. Nossos engenheiros já foram notificados (ou o Mestre ENEM está tirando uma soneca)."}
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        <Button 
          onClick={() => reset()}
          className="flex-1 py-6 bg-primary-600 hover:bg-primary-500 text-white font-black rounded-2xl shadow-xl shadow-primary-600/20 group"
        >
          <RefreshCcw className="mr-2 group-hover:rotate-180 transition-transform duration-500" size={20} />
          Tentar Novamente
        </Button>
        
        <Button
          variant="secondary"
          className="flex-1 py-6 border-white/10 hover:bg-zinc-800 transition-all rounded-2xl"
          onClick={() => window.location.href = '/'}
        >
           Painel Principal
        </Button>
      </div>

      <div className="mt-12 p-4 bg-zinc-950/50 border border-white/5 rounded-2xl flex items-center gap-3 text-left max-w-xs transition-opacity opacity-50 hover:opacity-100">
        <ShieldAlert className="text-primary-500 shrink-0" size={24} />
        <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest leading-normal">
          Modo de Resiliência Ativo<br/>
          <span className="text-zinc-600 font-medium lowercase italic">
            {(error as any).code || 'Runtime Exception'} • {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
}

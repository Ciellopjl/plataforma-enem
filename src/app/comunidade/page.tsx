export const dynamic = 'force-dynamic';
import { Send, Users, Star, MessageSquare, Zap, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/base-ui";
import prisma from "@/lib/prisma";
import { cn } from "@/lib/utils";

// Interface para garantir tipagem sênior e sanar erros de lint do Prisma Resource
interface ResourceItem {
  id: string;
  title: string;
  link: string;
  type: string;
  category: string;
  description: string | null;
}

export default async function ComunidadePage() {
  // @ts-ignore - Prisma em sincronização
  const resources = await prisma.resource.findMany({
    where: { 
      type: { in: ["Comunidade", "Grupo", "Canal"] } 
    }
  }) as ResourceItem[];

  const categories = ["Geral", "Conteúdo", "Específico"];

  return (
    <div className="space-y-16 pb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <header className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
          Ouro Puro: <span className="text-primary-500">Telegram</span>
        </h1>
        <p className="text-zinc-500 leading-relaxed text-lg">
          Acesse os melhores grupos e canais do Brasil. Conteúdo bruto, aulas vazadas, PDFs e a motivação que você precisa para o 900+.
        </p>
      </header>

      {categories.map((cat) => {
        const catResources = resources.filter((r: ResourceItem) => r.category === cat);
        if (catResources.length === 0) return null;

        return (
          <section key={cat} className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 bg-primary-500 rounded-full" />
              <h2 className="text-2xl font-black text-white uppercase tracking-wider">{cat}</h2>
              <span className="text-xs font-bold px-3 py-1 bg-zinc-800 text-zinc-500 rounded-full">
                {catResources.length} GRUPOS
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {catResources.map((res: ResourceItem) => (
                <a 
                  key={res.id} 
                  href={res.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="glass p-6 rounded-[2rem] border-white/[0.03] hover:border-primary-500/20 hover:bg-white/[0.02] transition-all group relative overflow-hidden flex flex-col justify-between"
                >
                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-500 group-hover:scale-110 transition-transform">
                        <Send size={24} fill="currentColor" />
                      </div>
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg",
                        res.type === "Comunidade" ? "bg-emerald-500/10 text-emerald-500" : 
                        res.type === "Canal" ? "bg-purple-500/10 text-purple-500" : "bg-primary-500/10 text-primary-500"
                      )}>
                        {res.type}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors leading-snug">
                      {res.title}
                    </h3>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                     <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Entrar Agora</span>
                     <ExternalLink size={14} className="text-zinc-700 group-hover:text-primary-500 transition-colors" />
                  </div>

                  {/* Ambient glow */}
                  <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-sky-500/5 blur-3xl rounded-full" />
                </a>
              ))}
            </div>
          </section>
        );
      })}

      {/* Hero Community Alt */}
      <section className="glass rounded-[3rem] p-12 border-primary-500/10 bg-primary-500/[0.02] overflow-hidden relative">
        <div className="flex flex-col md:flex-row items-center gap-12 relative z-10 text-center md:text-left">
            <div className="p-8 rounded-[3rem] bg-zinc-900 border border-white/5 shadow-2xl shrink-0 group hover:rotate-2 transition-transform">
                <Users size={64} className="text-primary-500" />
            </div>
            <div className="space-y-6 flex-1">
                <h2 className="text-3xl md:text-4xl font-black text-white">Engajamento & Retenção</h2>
                <p className="text-zinc-500 leading-relaxed font-medium">
                  Não estude sozinho. Junte-se a milhares de estudantes que compartilham o mesmo objetivo. 
                  A troca de conhecimento é o segredo para a consistência.
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
                        <Zap size={14} className="text-yellow-500" fill="currentColor" />
                        Dicas Exclusivas
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
                        <Star size={14} className="text-primary-500" fill="currentColor" />
                        Materiais Inéditos
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
                        <MessageSquare size={14} className="text-emerald-500" fill="currentColor" />
                        Suporte Mútuo
                    </div>
                </div>
            </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 blur-[100px] rounded-full" />
      </section>
    </div>
  );
}

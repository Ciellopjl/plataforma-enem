import { ExternalLink, ClipboardList, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/base-ui";
import prisma from "@/lib/prisma";

// Interface sênior para sanar erros de lint do Prisma Resource
interface ResourceItem {
  id: string;
  title: string;
  link: string;
  type: string;
  description: string | null;
}

export default async function SimuladosPage() {
  // @ts-ignore - Prisma em sincronização de tipos
  const simulados = await prisma.resource.findMany({
    where: { type: "Simulados" }
  }) as ResourceItem[];

  return (
    <div className="space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <header className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
          Treine sua <span className="text-primary-500">Aprovação</span>
        </h1>
        <p className="text-zinc-500 max-w-lg mx-auto leading-relaxed">
          Os simulados são a base do seu progresso. Treine semanalmente para subir no ranking e dominar o ENEM 2026.
        </p>
      </header>

      {/* Grid de Simulados */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {simulados.length > 0 ? simulados.map((simu: ResourceItem) => (
          <div key={simu.id} className="glass p-8 rounded-[2.5rem] border-white/[0.05] hover:border-primary-500/20 transition-all group flex flex-col justify-between h-full">
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-900 w-fit group-hover:scale-110 transition-transform">
                <ClipboardList className="text-primary-500" size={32} />
              </div>
              <h3 className="text-xl font-bold text-white leading-tight">{simu.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{simu.description}</p>
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/[0.03]">
              <a href={simu.link} target="_blank" rel="noopener noreferrer">
                <Button className="w-full py-4 text-xs font-black uppercase tracking-widest gap-2">
                  Acessar Simulado <ExternalLink size={14} />
                </Button>
              </a>
            </div>
          </div>
        )) : (
            <div className="col-span-full text-center py-24 glass rounded-[3rem] text-zinc-600">
              Nenhum simulado cadastrado no momento. 📉🎓💎✨🚀
            </div>
        )}
      </div>

      {/* Info Stats */}
      <section className="glass rounded-[3rem] p-10 border-emerald-500/10 bg-emerald-500/[0.02]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center">
            <div className="space-y-2">
                <Target className="text-emerald-500 mx-auto" size={32} />
                <div className="text-2xl font-black text-white">Treino Semanal</div>
                <p className="text-zinc-500 text-xs">Aumente sua retenção em 40%.</p>
            </div>
            <div className="space-y-2 border-y md:border-y-0 md:border-x border-white/5 py-8 md:py-0">
                <TrendingUp className="text-primary-500 mx-auto" size={32} />
                <div className="text-2xl font-black text-white">Ranking Real</div>
                <p className="text-zinc-500 text-xs">Simulados geram pontos bônus.</p>
            </div>
            <div className="px-6">
                <Button variant="secondary" className="w-full py-6 text-sm font-bold bg-zinc-800">
                    Sugerir Simulado
                </Button>
            </div>
        </div>
      </section>
    </div>
  );
}

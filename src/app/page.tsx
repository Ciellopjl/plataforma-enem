import { GraduationCap, Trophy, Target, ArrowRight, Star, CheckCircle2, LayoutDashboard, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/base-ui";

export default function LandingPage() {
  return (
    <div className="space-y-24 py-12 md:py-24 animate-in fade-in duration-1000">
      {/* Hero Section */}
      <section className="text-center relative max-w-4xl mx-auto space-y-8 px-4">
        <div 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-primary-500/20 text-primary-400 text-sm font-bold mb-4 shadow-xl animate-in fade-in zoom-in duration-1000"
        >
          <Zap size={16} fill="currentColor" />
          <span>VAGAS ABERTAS PARA 2026</span>
        </div>
        
        <h1 
          className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[1] mb-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200"
        >
          Domine o <span className="text-primary-500">ENEM 2026</span> com Inteligência
        </h1>

        <p 
          className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300"
        >
          A plataforma de estudos que transforma seu esforço em conquistas Reais através de Gamificação, Ranking e os Melhores Materiais.
        </p>

        <div 
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500"
        >
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" className="w-full group py-6 px-10 text-xl font-black">
              Começar Agora
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-primary-600/5 blur-[120px] rounded-full -z-10" />
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
        {[
          { 
            title: "Gamificação Real", 
            desc: "Ganhe pontos a cada conteúdo concluído e suba no ranking.",
            icon: <Trophy className="text-yellow-500" size={32} />,
            color: "border-yellow-500/10 hover:border-yellow-500/30"
          },
          { 
            title: "Foco no 900+", 
            desc: "Materiais curados pelos melhores professores do Brasil.",
            icon: <Target className="text-primary-500" size={32} />,
            color: "border-primary-500/10 hover:border-primary-500/30"
          },
          { 
            title: "Ranking Ciclo 3", 
            desc: "Competição renovada a cada 3 semanas para máxima motivação.",
            icon: <Star className="text-orange-500" size={32} />,
            color: "border-orange-500/10 hover:border-orange-500/30"
          }
        ].map((feature, i) => (
          <div 
            key={i}
            className={`glass p-8 rounded-[2.5rem] border ${feature.color} transition-all group animate-in fade-in slide-in-from-bottom-12 duration-1000`}
            style={{ animationDelay: `${i * 200}ms` }}
          >
            <div className="mb-6 p-4 rounded-2xl bg-zinc-900 w-fit group-hover:scale-110 transition-transform duration-500">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
            <p className="text-zinc-500 leading-relaxed text-sm">{feature.desc}</p>
          </div>
        ))}
      </section>

      {/* Social Proof / Stats */}
      <section className="glass rounded-[3rem] p-12 max-w-6xl mx-auto border-white/[0.03] text-center space-y-12 mx-4">
        <h2 className="text-3xl font-black text-white">Resultados que Impressionam</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: "Estudantes", value: "15k+" },
            { label: "Questões", value: "50k+" },
            { label: "Aprovações", value: "2.5k+" },
            { label: "Páginas", value: "Premium" },
          ].map((stat, i) => (
            <div key={i} className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-1000" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="text-4xl font-black text-primary-400">{stat.value}</div>
              <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="text-center pb-24 px-4">
        <h2 className="text-4xl font-black text-white mb-8">Sua Aprovação Começa Aqui</h2>
        <Link href="/login">
          <Button size="lg" className="px-12 py-8 text-2xl font-black rounded-3xl animate-glow">
            Entrar na Plataforma
          </Button>
        </Link>
      </section>
    </div>
  );
}

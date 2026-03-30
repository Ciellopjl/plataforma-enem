import Link from "next/link";
import { Button } from "@/components/ui/base-ui";
import { SearchX, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8 animate-in fade-in duration-1000">
      <div className="relative">
        <div className="p-8 rounded-[3rem] bg-zinc-900 border border-white/5 shadow-2xl relative z-10">
          <SearchX size={80} className="text-zinc-500" />
        </div>
        <div className="absolute inset-0 bg-primary-500/20 blur-[100px] rounded-full -z-10" />
      </div>
      
      <div className="space-y-4 max-w-md">
        <h1 className="text-4xl font-black text-white">Caminho Desconhecido</h1>
        <p className="text-zinc-500 leading-relaxed font-medium">
          Parece que você desviou do cronograma. Essa página não existe na plataforma ENEM 2026. 📉🎓💎🚀✨
        </p>
      </div>

      <Link href="/dashboard">
        <Button className="px-10 py-6 text-lg font-black rounded-3xl gap-2 active:scale-95 transition-all">
          <Home size={20} />
          Voltar para o Painel
        </Button>
      </Link>
    </div>
  );
}

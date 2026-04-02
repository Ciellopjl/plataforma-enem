"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Trophy, BookOpen, LayoutDashboard, User, Users, Star, Award, BarChart3, Moon, PenTool, Calendar, LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";

const navItems = [
  { name: "Painel", href: "/dashboard", icon: LayoutDashboard },
  { name: "Matérias", href: "/materias", icon: BookOpen },
  { name: "Plano", href: "/plano", icon: Calendar },
  { name: "Análise", href: "/analise", icon: BarChart3 },
  { name: "Revisão", href: "/revisao", icon: Moon },
  { name: "Redação", href: "/redacao", icon: PenTool },
  { name: "Simulados", href: "/simulados", icon: Trophy },
  { name: "Biblioteca", icon: BookOpen, href: "/biblioteca" },
  { name: "Ranking", href: "/ranking", icon: Star },
  { name: "Conquistas", href: "/conquistas", icon: Award },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Esconder Navbar na página de login e durante simulados (Modo Foco)
  if (pathname === "/login" || pathname.startsWith("/simulados/desafio/")) return null;

  const userImage = session?.user?.image;

  return (
    <>
      {/* Desktop Navbar (Top Fixed) */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 px-4 py-4">
        <div className="max-w-[1500px] mx-auto">
          <div className="glass rounded-[2rem] px-4 xl:px-8 py-4 flex items-center justify-between border-white/[0.05] shadow-2xl backdrop-blur-3xl">
            <Link href="/dashboard" className="flex items-center gap-2 xl:gap-3 group shrink-0">
              <div className="relative w-10 h-10 xl:w-12 xl:h-12 rounded-xl overflow-hidden bg-primary-500/10 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                <Image 
                   src="/logo-enem.png" 
                   alt="ENEM 2026" 
                   width={36} 
                   height={36} 
                   className="object-contain"
                />
              </div>
              <div className="flex flex-col hidden sm:flex">
                <span className="font-black text-white text-base xl:text-lg leading-none tracking-tight uppercase">ENEM 2026</span>
                <span className="text-[9px] xl:text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Plataforma</span>
              </div>
            </Link>

            <div className="flex items-center gap-1 mx-2 overflow-hidden">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative px-2.5 xl:px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 text-sm font-bold shrink-0",
                      isActive 
                        ? "text-primary-400 bg-primary-500/10 border border-primary-500/20 shadow-[0_0_15px_rgba(139,92,246,0.1)]" 
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02]"
                    )}
                  >
                    <item.icon size={18} className={cn("transition-transform duration-300", isActive && "scale-110")} />
                    <span className={cn(
                      "transition-all duration-300 overflow-hidden whitespace-nowrap",
                      isActive ? "w-auto opacity-100 ml-0" : "w-0 xl:w-auto opacity-0 xl:opacity-100 xl:ml-0 hidden xl:inline-block"
                    )}>
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-2 xl:gap-4 shrink-0">
              <Link href="/perfil" title="Meu Perfil">
                <button className="relative w-10 h-10 xl:w-11 xl:h-11 rounded-2xl bg-zinc-900 border border-white/5 text-zinc-400 hover:border-primary-500/30 transition-all group overflow-hidden flex items-center justify-center">
                   {userImage ? (
                      <Image 
                         src={userImage} 
                         alt="Perfil" 
                         width={44} 
                         height={44} 
                         className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                   ) : (
                      <User size={20} className="group-hover:scale-110 transition-transform duration-500" />
                   )}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navbar (Bottom Floating Bar) */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[96%] max-w-md">
        <div className="glass rounded-[2.5rem] px-4 py-3 flex items-center gap-6 overflow-x-auto no-scrollbar snap-x border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative p-3 rounded-2xl transition-all duration-300 flex flex-col items-center gap-1",
                  isActive ? "text-primary-400 scale-110" : "text-zinc-500"
                )}
              >
                <div className="relative">
                    <item.icon size={22} className={cn(isActive ? "animate-pulse" : "")} />
                    {isActive && (
                        <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-primary-500 rounded-full shadow-[0_0_10px_#8b5cf6]" />
                    )}
                </div>
                <span className="text-[10px] font-black uppercase tracking-tighter overflow-hidden whitespace-nowrap">
                   {item.name === "Dashboard" ? "Início" : item.name}
                </span>
              </Link>
            );
          })}
          
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="relative p-3 rounded-2xl text-red-500/70 hover:text-red-500 transition-all flex flex-col items-center gap-1"
          >
            <LogOut size={22} />
            <span className="text-[10px] font-black uppercase tracking-tighter">Sair</span>
          </button>
        </div>
      </nav>
    </>
  );
}

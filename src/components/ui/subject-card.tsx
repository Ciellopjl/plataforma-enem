"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SubjectIcon } from "./subject-icon";
import { ProgressBar } from "./base-ui";

interface SubjectCardProps {
  name: string;
  slug: string;
  iconName?: string;
  color?: string;
  progress?: number;
}

export function SubjectCard({ name, slug, iconName = "BookOpen", color = "bg-primary-500", progress = 0 }: SubjectCardProps) {
  // Mapeamento Sênior: Garante que o Tailwind não remova as cores dinâmicas
  const bgColor = color.startsWith("bg-") ? color : `bg-${color}`;
  
  return (
    <Link href={`/materias/${slug}`}>
      <div
        className="glass-card p-6 rounded-3xl group relative overflow-hidden h-full flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
      >
        <div className="flex items-center justify-between mb-4">
          <div className={cn("p-3 rounded-2xl flex items-center justify-center text-white transition-transform group-hover:scale-110 duration-500 shadow-lg", bgColor)}>
            <SubjectIcon name={iconName} size={24} />
          </div>
          <div className="text-primary-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
            <ArrowRight size={20} />
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-zinc-100 mb-2 group-hover:text-primary-300 transition-colors">
            {name}
          </h3>
          <div className="flex items-center gap-4">
            <ProgressBar 
              value={progress} 
              color={bgColor} 
              className="h-2 flex-1" 
            />
            <span className="text-xs font-black text-zinc-500 font-mono tracking-tighter truncate">{progress}%</span>
          </div>
        </div>

        {/* Ambient glow effect */}
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary-500/10 blur-3xl group-hover:bg-primary-500/20 transition-all rounded-full" />
      </div>
    </Link>
  );
}

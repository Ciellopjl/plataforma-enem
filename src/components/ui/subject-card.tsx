"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SubjectIcon } from "./subject-icon";

interface SubjectCardProps {
  name: string;
  slug: string;
  iconName?: string;
  color?: string;
  progress?: number;
}

export function SubjectCard({ name, slug, iconName = "BookOpen", color = "bg-primary-500", progress = 0 }: SubjectCardProps) {
  return (
    <Link href={`/materias/${slug}`}>
      <div
        className="glass-card p-6 rounded-3xl group relative overflow-hidden h-full flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
      >
        <div className="flex items-center justify-between mb-4">
          <div className={cn("p-3 rounded-2xl flex items-center justify-center text-white transition-transform group-hover:scale-110 duration-500", color)}>
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
            <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={cn("h-full transition-all duration-1000 ease-out", color)}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs font-medium text-zinc-500">{progress}%</span>
          </div>
        </div>

        {/* Ambient glow effect */}
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary-500/10 blur-3xl group-hover:bg-primary-500/20 transition-all rounded-full" />
      </div>
    </Link>
  );
}

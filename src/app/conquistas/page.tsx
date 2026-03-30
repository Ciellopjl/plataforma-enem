import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { BADGES } from "@/lib/badges";
import { Trophy, Star, Shield, Target, Medal, Award, Flame, Zap, Brain, Rocket, Lock } from "lucide-react";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";

const BookOpenFallback = (props: any) => <Star {...props} />;

const ICON_MAP: Record<string, any> = {
  "🎯": Target,
  "🔥": Flame,
  "⚡": Zap,
  "🏆": Trophy,
  "💯": Award,
  "⭐": Star,
  "👑": Shield,
  "🌟": Medal,
  "💎": Rocket,
  "📚": BookOpenFallback,
  "🎖️": Award,
  "🧠": Brain,
};

export default async function ConquistasPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id;

  const earnedBadges = await prisma.userBadge.findMany({
    where: { userId },
  });

  const earnedIds = earnedBadges.map((b) => b.badgeId);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="border-b border-white/5 pb-6">
        <h1 className="text-4xl font-black text-white tracking-tight mb-2">Minhas Conquistas</h1>
        <p className="text-zinc-400">
          Você já desbloqueou {earnedIds.length} de {BADGES.length} medalhas. Continue estudando para completar a coleção!
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {BADGES.map((badge) => {
          const isEarned = earnedIds.includes(badge.id);
          const earnedInfo = earnedBadges.find((b) => b.badgeId === badge.id);
          const IconComponent = ICON_MAP[badge.icon] || Star;

          return (
            <div
              key={badge.id}
              className={cn(
                "relative group glass p-6 rounded-3xl border transition-all duration-500",
                isEarned 
                  ? "border-primary-500/30 bg-primary-500/5 hover:bg-primary-500/10 hover:scale-[1.02]" 
                  : "border-white/5 bg-white/2 opacity-60 hover:opacity-100 grayscale hover:grayscale-0"
              )}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className={cn(
                  "w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-2xl",
                  isEarned 
                    ? "bg-gradient-to-br from-primary-400 to-primary-600 shadow-primary-500/40 rotate-0 group-hover:rotate-6" 
                    : "bg-zinc-800 text-zinc-600 rotate-0"
                )}>
                  {isEarned ? (
                    <IconComponent className="w-12 h-12 text-white" />
                  ) : (
                    <Lock className="w-10 h-10" />
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className={cn(
                    "font-black text-lg",
                    isEarned ? "text-white" : "text-zinc-500"
                  )}>
                    {badge.name}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-snug px-2">
                    {badge.description}
                  </p>
                </div>

                {isEarned && (
                  <div className="pt-2">
                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                      Conquistado em {new Date(earnedInfo!.earnedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Background glow para conquistas desbloqueadas */}
              {isEarned && (
                <div className="absolute -z-10 inset-0 bg-primary-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

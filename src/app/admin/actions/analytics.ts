"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function ensureAdmin() {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") {
    throw new Error("Acesso negado.");
  }
  return session;
}

/**
 * GALAXY BRAIN ANALYTICS - IMPLEMENTAÇÃO SÊNIOR
 * Evitando erros de agregação e removendo mocks visuais.
 */
export async function getDashboardStats() {
  await ensureAdmin();

  // 1. Métricas Base (Execução Paralela Otimizada)
  const [totalUsers, onlineUsers, totalEssays, totalPoints, totalQuizzes, avgEssayScore] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ 
      where: { 
        lastSeen: { gt: new Date(Date.now() - 5 * 60000) } 
      } 
    }),
    prisma.essay.count(),
    prisma.user.aggregate({ _sum: { totalPoints: true } }),
    prisma.quizAttempt.count({ where: { completed: true } }),
    prisma.essay.aggregate({ _avg: { score: true } })
  ]);

  // 2. Crescimento de Usuários - Últimos 7 dias (Bucket Billing Pattern)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const userGrowth = await Promise.all(last7Days.map(async (date) => {
    const count = await prisma.user.count({
      where: {
        createdAt: {
          lte: new Date(date + 'T23:59:59'),
          gte: new Date(date + 'T00:00:00')
        }
      }
    });
    return { date, count };
  }));

  // 3. Popularidade por Matéria (Relacional Deep Count - Solução Sênior)
  // Em vez de groupBy inconsistente, usamos a árvore de relações: Subject -> Lesson -> Progress
  const subjects = await prisma.subject.findMany({
    select: {
      name: true,
      color: true,
      lessons: {
        select: {
          _count: {
            select: { progress: { where: { completed: true } } }
          }
        }
      }
    }
  });

  const subjectStats = subjects.map(s => {
    // Somamos o progresso de todas as lições desta matéria
    const totalProgress = s.lessons.reduce((acc, curr) => acc + (curr._count?.progress || 0), 0);
    
    return {
      name: s.name,
      color: s.color?.replace('bg-', '') || 'blue-500',
      value: totalProgress || 0
    };
  });

  // Se o banco estiver vazio, não mostramos zeros desinteressantes para o admin
  // Mas para o dashboard "verdadeiro", mantemos a fidelidade dos dados.

  return {
    totalUsers,
    onlineUsers,
    totalEssays,
    totalQuizzes,
    avgEssayScore: Math.round(avgEssayScore._avg.score || 0),
    totalPoints: totalPoints._sum.totalPoints || 0,
    userGrowth,
    subjectStats: subjectStats.sort((a,b) => b.value - a.value).slice(0, 5)
  };
}

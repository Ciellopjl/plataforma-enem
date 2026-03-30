// Definição de todos os badges da plataforma
export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (stats: UserStats) => boolean;
};

export type UserStats = {
  totalPoints: number;
  streak: number;
  totalChallenges: number;
  perfectScores: number; // simulados com 5/5
  totalCorrect: number;
};

export const BADGES: Badge[] = [
  {
    id: "first_challenge",
    name: "Primeiro Passo",
    description: "Completou o primeiro desafio diário",
    icon: "🎯",
    condition: (s) => s.totalChallenges >= 1,
  },
  {
    id: "streak_3",
    name: "Em Sequência",
    description: "3 dias consecutivos de desafio",
    icon: "🔥",
    condition: (s) => s.streak >= 3,
  },
  {
    id: "streak_7",
    name: "Semana Perfeita",
    description: "7 dias consecutivos de desafio",
    icon: "⚡",
    condition: (s) => s.streak >= 7,
  },
  {
    id: "streak_30",
    name: "Imparável",
    description: "30 dias consecutivos de desafio",
    icon: "🏆",
    condition: (s) => s.streak >= 30,
  },
  {
    id: "points_100",
    name: "Centena",
    description: "Acumulou 100 pontos",
    icon: "💯",
    condition: (s) => s.totalPoints >= 100,
  },
  {
    id: "points_500",
    name: "Veterano",
    description: "Acumulou 500 pontos",
    icon: "⭐",
    condition: (s) => s.totalPoints >= 500,
  },
  {
    id: "points_1000",
    name: "Elite ENEM",
    description: "Acumulou 1000 pontos — você é top 1%!",
    icon: "👑",
    condition: (s) => s.totalPoints >= 1000,
  },
  {
    id: "perfect_score",
    name: "Nota Máxima",
    description: "Acertou todas as questões de um simulado",
    icon: "🌟",
    condition: (s) => s.perfectScores >= 1,
  },
  {
    id: "perfect_score_3",
    name: "Consistente",
    description: "Nota máxima em 3 simulados diferentes",
    icon: "💎",
    condition: (s) => s.perfectScores >= 3,
  },
  {
    id: "challenges_10",
    name: "Dedicado",
    description: "Completou 10 desafios diários",
    icon: "📚",
    condition: (s) => s.totalChallenges >= 10,
  },
  {
    id: "challenges_30",
    name: "Maratonista",
    description: "Completou 30 desafios diários",
    icon: "🎖️",
    condition: (s) => s.totalChallenges >= 30,
  },
  {
    id: "correct_50",
    name: "Sabe das Coisas",
    description: "50 questões corretas no total",
    icon: "🧠",
    condition: (s) => s.totalCorrect >= 50,
  },
];

import prisma from "./prisma";

export async function checkAndAwardBadges(userId: string, stats: UserStats) {
  const earnedBadgeIds = (
    await prisma.userBadge.findMany({ where: { userId }, select: { badgeId: true } })
  ).map((b) => b.badgeId);

  const newBadges = BADGES.filter(
    (badge) => !earnedBadgeIds.includes(badge.id) && badge.condition(stats)
  );

  if (newBadges.length > 0) {
    await prisma.userBadge.createMany({
      data: newBadges.map((b) => ({ userId, badgeId: b.id })),
      skipDuplicates: true,
    });
  }

  return newBadges.map(({ id, name, description, icon }) => ({ id, name, description, icon })); // retorna as novas badges conquistadas (para celebrar no front) sem a função condition
}

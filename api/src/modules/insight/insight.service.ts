import { prisma } from "../../lib/prisma";
import { spaceFor } from "../space/space.service";

export const getInsights = async (userId: string) => {
  const space = await spaceFor(userId);
  const since = new Date(Date.now() - 7 * 86400000);
  const [answers, moods, checkIns, plans, pokes] = await Promise.all([
    prisma.dailyQuestionAnswer.count({ where: { dailyQuestion: { userPartnerId: space.id }, createdAt: { gte: since }, deletedAt: null } }),
    prisma.userMood.count({ where: { userId, createdAt: { gte: since } } }),
    prisma.weeklyCheckIn.count({ where: { userPartnerId: space.id, weekStart: { gte: since } } }),
    prisma.userPartnerPlans.count({ where: { userPartnerId: space.id, dateTime: { gte: new Date() } } }),
    prisma.poke.count({ where: { userPartnerId: space.id, createdAt: { gte: since } } }),
  ]);
  return {
    periodDays: 7,
    activity: { dailyAnswers: answers, moods, weeklyCheckIns: checkIns, upcomingPlans: plans, pokes },
    score: Math.min(100, answers * 5 + moods * 3 + checkIns * 25 + Math.min(plans, 4) * 5),
  };
};

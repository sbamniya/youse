import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/app-error";
import type { MoodInput } from "./mood.schema";

const localDateKey = (date: Date, timeZone: string | null) => {
  try {
    const values = new Intl.DateTimeFormat("en-CA", {
      day: "2-digit",
      month: "2-digit",
      timeZone: timeZone ?? undefined,
      year: "numeric",
    }).formatToParts(date);
    const part = (type: Intl.DateTimeFormatPartTypes) =>
      values.find((value) => value.type === type)?.value;

    return `${part("year")}-${part("month")}-${part("day")}`;
  } catch {
    return date.toISOString().slice(0, 10);
  }
};

const recentMoods = (userId: string) =>
  prisma.userMood.findMany({
    where: { userId, createdAt: { gte: new Date(Date.now() - 36 * 86400000) } },
    orderBy: { createdAt: "desc" },
  });

export const getToday = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { timezone: true },
  });
  const today = localDateKey(new Date(), user?.timezone ?? null);
  const moods = await recentMoods(userId);

  return moods.find((mood) => localDateKey(mood.createdAt, user?.timezone ?? null) === today) ?? null;
};

export const create = async (userId: string, input: MoodInput) => {
  const existing = await getToday(userId);
  if (existing) {
    throw new AppError(409, "You have already checked in your mood today.");
  }

  return prisma.userMood.create({ data: { userId, mood: input.mood } });
};

export const list = (userId: string) =>
  prisma.userMood.findMany({
    where: { userId, createdAt: { gte: new Date(Date.now() - 30 * 86400000) } },
    orderBy: { createdAt: "desc" },
  });

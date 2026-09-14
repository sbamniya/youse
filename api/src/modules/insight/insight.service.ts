import dayjs from "dayjs";
import { prisma } from "../../lib/prisma";
import { spaceFor } from "../space/space.service";

const periodDays = 7;
const moodValues: Record<string, number> = {
  "😔": 1,
  "😐": 2,
  "🙂": 3,
  "😌": 4,
  "😄": 5,
};

const startOfDay = (date: Date) => dayjs(date).startOf("day").toDate();

const daysSince = (date: Date, today: Date) =>
  Math.max(
    1,
    Math.floor((today.getTime() - startOfDay(date).getTime()) / 86_400_000) + 1,
  );

const dateKey = (date: Date) => dayjs(date).format("YYYY-MM-DD");

const moodValue = (mood: string) => {
  const emojiValue = moodValues[mood];
  if (emojiValue) return emojiValue;

  const numericValue = Number(mood);
  return Number.isFinite(numericValue) && numericValue >= 1 && numericValue <= 5
    ? numericValue
    : null;
};

export const getInsights = async (userId: string) => {
  const space = await spaceFor(userId);
  const today = startOfDay(new Date());
  const relationshipSince = startOfDay(
    space.joinedAt ?? space.restoredAt ?? space.invitedAt ?? today,
  );
  const trendSince = dayjs(today)
    .subtract(periodDays - 1, "day")
    .startOf("day")
    .toDate();
  const connectedDays = daysSince(relationshipSince, today);
  const memberIds = [space.userId, space.partnerId].filter((id): id is string =>
    Boolean(id),
  );
  const [answers, moods, checkIns, plans, pokes, moodEntries] =
    await Promise.all([
      prisma.dailyQuestionAnswer.count({
        where: {
          dailyQuestion: { userPartnerId: space.id },
          createdAt: { gte: relationshipSince },
          deletedAt: null,
        },
      }),
      prisma.userMood.count({
        where: {
          userId: { in: memberIds },
          createdAt: { gte: relationshipSince },
        },
      }),
      prisma.weeklyCheckIn.count({
        where: {
          userPartnerId: space.id,
          weekStart: { gte: relationshipSince },
        },
      }),
      prisma.userPartnerPlans.count({
        where: {
          userPartnerId: space.id,
          createdAt: { gte: relationshipSince },
        },
      }),
      prisma.poke.count({
        where: { userPartnerId: space.id, createdAt: { gte: trendSince } },
      }),
      prisma.userMood.findMany({
        where: { userId: { in: memberIds }, createdAt: { gte: trendSince } },
        select: { mood: true, createdAt: true },
      }),
    ]);
  const moodsByDate = new Map<string, number[]>();
  for (const entry of moodEntries) {
    const value = moodValue(entry.mood);
    if (value === null) continue;

    const key = dateKey(entry.createdAt);
    moodsByDate.set(key, [...(moodsByDate.get(key) ?? []), value]);
  }

  const targets = {
    dailyAnswers: connectedDays,
    moods: connectedDays,
    weeklyCheckIns: Math.ceil(connectedDays / periodDays),
    upcomingPlans: connectedDays,
  };
  const score = Math.round(
    Math.min(answers / targets.dailyAnswers, 1) * 35 +
      Math.min(moods / targets.moods, 1) * 20 +
      Math.min(checkIns / targets.weeklyCheckIns, 1) * 25 +
      Math.min(plans / targets.upcomingPlans, 1) * 20,
  );

  return {
    periodDays,
    connectedDays,
    activity: {
      dailyAnswers: answers,
      moods,
      weeklyCheckIns: checkIns,
      upcomingPlans: plans,
      pokes,
    },
    targets,
    moodTrend: Array.from({ length: periodDays }, (_, index) => {
      const date = dayjs(trendSince).add(index, "day").toDate();
      const values = moodsByDate.get(dateKey(date)) ?? [];

      return {
        date: dateKey(date),
        label: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(
          date,
        ),
        value: values.length
          ? Math.round(
              (values.reduce((total, value) => total + value, 0) /
                values.length) *
                10,
            ) / 10
          : null,
      };
    }),
    score,
  };
};

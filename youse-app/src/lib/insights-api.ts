import { queryOptions } from "@tanstack/react-query";

import api from "./api";

export type InsightMoodPoint = {
  date: string;
  label: string;
  value: number | null;
};

export type Insights = {
  periodDays: number;
  connectedDays: number;
  activity: {
    dailyAnswers: number;
    moods: number;
    weeklyCheckIns: number;
    upcomingPlans: number;
    pokes: number;
  };
  targets: {
    dailyAnswers: number;
    moods: number;
    weeklyCheckIns: number;
    upcomingPlans: number;
  };
  moodTrend: InsightMoodPoint[];
  score: number;
};

export const insightsQueryKey = ["insights"] as const;

export async function getInsights(): Promise<Insights> {
  return api.get<Insights>("/insights");
}

export const insightsQueryOptions = queryOptions({
  queryKey: insightsQueryKey,
  queryFn: getInsights,
});

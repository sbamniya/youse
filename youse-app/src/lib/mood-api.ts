import { queryOptions } from "@tanstack/react-query";

import api from "./api";

export type UserMood = {
  id: string;
  userId: string;
  mood: string;
  createdAt: string;
};

export const todayMoodQueryKey = ["moods", "today"] as const;

export async function getTodayMood(): Promise<UserMood | null> {
  return api.get<UserMood | null>("/moods/today");
}

export const todayMoodQueryOptions = queryOptions({
  queryKey: todayMoodQueryKey,
  queryFn: getTodayMood,
});

export async function saveMood(mood: string): Promise<UserMood> {
  return api.post<UserMood, { mood: string }>("/moods", { mood });
}

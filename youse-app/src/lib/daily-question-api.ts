import { queryOptions } from "@tanstack/react-query";

import api from "./api";

export type DailyQuestionAnswer = {
  id: string;
  dailyQuestionId: string;
  userId: string;
  answer: string;
  reaction: string | null;
  deletedAt: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    profilePicture: string | null;
  };
};

export type DailyQuestion = {
  id: string;
  question: string;
  userPartnerId: string;
  createdAt: string;
  revealed: boolean;
  dailyQuestionAnswers: DailyQuestionAnswer[];
};

export const currentDailyQuestionQueryKey = ["daily-questions", "current"] as const;

export async function getCurrentDailyQuestion(): Promise<DailyQuestion> {
  return api.get<DailyQuestion>("/daily-questions/current");
}

export const currentDailyQuestionQueryOptions = queryOptions({
  queryKey: currentDailyQuestionQueryKey,
  queryFn: getCurrentDailyQuestion,
  retry: false,
});

export async function saveDailyAnswer(
  questionId: string,
  answer: string,
): Promise<DailyQuestionAnswer> {
  return api.put<DailyQuestionAnswer, { answer: string }>(
    `/daily-questions/${encodeURIComponent(questionId)}/answer`,
    { answer },
  );
}

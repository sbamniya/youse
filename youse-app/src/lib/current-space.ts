import { queryOptions } from "@tanstack/react-query";

import api from "./api";

export type SpaceMember = {
  id: string;
  phone: string;
  name: string | null;
  profilePicture: string | null;
  partnerId: string | null;
  timezone: string | null;
  gender: string | null;
  birthday: string | null;
  pokesEnabled: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SpaceSubscription = {
  id: string;
  trialEndsAt: string | null;
  plan: string | null;
  activeUntil: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CurrentSpace = {
  id: string;
  userId: string;
  partnerId: string | null;
  relationshipType: string;
  locationType: string | null;
  goal: string | null;
  partnerName: string | null;
  dailyQuestionTime: string | null;
  status: "invited" | "accepted" | "rejected";
  anniversary: string | null;
  invitationCode: string | null;
  invitedAt: string | null;
  joinedAt: string | null;
  deletedAt: string | null;
  brokenAt: string | null;
  restoredAt: string | null;
  user: SpaceMember;
  partner: SpaceMember | null;
  subscription: SpaceSubscription | null;
};

export const currentSpaceQueryKey = ["spaces", "current"] as const;

export async function getCurrentSpace(): Promise<CurrentSpace> {
  return api.get<CurrentSpace>("/space/current");
}

export async function updateDailyQuestionTime(
  dailyQuestionTime: string,
): Promise<{ dailyQuestionTime: string }> {
  return api.put<{ dailyQuestionTime: string }, { dailyQuestionTime: string }>(
    "/space/question-time",
    { dailyQuestionTime },
  );
}

export const currentSpaceQueryOptions = queryOptions({
  queryKey: currentSpaceQueryKey,
  queryFn: getCurrentSpace,
  staleTime: 5 * 60 * 1000,
});

export function getPartnerFromSpace(
  space: CurrentSpace,
  currentUserId: string,
): SpaceMember | null {
  if (space.user.id === currentUserId) {
    return space.partner;
  }

  if (space.partner?.id === currentUserId) {
    return space.user;
  }

  return null;
}

export function getSubscriptionDaysRemaining(
  space: CurrentSpace,
): number | null {
  const endTimes = [
    space.subscription?.trialEndsAt,
    space.subscription?.activeUntil,
  ]
    .filter((date): date is string => Boolean(date))
    .map((date) => new Date(date).getTime())
    .filter((time) => Number.isFinite(time) && time > Date.now());

  if (!endTimes.length) return null;

  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return Math.ceil((Math.max(...endTimes) - Date.now()) / millisecondsPerDay);
}

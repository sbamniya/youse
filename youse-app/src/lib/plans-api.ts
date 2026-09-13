import { queryOptions } from "@tanstack/react-query";
import type { Dayjs } from "dayjs";

import api from "./api";

export type ApiPlan = {
  id: string;
  userPartnerId: string;
  title: string;
  type: string;
  dateTime: string;
  location: string | null;
  note: string | null;
  image: string | null;
  remindAt: string | null;
  lastReminderAt: string | null;
  createdBy: string;
  createdAt: string;
};

export type PlanInput = {
  title: string;
  type: string;
  dateTime: string;
  location: string | null;
  note: string | null;
  imagePath: string | null;
  remindAt: string | null;
};

export type UpdatePlanInput = Partial<PlanInput>;

export const plansQueryKey = ["plans"] as const;

export const plansForMonthQueryKey = (month: Dayjs) =>
  [...plansQueryKey, month.format("YYYY-MM")] as const;

export async function getPlans(month: Dayjs): Promise<ApiPlan[]> {
  return api.get<ApiPlan[]>("/plans", {
    from: month.startOf("month").toISOString(),
    to: month.add(1, "month").startOf("month").toISOString(),
  });
}

export const plansQueryOptions = (month: Dayjs) =>
  queryOptions({
    queryKey: plansForMonthQueryKey(month),
    queryFn: () => getPlans(month),
  });

export const planQueryKey = (planId: string) =>
  [...plansQueryKey, "detail", planId] as const;

export async function getPlan(planId: string): Promise<ApiPlan> {
  return api.get<ApiPlan>(`/plans/${encodeURIComponent(planId)}`);
}

export const planQueryOptions = (planId: string) =>
  queryOptions({
    queryKey: planQueryKey(planId),
    queryFn: () => getPlan(planId),
  });

export async function createPlan(input: PlanInput): Promise<ApiPlan> {
  return api.post<ApiPlan, PlanInput>("/plans", input);
}

export async function updatePlan(
  planId: string,
  input: UpdatePlanInput,
): Promise<ApiPlan> {
  return api.patch<ApiPlan, UpdatePlanInput>(
    `/plans/${encodeURIComponent(planId)}`,
    input,
  );
}

export async function deletePlan(planId: string): Promise<void> {
  await api.delete<void>(`/plans/${encodeURIComponent(planId)}`);
}

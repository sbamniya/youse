import { queryOptions } from "@tanstack/react-query";

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

export async function getPlans(): Promise<ApiPlan[]> {
  return api.get<ApiPlan[]>("/plans");
}

export const plansQueryOptions = queryOptions({
  queryKey: plansQueryKey,
  queryFn: getPlans,
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

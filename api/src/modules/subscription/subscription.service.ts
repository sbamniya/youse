import { prisma } from "../../lib/prisma";
import { spaceFor } from "../space/space.service";
import type { SubscriptionInput } from "./subscription.schema";
export const getAccess = async (userId: string) => {
  const space = await spaceFor(userId);
  const subscription = space.subscription;
  const writable = !subscription || Boolean((subscription.trialEndsAt && subscription.trialEndsAt > new Date()) || (subscription.activeUntil && subscription.activeUntil > new Date()));
  return { writable, subscription };
};
export const update = async (userId: string, input: SubscriptionInput) => {
  const space = await spaceFor(userId);
  const activeUntil = new Date();
  activeUntil.setMonth(activeUntil.getMonth() + (input.plan === "yearly" ? 12 : 1));
  return prisma.subscription.upsert({ where: { userPartnerId: space.id }, update: { plan: input.plan, activeUntil }, create: { userPartnerId: space.id, plan: input.plan, activeUntil } });
};

import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/app-error";
import { spaceFor, writableSpace } from "../space/space.service";
import type { CreatePlanInput, ListPlansInput, UpdatePlanInput } from "./plan.schema";

export const list = async (userId: string, range: ListPlansInput) => {
  const space = await spaceFor(userId);
  return prisma.userPartnerPlans.findMany({ where: { userPartnerId: space.id, dateTime: { gte: new Date(range.from), lt: new Date(range.to) } }, orderBy: { dateTime: "asc" } });
};
export const get = async (userId: string, planId: string) => {
  const space = await spaceFor(userId);
  const plan = await prisma.userPartnerPlans.findFirst({ where: { id: planId, userPartnerId: space.id } });
  if (!plan) throw new AppError(404, "Plan not found");
  return plan;
};
export const create = async (userId: string, input: CreatePlanInput) => {
  const space = await writableSpace(userId);
  const { imagePath, ...plan } = input;

  if (imagePath && !imagePath.startsWith(`images/${userId}/`)) {
    throw new AppError(400, "Plan images must belong to the current user");
  }

  return prisma.userPartnerPlans.create({ data: { ...plan, image: imagePath, dateTime: new Date(plan.dateTime), remindAt: plan.remindAt ? new Date(plan.remindAt) : null, userPartnerId: space.id, createdBy: userId } });
};
export const update = async (userId: string, planId: string, input: UpdatePlanInput) => {
  const space = await writableSpace(userId);
  const { imagePath, ...plan } = input;

  if (imagePath && !imagePath.startsWith(`images/${userId}/`)) {
    throw new AppError(400, "Plan images must belong to the current user");
  }

  const result = await prisma.userPartnerPlans.updateMany({ where: { id: planId, userPartnerId: space.id }, data: { ...plan, ...(imagePath !== undefined ? { image: imagePath } : {}), dateTime: plan.dateTime ? new Date(plan.dateTime) : undefined, ...(plan.remindAt !== undefined ? { remindAt: plan.remindAt ? new Date(plan.remindAt) : null } : {}) } });
  if (!result.count) throw new AppError(404, "Plan not found");
  return prisma.userPartnerPlans.findUnique({ where: { id: planId } });
};
export const remove = async (userId: string, planId: string) => {
  const space = await writableSpace(userId);
  const result = await prisma.userPartnerPlans.deleteMany({ where: { id: planId, userPartnerId: space.id } });
  if (!result.count) throw new AppError(404, "Plan not found");
};

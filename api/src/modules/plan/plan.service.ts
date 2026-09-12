import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/app-error";
import { spaceFor, writableSpace } from "../space/space.service";
import type { CreatePlanInput, UpdatePlanInput } from "./plan.schema";

export const list = async (userId: string) => {
  const space = await spaceFor(userId);
  return prisma.userPartnerPlans.findMany({ where: { userPartnerId: space.id }, orderBy: { dateTime: "asc" } });
};
export const create = async (userId: string, input: CreatePlanInput) => {
  const space = await writableSpace(userId);
  return prisma.userPartnerPlans.create({ data: { ...input, dateTime: new Date(input.dateTime), remindAt: input.remindAt ? new Date(input.remindAt) : null, userPartnerId: space.id, createdBy: userId } });
};
export const update = async (userId: string, planId: string, input: UpdatePlanInput) => {
  const space = await writableSpace(userId);
  const result = await prisma.userPartnerPlans.updateMany({ where: { id: planId, userPartnerId: space.id }, data: { ...input, dateTime: input.dateTime ? new Date(input.dateTime) : undefined, remindAt: input.remindAt ? new Date(input.remindAt) : undefined } });
  if (!result.count) throw new AppError(404, "Plan not found");
  return prisma.userPartnerPlans.findUnique({ where: { id: planId } });
};
export const remove = async (userId: string, planId: string) => {
  const space = await writableSpace(userId);
  const result = await prisma.userPartnerPlans.deleteMany({ where: { id: planId, userPartnerId: space.id } });
  if (!result.count) throw new AppError(404, "Plan not found");
};

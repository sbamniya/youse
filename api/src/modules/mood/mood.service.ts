import { prisma } from "../../lib/prisma";
import type { MoodInput } from "./mood.schema";
export const create = (userId: string, input: MoodInput) => prisma.userMood.create({ data: { userId, mood: input.mood } });
export const list = (userId: string) => prisma.userMood.findMany({ where: { userId, createdAt: { gte: new Date(Date.now() - 30 * 86400000) } }, orderBy: { createdAt: "desc" } });

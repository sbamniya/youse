import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/app-error";
import { spaceFor, writableSpace } from "../space/space.service";
import type { CreateWeeklyCheckInInput, UpdateWeeklyCheckInInput, WeeklyCheckInAnswerInput } from "./weekly-check-in.schema";

export const create = async (userId: string, input: CreateWeeklyCheckInInput) => {
  const space = await writableSpace(userId);
  return prisma.weeklyCheckIn.create({
    data: {
      userPartnerId: space.id,
      weekStart: new Date(input.weekStart),
      weekEnd: new Date(input.weekEnd),
      weeklyCheckInQnAs: { create: input.questions.map((question) => ({ question, userId })) },
    },
    include: { weeklyCheckInQnAs: true },
  });
};
export const list = async (userId: string) => {
  const space = await spaceFor(userId);
  return prisma.weeklyCheckIn.findMany({ where: { userPartnerId: space.id }, include: { weeklyCheckInQnAs: { where: { userId } } }, orderBy: { weekStart: "desc" } });
};
export const updateAnswer = async (userId: string, checkInId: string, answerId: string, input: WeeklyCheckInAnswerInput) => {
  const space = await writableSpace(userId);
  const answer = await prisma.weeklyCheckInQnA.findFirst({ where: { id: answerId, weeklyCheckInId: checkInId, userId, weeklyCheckIn: { userPartnerId: space.id } } });
  if (!answer) throw new AppError(404, "Check-in answer not found");
  return prisma.weeklyCheckInQnA.update({ where: { id: answer.id }, data: input });
};
export const get = async (userId: string, checkInId: string) => {
  const space = await spaceFor(userId);
  const checkIn = await prisma.weeklyCheckIn.findFirst({ where: { id: checkInId, userPartnerId: space.id }, include: { weeklyCheckInQnAs: true } });
  if (!checkIn) throw new AppError(404, "Check-in not found");
  const answeredBy = (id: string | null) => id !== null && checkIn.weeklyCheckInQnAs.some((qna) => qna.userId === id && qna.answer);
  const revealed = answeredBy(space.userId) && answeredBy(space.partnerId) && checkIn.weeklyCheckInQnAs.every((qna) => qna.answer);
  return { ...checkIn, revealed, weeklyCheckInQnAs: revealed ? checkIn.weeklyCheckInQnAs : checkIn.weeklyCheckInQnAs.filter((qna) => qna.userId === userId) };
};
export const update = async (userId: string, checkInId: string, input: UpdateWeeklyCheckInInput) => {
  const space = await writableSpace(userId);
  const result = await prisma.weeklyCheckIn.updateMany({ where: { id: checkInId, userPartnerId: space.id }, data: input });
  if (!result.count) throw new AppError(404, "Check-in not found");
  return prisma.weeklyCheckIn.findUnique({ where: { id: checkInId } });
};

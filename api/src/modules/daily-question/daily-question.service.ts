import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/app-error";
import { spaceFor, writableSpace } from "../space/space.service";
import type { DailyAnswerInput, DailyQuestionInput, ReactionInput } from "./daily-question.schema";

export const getCurrentDailyQuestion = async (userId: string) => {
  const space = await spaceFor(userId);
  const question = await prisma.dailyQuestion.findFirst({
    where: { userPartnerId: space.id },
    orderBy: { createdAt: "desc" },
    include: { dailyQuestionAnswers: { where: { deletedAt: null }, include: { user: { select: { id: true, name: true, profilePicture: true } } } } },
  });
  if (!question) throw new AppError(404, "No daily question has been published");
  const bothAnswered = space.partnerId !== null &&
    question.dailyQuestionAnswers.some((answer) => answer.userId === space.userId) &&
    question.dailyQuestionAnswers.some((answer) => answer.userId === space.partnerId);
  return {
    ...question,
    revealed: bothAnswered,
    dailyQuestionAnswers: bothAnswered
      ? question.dailyQuestionAnswers
      : question.dailyQuestionAnswers.filter((answer) => answer.userId === userId),
  };
};

export const createDailyQuestion = async (userId: string, input: DailyQuestionInput) => {
  const space = await writableSpace(userId);
  return prisma.dailyQuestion.create({ data: { ...input, userPartnerId: space.id } });
};

export const saveDailyAnswer = async (userId: string, questionId: string, input: DailyAnswerInput) => {
  const space = await writableSpace(userId);
  const question = await prisma.dailyQuestion.findFirst({ where: { id: questionId, userPartnerId: space.id } });
  if (!question) throw new AppError(404, "Daily question not found");
  const existing = await prisma.dailyQuestionAnswer.findFirst({ where: { dailyQuestionId: question.id, userId, deletedAt: null } });
  return existing
    ? prisma.dailyQuestionAnswer.update({ where: { id: existing.id }, data: input })
    : prisma.dailyQuestionAnswer.create({ data: { ...input, dailyQuestionId: question.id, userId } });
};

export const reactToDailyAnswer = async (userId: string, answerId: string, input: ReactionInput) => {
  const space = await writableSpace(userId);
  const answer = await prisma.dailyQuestionAnswer.findFirst({
    where: { id: answerId, deletedAt: null, userId: { not: userId }, dailyQuestion: { userPartnerId: space.id } },
  });
  if (!answer) throw new AppError(404, "Answer not found");
  return prisma.dailyQuestionAnswer.update({ where: { id: answer.id }, data: input });
};

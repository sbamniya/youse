import dayjs from "dayjs";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/app-error";
import { spaceFor, writableSpace } from "../space/space.service";
import type {
  DailyAnswerInput,
  DailyQuestionInput,
  ReactionInput,
} from "./daily-question.schema";

export const getCurrentDailyQuestion = async (userId: string) => {
  const space = await spaceFor(userId);
  const today = dayjs().startOf("day").toDate();
  const tomorrow = dayjs(today).add(1, "day").startOf("day").toDate();

  let question = await prisma.dailyQuestion.findFirst({
    where: {
      userPartnerId: space.id,
      questionDate: { gte: today, lt: tomorrow },
    },
    orderBy: { createdAt: "desc" },
    include: {
      dailyQuestionAnswers: {
        where: { deletedAt: null },
        include: {
          user: { select: { id: true, name: true, profilePicture: true } },
        },
      },
    },
  });

  if (!question) {
    const previousQuestions = await prisma.dailyQuestion.findMany({
      where: { userPartnerId: space.id, questionLibraryId: { not: null } },
      select: { questionLibraryId: true },
    });
    const usedQuestionIds = previousQuestions.flatMap(
      ({ questionLibraryId }) => (questionLibraryId ? [questionLibraryId] : []),
    );
    const activeQuestions = await prisma.questionLibrary.findMany({
      where: {
        status: "ACTIVE",
        ...(usedQuestionIds.length > 0 && { id: { notIn: usedQuestionIds } }),
      },
    });
    const availableQuestions =
      activeQuestions.length > 0
        ? activeQuestions
        : await prisma.questionLibrary.findMany({
            where: { status: "ACTIVE" },
          });
    const selected =
      availableQuestions[Math.floor(Math.random() * availableQuestions.length)];

    if (!selected)
      throw new AppError(404, "No daily question has been published");

    question = await prisma.dailyQuestion.upsert({
      where: {
        questionDate_userPartnerId: {
          questionDate: today,
          userPartnerId: space.id,
        },
      },
      update: {},
      create: {
        userPartnerId: space.id,
        questionLibraryId: selected.id,
        question: selected.question,
        questionDate: today,
      },
      include: {
        dailyQuestionAnswers: {
          where: { deletedAt: null },
          include: {
            user: { select: { id: true, name: true, profilePicture: true } },
          },
        },
      },
    });
  }

  if (!question)
    throw new AppError(404, "No daily question has been published");
  const bothAnswered =
    space.partnerId !== null &&
    question.dailyQuestionAnswers.some(
      (answer) => answer.userId === space.userId,
    ) &&
    question.dailyQuestionAnswers.some(
      (answer) => answer.userId === space.partnerId,
    );

  return {
    ...question,
    revealed: bothAnswered,
    dailyQuestionAnswers: bothAnswered
      ? question.dailyQuestionAnswers
      : question.dailyQuestionAnswers.filter(
          (answer) => answer.userId === userId,
        ),
  };
};

export const createDailyQuestion = async (
  userId: string,
  input: DailyQuestionInput,
) => {
  const space = await writableSpace(userId);
  return prisma.dailyQuestion.create({
    data: { ...input, userPartnerId: space.id },
  });
};

export const saveDailyAnswer = async (
  userId: string,
  questionId: string,
  input: DailyAnswerInput,
) => {
  const space = await writableSpace(userId);
  const question = await prisma.dailyQuestion.findFirst({
    where: { id: questionId, userPartnerId: space.id },
  });
  if (!question) throw new AppError(404, "Daily question not found");
  const existing = await prisma.dailyQuestionAnswer.findFirst({
    where: { dailyQuestionId: question.id, userId, deletedAt: null },
  });
  if (existing) {
    throw new AppError(409, "You've already answered today's question");
  }
  if (input.imagePath && !input.imagePath.startsWith(`images/${userId}/`)) {
    throw new AppError(400, "Answer images must belong to the current user");
  }
  const { imagePath, ...answer } = input;
  return prisma.dailyQuestionAnswer.create({
    data: {
      ...answer,
      imageUrl: imagePath ?? null,
      dailyQuestionId: question.id,
      userId,
    },
  });
};

export const reactToDailyAnswer = async (
  userId: string,
  answerId: string,
  input: ReactionInput,
) => {
  const space = await writableSpace(userId);
  const answer = await prisma.dailyQuestionAnswer.findFirst({
    where: {
      id: answerId,
      deletedAt: null,
      userId: { not: userId },
      dailyQuestion: { userPartnerId: space.id },
    },
  });
  if (!answer) throw new AppError(404, "Answer not found");
  return prisma.dailyQuestionAnswer.update({
    where: { id: answer.id },
    data: input,
  });
};

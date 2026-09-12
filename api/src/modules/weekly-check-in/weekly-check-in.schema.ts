import { z } from "zod";
import { emptyRequestObject, idParams, optionalText, requestSchema, text } from "../../utils/request-schema";

export const createWeeklyCheckInSchema = requestSchema(z.object({
  weekStart: z.string().datetime(),
  weekEnd: z.string().datetime(),
  questions: z.array(text).min(1).max(10),
}), emptyRequestObject);
export const weeklyCheckInAnswerSchema = requestSchema(
  z.object({ answer: text }),
  z.object({ id: z.string().uuid(), answerId: z.string().uuid() }),
);
export const updateWeeklyCheckInSchema = requestSchema(
  z.object({ notes: optionalText, nextWeekGoals: optionalText }),
  idParams,
);
export const weeklyCheckInIdSchema = requestSchema(emptyRequestObject, idParams);

export type CreateWeeklyCheckInInput = z.infer<typeof createWeeklyCheckInSchema>["body"];
export type WeeklyCheckInAnswerInput = z.infer<typeof weeklyCheckInAnswerSchema>["body"];
export type UpdateWeeklyCheckInInput = z.infer<typeof updateWeeklyCheckInSchema>["body"];

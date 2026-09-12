import { z } from "zod";
import { emptyRequestObject, idParams, requestSchema, text } from "../../utils/request-schema";

export const dailyQuestionSchema = requestSchema(
  z.object({ question: text }),
  emptyRequestObject,
);
export const dailyAnswerSchema = requestSchema(z.object({ answer: text }), idParams);
export const reactionSchema = requestSchema(
  z.object({ reaction: text.max(50) }),
  idParams,
);

export type DailyQuestionInput = z.infer<typeof dailyQuestionSchema>["body"];
export type DailyAnswerInput = z.infer<typeof dailyAnswerSchema>["body"];
export type ReactionInput = z.infer<typeof reactionSchema>["body"];

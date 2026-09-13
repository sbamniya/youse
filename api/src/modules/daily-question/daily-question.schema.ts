import { z } from "zod";
import { emptyRequestObject, idParams, requestSchema, text } from "../../utils/request-schema";

const imagePath = z
  .string()
  .trim()
  .min(1)
  .max(1024)
  .refine(
    (path) =>
      !path.startsWith("/") && !path.includes("..") && !path.includes("://"),
    "Image must be an object-storage path",
  );

export const dailyQuestionSchema = requestSchema(
  z.object({ question: text }),
  emptyRequestObject,
);
export const dailyAnswerSchema = requestSchema(
  z.object({ answer: text, imagePath: imagePath.optional().nullable() }),
  idParams,
);
export const reactionSchema = requestSchema(
  z.object({ reaction: text.max(50) }),
  idParams,
);

export type DailyQuestionInput = z.infer<typeof dailyQuestionSchema>["body"];
export type DailyAnswerInput = z.infer<typeof dailyAnswerSchema>["body"];
export type ReactionInput = z.infer<typeof reactionSchema>["body"];

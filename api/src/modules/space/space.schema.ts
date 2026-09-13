import { z } from "zod";
import {
  emptyRequestObject,
  requestSchema,
  text,
} from "../../utils/request-schema";

export const saveRelationshipSchema = requestSchema(
  z.object({
    relationshipType: z.string().trim().min(1).max(100),
    goal: text.max(200),
    partnerName: z.string().trim().min(1).max(100),
    anniversary: z.union([
      z.string().date(),
      z.string().datetime({ offset: true }),
    ]),
  }),
  emptyRequestObject,
);

export const unlinkRelationshipSchema = requestSchema(
  z.object({ mode: z.enum(["archive", "delete"]).default("archive") }),
  emptyRequestObject,
);

export const saveQuestionTimeSchema = requestSchema(
  z.object({ dailyQuestionTime: z.string().datetime({ offset: true }) }),
  emptyRequestObject,
);

export type SaveRelationshipInput = z.infer<
  typeof saveRelationshipSchema
>["body"];

export type SaveQuestionTimeInput = z.infer<
  typeof saveQuestionTimeSchema
>["body"];

export type UnlinkRelationshipInput = z.infer<
  typeof unlinkRelationshipSchema
>["body"];

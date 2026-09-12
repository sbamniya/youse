import { z } from "zod";
import { emptyRequestObject, idParams, optionalText, requestSchema, text } from "../../utils/request-schema";

export const createPlanSchema = requestSchema(z.object({
  title: text,
  type: text.max(50),
  dateTime: z.string().datetime(),
  location: optionalText,
  note: optionalText,
  remindAt: z.string().datetime().optional().nullable(),
}), emptyRequestObject);
export const updatePlanSchema = requestSchema(z.object({
  title: z.string().trim().min(1).max(500).optional(),
  type: z.string().trim().min(1).max(50).optional(),
  dateTime: z.string().datetime().optional(),
  location: optionalText,
  note: optionalText,
  remindAt: z.string().datetime().optional().nullable(),
}), idParams);
export const planIdSchema = requestSchema(emptyRequestObject, idParams);
export type CreatePlanInput = z.infer<typeof createPlanSchema>["body"];
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>["body"];

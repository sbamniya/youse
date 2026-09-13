import { z } from "zod";
import { emptyRequestObject, idParams, optionalText, requestSchema, text } from "../../utils/request-schema";

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

export const createPlanSchema = requestSchema(z.object({
  title: text,
  type: text.max(50),
  dateTime: z.string().datetime(),
  location: optionalText,
  note: optionalText,
  imagePath: imagePath.optional().nullable(),
  remindAt: z.string().datetime().optional().nullable(),
}), emptyRequestObject);
export const updatePlanSchema = requestSchema(z.object({
  title: z.string().trim().min(1).max(500).optional(),
  type: z.string().trim().min(1).max(50).optional(),
  dateTime: z.string().datetime().optional(),
  location: optionalText,
  note: optionalText,
  imagePath: imagePath.optional().nullable(),
  remindAt: z.string().datetime().optional().nullable(),
}), idParams);
export const planIdSchema = requestSchema(emptyRequestObject, idParams);
export type CreatePlanInput = z.infer<typeof createPlanSchema>["body"];
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>["body"];

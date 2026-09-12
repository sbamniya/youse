import { z } from "zod";
import { emptyRequestObject, requestSchema, text } from "../../utils/request-schema";
export const moodSchema = requestSchema(z.object({ mood: text.max(50) }), emptyRequestObject);
export type MoodInput = z.infer<typeof moodSchema>["body"];

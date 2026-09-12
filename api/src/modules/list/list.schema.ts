import { z } from "zod";
import { emptyRequestObject, idParams, optionalText, requestSchema, text } from "../../utils/request-schema";
export const createListSchema = requestSchema(z.object({ name: text.max(100) }), emptyRequestObject);
export const createListItemSchema = requestSchema(z.object({ title: text, note: optionalText }), z.object({ listId: z.string().uuid() }));
export const updateListItemSchema = requestSchema(z.object({ title: z.string().trim().min(1).max(500).optional(), note: optionalText, completed: z.boolean().optional() }), idParams);
export const listEntityIdSchema = requestSchema(emptyRequestObject, idParams);
export type CreateListInput = z.infer<typeof createListSchema>["body"];
export type CreateListItemInput = z.infer<typeof createListItemSchema>["body"];
export type UpdateListItemInput = z.infer<typeof updateListItemSchema>["body"];

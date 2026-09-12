import { z } from "zod";
import { emptyRequestObject, idParams, optionalText, requestSchema, text } from "../../utils/request-schema";
export const createMemorySchema = requestSchema(z.object({ title: text, description: optionalText, memoryDate: z.string().datetime().optional().nullable(), thumbnail: z.string().url().optional().nullable(), location: optionalText, imageUrls: z.array(z.string().url()).max(10).default([]) }), emptyRequestObject);
export const favoriteMemorySchema = requestSchema(z.object({ isFavorite: z.boolean() }), idParams);
export const memoryIdSchema = requestSchema(emptyRequestObject, idParams);
export type CreateMemoryInput = z.infer<typeof createMemorySchema>["body"];
export type FavoriteMemoryInput = z.infer<typeof favoriteMemorySchema>["body"];

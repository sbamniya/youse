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

const memoryItemParams = z.object({
  id: z.string().uuid(),
  itemId: z.string().uuid(),
});

export const createMemorySchema = requestSchema(
  z.object({
    title: text,
    description: optionalText,
    memoryDate: z.string().datetime().optional().nullable(),
    thumbnailPath: imagePath.optional().nullable(),
    location: optionalText,
    imagePaths: z.array(imagePath).max(10).default([]),
  }),
  emptyRequestObject,
);
export const addMemoryPhotoSchema = requestSchema(
  z.object({
    imagePath,
    caption: optionalText,
  }),
  idParams,
);
export const favoriteMemorySchema = requestSchema(z.object({ isFavorite: z.boolean() }), idParams);
export const memoryIdSchema = requestSchema(emptyRequestObject, idParams);
export const updateMemoryItemCaptionSchema = requestSchema(
  z.object({ caption: z.string().trim().max(2_000).nullable() }),
  memoryItemParams,
);
export const memoryItemIdSchema = requestSchema(
  emptyRequestObject,
  memoryItemParams,
);
export type CreateMemoryInput = z.infer<typeof createMemorySchema>["body"];
export type AddMemoryPhotoInput = z.infer<typeof addMemoryPhotoSchema>["body"];
export type FavoriteMemoryInput = z.infer<typeof favoriteMemorySchema>["body"];
export type UpdateMemoryItemCaptionInput = z.infer<
  typeof updateMemoryItemCaptionSchema
>["body"];

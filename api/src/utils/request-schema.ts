import { z } from "zod";

export const emptyRequestObject = z.object({}).default({});
export const idParams = z.object({ id: z.string().uuid() });
export const text = z.string().trim().min(1).max(500);
export const optionalText = z.string().trim().max(2_000).optional().nullable();

export const requestSchema = <
  TBody extends z.ZodTypeAny,
  TParams extends z.ZodTypeAny,
>(body: TBody, params: TParams) =>
  z.object({ body, query: emptyRequestObject, params });

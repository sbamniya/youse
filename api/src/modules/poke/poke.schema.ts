import { z } from "zod";
import { emptyRequestObject, requestSchema, text } from "../../utils/request-schema";

export const pokeSchema = requestSchema(
  z.object({ type: text.max(100) }),
  emptyRequestObject,
);

export type PokeInput = z.infer<typeof pokeSchema>["body"];

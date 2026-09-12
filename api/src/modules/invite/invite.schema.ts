import { z } from "zod";
import { emptyRequestObject, requestSchema } from "../../utils/request-schema";

export const invitationCodeSchema = requestSchema(
  emptyRequestObject,
  z.object({ code: z.string().trim().min(1).max(100) }),
);

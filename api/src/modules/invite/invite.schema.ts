import { z } from "zod";
import { emptyRequestObject, requestSchema } from "../../utils/request-schema";

export const invitationCodeSchema = requestSchema(
  emptyRequestObject,
  z.object({
    code: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-HJ-NP-Z2-9]{8}$/, "Invite code must contain eight valid characters"),
  }),
);

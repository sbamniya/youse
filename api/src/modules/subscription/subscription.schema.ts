import { z } from "zod";
import { emptyRequestObject, requestSchema } from "../../utils/request-schema";
export const subscriptionSchema = requestSchema(z.object({ plan: z.enum(["monthly", "yearly"]) }), emptyRequestObject);
export type SubscriptionInput = z.infer<typeof subscriptionSchema>["body"];

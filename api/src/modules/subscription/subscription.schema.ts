import { z } from "zod";
import { emptyRequestObject, requestSchema } from "../../utils/request-schema";

export const subscriptionPlanSchema = z.enum(["monthly", "yearly"]);

export const createCheckoutSchema = requestSchema(
  z.object({ plan: subscriptionPlanSchema }),
  emptyRequestObject,
);

export const verifyCheckoutSchema = requestSchema(
  z.object({
    razorpayPaymentId: z.string().trim().min(1).max(100),
    razorpaySignature: z.string().trim().min(1).max(256),
    razorpaySubscriptionId: z.string().trim().min(1).max(100),
  }),
  emptyRequestObject,
);

export const changeSubscriptionPlanSchema = requestSchema(
  z.object({ plan: subscriptionPlanSchema }),
  emptyRequestObject,
);

export const cancelSubscriptionSchema = requestSchema(
  emptyRequestObject,
  emptyRequestObject,
);

export type SubscriptionPlan = z.infer<typeof subscriptionPlanSchema>;
export type VerifyCheckoutInput = z.infer<typeof verifyCheckoutSchema>["body"];

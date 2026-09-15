import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import {
  rateLimit,
  userOrIpRateLimitKey,
} from "../../middleware/rate-limit.middleware";
import { validate } from "../../middleware/validate";
import * as controller from "./subscription.controller";
import {
  cancelSubscriptionSchema,
  changeSubscriptionPlanSchema,
  createCheckoutSchema,
  verifyCheckoutSchema,
} from "./subscription.schema";
import { IS_PRODUCTION } from "../../config/config";

const createCheckoutRateLimit = rateLimit({
  keyPrefix: "subscription-checkout",
  points: IS_PRODUCTION ? 10 : 100000,
  durationSeconds: 60 * 60,
  keyGenerator: userOrIpRateLimitKey,
});

export const subscriptionRouter = Router();
subscriptionRouter.post("/webhook", controller.webhook);
subscriptionRouter.use(requireAuth);

subscriptionRouter.get("/access", controller.getAccess);
subscriptionRouter.post(
  "/checkout",
  createCheckoutRateLimit,
  validate(createCheckoutSchema),
  controller.createCheckout,
);
subscriptionRouter.post(
  "/verify",
  validate(verifyCheckoutSchema),
  controller.verifyCheckout,
);
subscriptionRouter.patch(
  "/plan",
  createCheckoutRateLimit,
  validate(changeSubscriptionPlanSchema),
  controller.changePlan,
);
subscriptionRouter.post(
  "/cancel",
  createCheckoutRateLimit,
  validate(cancelSubscriptionSchema),
  controller.cancelSubscription,
);

import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import {
  rateLimit,
  userOrIpRateLimitKey,
} from "../../middleware/rate-limit.middleware";
import { validate } from "../../middleware/validate";
import * as controller from "./subscription.controller";
import {
  createCheckoutSchema,
  verifyCheckoutSchema,
} from "./subscription.schema";

const createCheckoutRateLimit = rateLimit({
  keyPrefix: "subscription-checkout",
  points: 10,
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

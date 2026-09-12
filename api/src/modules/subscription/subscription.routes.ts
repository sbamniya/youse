import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate";
import * as controller from "./subscription.controller";
import { subscriptionSchema } from "./subscription.schema";
export const subscriptionRouter = Router();
subscriptionRouter.use(requireAuth);
subscriptionRouter.get("/access", controller.getAccess);
subscriptionRouter.post("/subscriptions", validate(subscriptionSchema), controller.update);

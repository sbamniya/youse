import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate";
import * as controller from "./plan.controller";
import { createPlanSchema, listPlansSchema, planIdSchema, updatePlanSchema } from "./plan.schema";

export const planRouter = Router();
planRouter.use(requireAuth);

planRouter.get("/", validate(listPlansSchema), controller.list);
planRouter.get("/:id", validate(planIdSchema), controller.get);
planRouter.post("/", validate(createPlanSchema), controller.create);
planRouter.patch("/:id", validate(updatePlanSchema), controller.update);
planRouter.delete("/:id", validate(planIdSchema), controller.remove);

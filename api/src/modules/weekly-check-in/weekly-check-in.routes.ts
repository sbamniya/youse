import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate";
import * as controller from "./weekly-check-in.controller";
import { createWeeklyCheckInSchema, updateWeeklyCheckInSchema, weeklyCheckInAnswerSchema, weeklyCheckInIdSchema } from "./weekly-check-in.schema";

export const weeklyCheckInRouter = Router();
weeklyCheckInRouter.use(requireAuth);
weeklyCheckInRouter.post("/weekly-check-ins", validate(createWeeklyCheckInSchema), controller.create);
weeklyCheckInRouter.get("/weekly-check-ins", controller.list);
weeklyCheckInRouter.get("/weekly-check-ins/:id", validate(weeklyCheckInIdSchema), controller.get);
weeklyCheckInRouter.patch("/weekly-check-ins/:id", validate(updateWeeklyCheckInSchema), controller.update);
weeklyCheckInRouter.put("/weekly-check-ins/:id/answers/:answerId", validate(weeklyCheckInAnswerSchema), controller.updateAnswer);

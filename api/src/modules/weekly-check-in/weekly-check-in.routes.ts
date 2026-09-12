import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate";
import * as controller from "./weekly-check-in.controller";
import {
  createWeeklyCheckInSchema,
  updateWeeklyCheckInSchema,
  weeklyCheckInAnswerSchema,
  weeklyCheckInIdSchema,
} from "./weekly-check-in.schema";

export const weeklyCheckInRouter = Router();
weeklyCheckInRouter.use(requireAuth);

weeklyCheckInRouter.post(
  "/",
  validate(createWeeklyCheckInSchema),
  controller.create,
);
weeklyCheckInRouter.get("/", controller.list);
weeklyCheckInRouter.get(
  "/:id",
  validate(weeklyCheckInIdSchema),
  controller.get,
);
weeklyCheckInRouter.patch(
  "/:id",
  validate(updateWeeklyCheckInSchema),
  controller.update,
);
weeklyCheckInRouter.put(
  "/:id/answers/:answerId",
  validate(weeklyCheckInAnswerSchema),
  controller.updateAnswer,
);

import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate";
import * as controller from "./daily-question.controller";
import { dailyAnswerSchema, dailyQuestionSchema, reactionSchema } from "./daily-question.schema";

export const dailyQuestionRouter = Router();
dailyQuestionRouter.use(requireAuth);

dailyQuestionRouter.get("/current", controller.getCurrent);
dailyQuestionRouter.post("", validate(dailyQuestionSchema), controller.create);
dailyQuestionRouter.put("/:id/answer", validate(dailyAnswerSchema), controller.saveAnswer);
dailyQuestionRouter.patch("/answers/:id/reaction", validate(reactionSchema), controller.reactToAnswer);

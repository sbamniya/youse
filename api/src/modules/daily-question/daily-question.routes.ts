import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate";
import * as controller from "./daily-question.controller";
import { dailyAnswerSchema, dailyQuestionSchema, reactionSchema } from "./daily-question.schema";

export const dailyQuestionRouter = Router();
dailyQuestionRouter.use(requireAuth);
dailyQuestionRouter.get("/daily-questions/current", controller.getCurrent);
dailyQuestionRouter.post("/daily-questions", validate(dailyQuestionSchema), controller.create);
dailyQuestionRouter.put("/daily-questions/:id/answer", validate(dailyAnswerSchema), controller.saveAnswer);
dailyQuestionRouter.patch("/daily-questions/answers/:id/reaction", validate(reactionSchema), controller.reactToAnswer);

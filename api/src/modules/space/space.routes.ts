import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate";
import * as controller from "./space.controller";
import {
  saveQuestionTimeSchema,
  saveRelationshipSchema,
  unlinkRelationshipSchema,
} from "./space.schema";

export const spaceRouter = Router();
spaceRouter.use(requireAuth);

spaceRouter.put(
  "/",
  validate(saveRelationshipSchema),
  controller.saveRelationship,
);
spaceRouter.get("/current", controller.getCurrentRelationship);
spaceRouter.post(
  "/unlink",
  validate(unlinkRelationshipSchema),
  controller.unlinkRelationship,
);
spaceRouter.put(
  "/question-time",
  validate(saveQuestionTimeSchema),
  controller.saveQuestionTime,
);
spaceRouter.post("/reconnect", controller.reconnectRelationship);
spaceRouter.get("/export", controller.exportSpace);

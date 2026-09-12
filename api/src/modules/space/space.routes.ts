import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate";
import * as controller from "./space.controller";
import {
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
spaceRouter.post("/reconnect", controller.reconnectRelationship);
spaceRouter.get("/export", controller.exportSpace);

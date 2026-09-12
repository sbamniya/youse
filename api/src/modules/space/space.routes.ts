import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate";
import * as controller from "./space.controller";
import { saveRelationshipSchema, unlinkRelationshipSchema } from "./space.schema";

export const spaceRouter = Router();
spaceRouter.use(requireAuth);
spaceRouter.put("/relationships", validate(saveRelationshipSchema), controller.saveRelationship);
spaceRouter.get("/relationships/current", controller.getCurrentRelationship);
spaceRouter.post("/relationships/unlink", validate(unlinkRelationshipSchema), controller.unlinkRelationship);
spaceRouter.post("/relationships/reconnect", controller.reconnectRelationship);
spaceRouter.get("/export", controller.exportSpace);

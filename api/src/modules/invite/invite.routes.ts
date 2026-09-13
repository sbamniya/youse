import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate";
import * as controller from "./invite.controller";
import { invitationCodeSchema } from "./invite.schema";

export const inviteRouter = Router();
inviteRouter.use(requireAuth);

inviteRouter.get("/:code/verify", validate(invitationCodeSchema), controller.verify);
inviteRouter.post("/:code/accept", validate(invitationCodeSchema), controller.accept);
inviteRouter.post("/resend", controller.resend);

import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate";
import * as controller from "./invite.controller";
import { invitationCodeSchema } from "./invite.schema";

export const inviteRouter = Router();
inviteRouter.use(requireAuth);
inviteRouter.post("/relationships/invitations/:code/accept", validate(invitationCodeSchema), controller.accept);
inviteRouter.post("/relationships/invitations/resend", controller.resend);

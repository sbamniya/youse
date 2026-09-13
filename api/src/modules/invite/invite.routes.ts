import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { rateLimit } from "../../middleware/rate-limit.middleware";
import { validate } from "../../middleware/validate";
import * as controller from "./invite.controller";
import { invitationCodeSchema } from "./invite.schema";

export const inviteRouter = Router();

const verifyInviteRateLimit = rateLimit({
  keyPrefix: "invite-verification",
  points: 5,
  durationSeconds: 1,
});

inviteRouter.get(
  "/:code/verify",
  verifyInviteRateLimit,
  validate(invitationCodeSchema),
  controller.verify,
);

inviteRouter.use(requireAuth);

inviteRouter.post("/:code/accept", validate(invitationCodeSchema), controller.accept);
inviteRouter.post("/resend", controller.resend);

import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate";
import * as controller from "./mood.controller";
import { moodSchema } from "./mood.schema";
export const moodRouter = Router();
moodRouter.use(requireAuth);
moodRouter.post("/moods", validate(moodSchema), controller.create);
moodRouter.get("/moods", controller.list);

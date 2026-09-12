import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { getInsights } from "./insight.controller";
export const insightRouter = Router();
insightRouter.use(requireAuth);
insightRouter.get("/insights", getInsights);

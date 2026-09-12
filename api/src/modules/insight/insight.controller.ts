import type { NextFunction, Request, Response } from "express";
import * as service from "./insight.service";
export const getInsights = async (req: Request, res: Response, next: NextFunction) => { try { res.json(await service.getInsights(req.user!.id)); } catch (error) { next(error); } };

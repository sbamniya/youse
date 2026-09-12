import type { NextFunction, Request, Response } from "express";
import * as service from "./daily-question.service";

export const getCurrent = async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await service.getCurrentDailyQuestion(req.user!.id)); } catch (error) { next(error); }
};
export const create = async (req: Request, res: Response, next: NextFunction) => {
  try { res.status(201).json(await service.createDailyQuestion(req.user!.id, req.body)); } catch (error) { next(error); }
};
export const saveAnswer = async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await service.saveDailyAnswer(req.user!.id, req.params.id, req.body)); } catch (error) { next(error); }
};
export const reactToAnswer = async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await service.reactToDailyAnswer(req.user!.id, req.params.id, req.body)); } catch (error) { next(error); }
};

import type { NextFunction, Request, Response } from "express";
import * as service from "./subscription.service";
export const getAccess = async (req: Request, res: Response, next: NextFunction) => { try { res.json(await service.getAccess(req.user!.id)); } catch (error) { next(error); } };
export const update = async (req: Request, res: Response, next: NextFunction) => { try { res.json(await service.update(req.user!.id, req.body)); } catch (error) { next(error); } };

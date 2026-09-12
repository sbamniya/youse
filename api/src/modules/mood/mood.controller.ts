import type { NextFunction, Request, Response } from "express";
import * as service from "./mood.service";
export const create = async (req: Request, res: Response, next: NextFunction) => { try { res.status(201).json(await service.create(req.user!.id, req.body)); } catch (error) { next(error); } };
export const list = async (req: Request, res: Response, next: NextFunction) => { try { res.json(await service.list(req.user!.id)); } catch (error) { next(error); } };

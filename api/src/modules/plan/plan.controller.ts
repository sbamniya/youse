import type { NextFunction, Request, Response } from "express";
import * as service from "./plan.service";
export const list = async (req: Request, res: Response, next: NextFunction) => { try { res.json(await service.list(req.user!.id)); } catch (error) { next(error); } };
export const create = async (req: Request, res: Response, next: NextFunction) => { try { res.status(201).json(await service.create(req.user!.id, req.body)); } catch (error) { next(error); } };
export const update = async (req: Request, res: Response, next: NextFunction) => { try { res.json(await service.update(req.user!.id, req.params.id, req.body)); } catch (error) { next(error); } };
export const remove = async (req: Request, res: Response, next: NextFunction) => { try { await service.remove(req.user!.id, req.params.id); res.status(204).send(); } catch (error) { next(error); } };

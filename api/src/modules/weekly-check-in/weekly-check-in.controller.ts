import type { NextFunction, Request, Response } from "express";
import * as service from "./weekly-check-in.service";

export const create = async (req: Request, res: Response, next: NextFunction) => { try { res.status(201).json(await service.create(req.user!.id, req.body)); } catch (error) { next(error); } };
export const list = async (req: Request, res: Response, next: NextFunction) => { try { res.json(await service.list(req.user!.id)); } catch (error) { next(error); } };
export const get = async (req: Request, res: Response, next: NextFunction) => { try { res.json(await service.get(req.user!.id, req.params.id)); } catch (error) { next(error); } };
export const update = async (req: Request, res: Response, next: NextFunction) => { try { res.json(await service.update(req.user!.id, req.params.id, req.body)); } catch (error) { next(error); } };
export const updateAnswer = async (req: Request, res: Response, next: NextFunction) => { try { res.json(await service.updateAnswer(req.user!.id, req.params.id, req.params.answerId, req.body)); } catch (error) { next(error); } };

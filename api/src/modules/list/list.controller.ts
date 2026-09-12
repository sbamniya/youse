import type { NextFunction, Request, Response } from "express";
import * as service from "./list.service";
export const list = async (req: Request, res: Response, next: NextFunction) => { try { res.json(await service.list(req.user!.id)); } catch (error) { next(error); } };
export const create = async (req: Request, res: Response, next: NextFunction) => { try { res.status(201).json(await service.create(req.user!.id, req.body)); } catch (error) { next(error); } };
export const createItem = async (req: Request, res: Response, next: NextFunction) => { try { res.status(201).json(await service.createItem(req.user!.id, req.params.listId, req.body)); } catch (error) { next(error); } };
export const updateItem = async (req: Request, res: Response, next: NextFunction) => { try { res.json(await service.updateItem(req.user!.id, req.params.id, req.body)); } catch (error) { next(error); } };
export const remove = async (req: Request, res: Response, next: NextFunction) => { try { await service.remove(req.user!.id, req.params.id); res.status(204).send(); } catch (error) { next(error); } };
export const removeItem = async (req: Request, res: Response, next: NextFunction) => { try { await service.removeItem(req.user!.id, req.params.id); res.status(204).send(); } catch (error) { next(error); } };

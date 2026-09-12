import type { NextFunction, Request, Response } from "express";
import * as service from "./space.service";
export const saveRelationship = async (req: Request, res: Response, next: NextFunction) => { try { const result = await service.saveRelationship(req.user!.id, req.body); res.status(result.created ? 201 : 200).json({ user: result.user, relationship: result.relationship, inviteCode: result.inviteCode }); } catch (error) { next(error); } };
export const getCurrentRelationship = async (req: Request, res: Response, next: NextFunction) => { try { res.json(await service.getCurrentRelationship(req.user!.id)); } catch (error) { next(error); } };
export const exportSpace = async (req: Request, res: Response, next: NextFunction) => { try { res.json(await service.exportSpace(req.user!.id)); } catch (error) { next(error); } };
export const unlinkRelationship = async (req: Request, res: Response, next: NextFunction) => { try { res.json(await service.unlinkRelationship(req.user!.id, req.body)); } catch (error) { next(error); } };
export const reconnectRelationship = async (req: Request, res: Response, next: NextFunction) => { try { const result = await service.reconnectRelationship(req.user!.id); res.status(result.statusCode).json(result.body); } catch (error) { next(error); } };

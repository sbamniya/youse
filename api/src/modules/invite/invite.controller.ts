import type { NextFunction, Request, Response } from "express";
import * as service from "./invite.service";

export const accept = async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await service.acceptInvitation(req.user!.id, req.params.code)); } catch (error) { next(error); }
};
export const resend = async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await service.resendInvitation(req.user!.id)); } catch (error) { next(error); }
};

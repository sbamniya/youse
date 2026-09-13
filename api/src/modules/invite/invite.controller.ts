import type { NextFunction, Request, Response } from "express";
import * as service from "./invite.service";

export const verify = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await service.verifyInvitation(req.user!.id, req.params.code);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const accept = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await service.acceptInvitation(req.user!.id, req.params.code);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const resend = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await service.resendInvitation(req.user!.id);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

import type { NextFunction, Request, Response } from "express";
import * as service from "./subscription.service";

export const getAccess = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    res.json(await service.getAccess(req.user!.id));
  } catch (error) {
    next(error);
  }
};

export const createCheckout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    res.status(201).json(await service.createCheckout(req.user!.id, req.body.plan));
  } catch (error) {
    console.log(error)
    next(error);
  }
};

export const verifyCheckout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    res.json(await service.verifyCheckout(req.user!.id, req.body));
  } catch (error) {
    next(error);
  }
};

export const changePlan = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    res.json(await service.changePlan(req.user!.id, req.body.plan));
  } catch (error) {
    next(error);
  }
};

export const cancelSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    res.json(await service.cancelSubscription(req.user!.id));
  } catch (error) {
    next(error);
  }
};

export const webhook = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const signature = req.get("x-razorpay-signature");
    await service.handleWebhook(req.rawBody, signature, req.body);
    res.json({ received: true });
  } catch (error) {
    next(error);
  }
};

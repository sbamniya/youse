import type { NextFunction, Request, Response } from "express";
import * as pokeService from "./poke.service";

export const sendPoke = async (req: Request, res: Response, next: NextFunction) => {
  try { res.status(201).json(await pokeService.sendPoke(req.user!.id, req.body)); } catch (error) { next(error); }
};

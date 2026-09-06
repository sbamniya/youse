import type { NextFunction, Request, Response } from 'express';
import * as authService from './auth.service';
import { AppError } from '../../utils/app-error';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.registerUser(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.loginUser(req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.refreshTokens(req.body.refreshToken);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authService.logoutUser(req.body.refreshToken);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Not authenticated');
    }
    const profile = await authService.getUserProfile(req.user.id);
    res.status(200).json(profile);
  } catch (err) {
    next(err);
  }
};

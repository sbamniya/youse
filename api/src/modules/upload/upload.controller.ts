import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../../utils/app-error';

export const createImage = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const file = req.file as Express.MulterS3.File | undefined;
    if (!file) {
      throw new AppError(400, 'image is required');
    }

    res.status(201).json({ path: file.key });
  } catch (error) {
    next(error);
  }
};

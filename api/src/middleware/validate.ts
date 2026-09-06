import type { NextFunction, Request, Response } from 'express';
import type { AnyZodObject } from 'zod';
import { ZodError } from 'zod';

/** Validates req.body/query/params against a Zod schema shaped as { body, query, params }. */
export const validate =
  (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({
          message: 'Validation failed',
          errors: err.flatten().fieldErrors,
        });
        return;
      }
      next(err);
    }
  };

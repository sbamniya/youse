import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { authRouter } from './modules/auth/auth.routes';
import { spaceRouter } from './modules/space/space.routes';
import { adminRouter } from './modules/admin/admin.routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/auth', authRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api', spaceRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

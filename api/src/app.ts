import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { authRouter } from './modules/auth/auth.routes';
import { adminRouter } from './modules/admin/admin.routes';
import { dailyQuestionRouter } from './modules/daily-question/daily-question.routes';
import { insightRouter } from './modules/insight/insight.routes';
import { inviteRouter } from './modules/invite/invite.routes';
import { listRouter } from './modules/list/list.routes';
import { memoryRouter } from './modules/memory/memory.routes';
import { moodRouter } from './modules/mood/mood.routes';
import { planRouter } from './modules/plan/plan.routes';
import { pokeRouter } from './modules/poke/poke.routes';
import { spaceRouter } from './modules/space/space.routes';
import { subscriptionRouter } from './modules/subscription/subscription.routes';
import { weeklyCheckInRouter } from './modules/weekly-check-in/weekly-check-in.routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/v1/auth', authRouter);
  app.use('/v1/admin', adminRouter);
  app.use('/v1', spaceRouter);
  app.use('/v1', inviteRouter);
  app.use('/v1', pokeRouter);
  app.use('/v1', dailyQuestionRouter);
  app.use('/v1', weeklyCheckInRouter);
  app.use('/v1', planRouter);
  app.use('/v1', memoryRouter);
  app.use('/v1', moodRouter);
  app.use('/v1', listRouter);
  app.use('/v1', insightRouter);
  app.use('/v1', subscriptionRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

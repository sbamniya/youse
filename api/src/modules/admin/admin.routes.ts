import { Router } from 'express';
import { prisma } from '../../lib/prisma';
import { requireAuth } from '../../middleware/auth.middleware';
import { env } from '../../config/env';
import { AppError } from '../../utils/app-error';

export const adminRouter = Router();

const adminPhones = new Set(
  env.ADMIN_PHONES.split(',')
    .map((phone) => phone.trim())
    .filter(Boolean),
);

adminRouter.use(requireAuth, (req, _res, next) => {
  next(adminPhones.has(req.user!.phone) ? undefined : new AppError(403, 'Admin access required'));
});

adminRouter.get('/metrics', async (_req, res, next) => {
  try {
    const weekAgo = new Date(Date.now() - 7 * 86400000);
    const now = new Date();
    const [users, couples, newCouples, paid, answers, moods, pokes, plans, memories, checkIns] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.userPartner.count({ where: { status: 'accepted', deletedAt: null } }),
      prisma.userPartner.count({ where: { status: 'accepted', deletedAt: null, joinedAt: { gte: weekAgo } } }),
      prisma.subscription.count({ where: { activeUntil: { gt: now } } }),
      prisma.dailyQuestionAnswer.count({ where: { createdAt: { gte: weekAgo }, deletedAt: null } }),
      prisma.userMood.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.poke.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.userPartnerPlans.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.partnerMemories.count({ where: { createdAt: { gte: weekAgo }, deletedAt: null } }),
      prisma.weeklyCheckIn.count({ where: { createdAt: { gte: weekAgo } } }),
    ]);

    res.json({
      totals: { users, couples, newCouplesThisWeek: newCouples, paidCouples: paid },
      paidConversion: couples ? Number(((paid / couples) * 100).toFixed(1)) : 0,
      engagementLast7Days: { answers, moods, pokes, plans, memories, checkIns },
    });
  } catch (error) {
    next(error);
  }
});

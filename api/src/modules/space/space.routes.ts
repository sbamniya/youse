import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { requireAuth } from '../../middleware/auth.middleware';
import { AppError } from '../../utils/app-error';

export const spaceRouter = Router();
spaceRouter.use(requireAuth);

const parse = <T>(schema: z.ZodType<T>, value: unknown): T => {
  const result = schema.safeParse(value);
  if (!result.success) throw new AppError(400, result.error.issues[0]?.message ?? 'Invalid request');
  return result.data;
};
const text = z.string().trim().min(1).max(500);
const optionalText = z.string().trim().max(2_000).optional().nullable();

async function spaceFor(userId: string) {
  const space = await prisma.userPartner.findFirst({
    where: { deletedAt: null, OR: [{ userId }, { partnerId: userId }] },
    include: { subscription: true, user: true, partner: true },
    orderBy: { joinedAt: 'desc' },
  });
  if (!space) throw new AppError(404, 'No shared space found');
  return space;
}

async function writableSpace(userId: string) {
  const space = await spaceFor(userId);
  const subscription = space.subscription;
  const active = !subscription || (subscription.trialEndsAt && subscription.trialEndsAt > new Date()) || (subscription.activeUntil && subscription.activeUntil > new Date());
  if (!active) throw new AppError(402, 'Your trial has ended. Choose a plan to add new activity.');
  return space;
}

function inviteCode() {
  return Array.from({ length: 8 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');
}

spaceRouter.patch('/me', async (req, res, next) => {
  try {
    const body = parse(z.object({ name: z.string().trim().min(1).max(100).optional(), profilePicture: z.string().url().optional().nullable(), timezone: z.string().trim().max(100).optional() }), req.body);
    res.json(await prisma.user.update({ where: { id: req.user!.id }, data: body }));
  } catch (error) { next(error); }
});

spaceRouter.post('/relationships', async (req, res, next) => {
  try {
    const body = parse(z.object({ relationshipType: text, locationType: z.string().trim().max(100).optional(), goal: z.string().trim().max(200).optional(), dailyQuestionTime: z.string().datetime().optional(), anniversary: z.string().datetime().optional() }), req.body);
    const existing = await prisma.userPartner.findFirst({ where: { userId: req.user!.id, deletedAt: null, status: { in: ['invited', 'accepted'] } } });
    if (existing) throw new AppError(409, 'An active relationship already exists');
    const relationship = await prisma.userPartner.create({ data: { userId: req.user!.id, relationshipType: body.relationshipType, locationType: body.locationType, goal: body.goal, dailyQuestionTime: body.dailyQuestionTime ? new Date(body.dailyQuestionTime) : undefined, anniversary: body.anniversary ? new Date(body.anniversary) : undefined, invitationCode: inviteCode(), invitedAt: new Date() } });
    res.status(201).json({ relationship, inviteCode: relationship.invitationCode });
  } catch (error) { next(error); }
});

spaceRouter.get('/relationships/current', async (req, res, next) => {
  try { res.json(await spaceFor(req.user!.id)); } catch (error) { next(error); }
});

spaceRouter.post('/relationships/invitations/:code/accept', async (req, res, next) => {
  try {
    const relationship = await prisma.userPartner.findFirst({ where: { invitationCode: req.params.code.toUpperCase(), status: 'invited', deletedAt: null } });
    if (!relationship) throw new AppError(404, 'Invite not found or no longer active');
    if (relationship.userId === req.user!.id) throw new AppError(400, 'You cannot accept your own invite');
    const accepted = await prisma.$transaction(async (transaction) => {
      await transaction.user.update({ where: { id: relationship.userId }, data: { partnerId: req.user!.id } });
      await transaction.user.update({ where: { id: req.user!.id }, data: { partnerId: relationship.userId } });
      const updated = await transaction.userPartner.update({ where: { id: relationship.id }, data: { partnerId: req.user!.id, status: 'accepted', joinedAt: new Date() } });
      await transaction.subscription.create({ data: { userPartnerId: relationship.id, trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) } });
      return updated;
    });
    res.json(accepted);
  } catch (error) { next(error); }
});

spaceRouter.post('/moods', async (req, res, next) => {
  try { parse(z.object({ mood: text.max(50) }), req.body); res.status(201).json(await prisma.userMood.create({ data: { userId: req.user!.id, mood: req.body.mood } })); } catch (error) { next(error); }
});

spaceRouter.get('/moods', async (req, res, next) => {
  try { res.json(await prisma.userMood.findMany({ where: { userId: req.user!.id, createdAt: { gte: new Date(Date.now() - 30 * 86400000) } }, orderBy: { createdAt: 'desc' } })); } catch (error) { next(error); }
});

spaceRouter.post('/pokes', async (req, res, next) => {
  try {
    const body = parse(z.object({ type: text.max(100) }), req.body); const space = await writableSpace(req.user!.id);
    const recipientId = space.userId === req.user!.id ? space.partnerId : space.userId;
    if (!recipientId || space.status !== 'accepted') throw new AppError(409, 'Your partner has not joined yet');
    res.status(201).json(await prisma.poke.create({ data: { userPartnerId: space.id, senderId: req.user!.id, recipientId, type: body.type } }));
  } catch (error) { next(error); }
});

spaceRouter.get('/daily-questions/current', async (req, res, next) => {
  try {
    const space = await spaceFor(req.user!.id);
    const question = await prisma.dailyQuestion.findFirst({ where: { userPartnerId: space.id }, orderBy: { createdAt: 'desc' }, include: { dailyQuestionAnswers: { where: { deletedAt: null }, include: { user: { select: { id: true, name: true, profilePicture: true } } } } } });
    if (!question) throw new AppError(404, 'No daily question has been published');
    const bothAnswered = space.partnerId !== null && question.dailyQuestionAnswers.some((answer) => answer.userId === space.userId) && question.dailyQuestionAnswers.some((answer) => answer.userId === space.partnerId);
    res.json({ ...question, revealed: bothAnswered, dailyQuestionAnswers: bothAnswered ? question.dailyQuestionAnswers : question.dailyQuestionAnswers.filter((answer) => answer.userId === req.user!.id) });
  } catch (error) { next(error); }
});

spaceRouter.post('/daily-questions', async (req, res, next) => {
  try { const body = parse(z.object({ question: text }), req.body); const space = await writableSpace(req.user!.id); res.status(201).json(await prisma.dailyQuestion.create({ data: { ...body, userPartnerId: space.id } })); } catch (error) { next(error); }
});

spaceRouter.put('/daily-questions/:id/answer', async (req, res, next) => {
  try {
    const body = parse(z.object({ answer: text }), req.body); const space = await writableSpace(req.user!.id); const question = await prisma.dailyQuestion.findFirst({ where: { id: req.params.id, userPartnerId: space.id } });
    if (!question) throw new AppError(404, 'Daily question not found');
    const existing = await prisma.dailyQuestionAnswer.findFirst({ where: { dailyQuestionId: question.id, userId: req.user!.id, deletedAt: null } });
    res.json(existing ? await prisma.dailyQuestionAnswer.update({ where: { id: existing.id }, data: body }) : await prisma.dailyQuestionAnswer.create({ data: { ...body, dailyQuestionId: question.id, userId: req.user!.id } }));
  } catch (error) { next(error); }
});

spaceRouter.post('/weekly-check-ins', async (req, res, next) => {
  try {
    const body = parse(z.object({ weekStart: z.string().datetime(), weekEnd: z.string().datetime(), questions: z.array(text).min(1).max(10) }), req.body); const space = await writableSpace(req.user!.id);
    const checkIn = await prisma.weeklyCheckIn.create({ data: { userPartnerId: space.id, weekStart: new Date(body.weekStart), weekEnd: new Date(body.weekEnd), weeklyCheckInQnAs: { create: body.questions.map((question) => ({ question, userId: req.user!.id })) } }, include: { weeklyCheckInQnAs: true } });
    res.status(201).json(checkIn);
  } catch (error) { next(error); }
});

spaceRouter.get('/weekly-check-ins', async (req, res, next) => {
  try { const space = await spaceFor(req.user!.id); res.json(await prisma.weeklyCheckIn.findMany({ where: { userPartnerId: space.id }, include: { weeklyCheckInQnAs: true }, orderBy: { weekStart: 'desc' } })); } catch (error) { next(error); }
});

spaceRouter.put('/weekly-check-ins/:id/answers/:answerId', async (req, res, next) => {
  try {
    const body = parse(z.object({ answer: text }), req.body); const space = await writableSpace(req.user!.id); const answer = await prisma.weeklyCheckInQnA.findFirst({ where: { id: req.params.answerId, weeklyCheckInId: req.params.id, userId: req.user!.id, weeklyCheckIn: { userPartnerId: space.id } } });
    if (!answer) throw new AppError(404, 'Check-in answer not found');
    res.json(await prisma.weeklyCheckInQnA.update({ where: { id: answer.id }, data: body }));
  } catch (error) { next(error); }
});

spaceRouter.get('/plans', async (req, res, next) => {
  try { const space = await spaceFor(req.user!.id); res.json(await prisma.userPartnerPlans.findMany({ where: { userPartnerId: space.id }, orderBy: { dateTime: 'asc' } })); } catch (error) { next(error); }
});

spaceRouter.post('/plans', async (req, res, next) => {
  try {
    const body = parse(z.object({ title: text, type: text.max(50), dateTime: z.string().datetime(), location: optionalText, note: optionalText, remindAt: z.string().datetime().optional().nullable() }), req.body); const space = await writableSpace(req.user!.id);
    res.status(201).json(await prisma.userPartnerPlans.create({ data: { ...body, dateTime: new Date(body.dateTime), remindAt: body.remindAt ? new Date(body.remindAt) : null, userPartnerId: space.id, createdBy: req.user!.id } }));
  } catch (error) { next(error); }
});

spaceRouter.get('/memories', async (req, res, next) => {
  try { const space = await spaceFor(req.user!.id); res.json(await prisma.partnerMemories.findMany({ where: { userPartnerId: space.id, deletedAt: null }, include: { partnerMemoryItems: true }, orderBy: { memoryDate: 'desc' } })); } catch (error) { next(error); }
});

spaceRouter.post('/memories', async (req, res, next) => {
  try {
    const body = parse(z.object({ title: text, description: optionalText, memoryDate: z.string().datetime().optional().nullable(), thumbnail: z.string().url().optional().nullable(), location: optionalText, imageUrls: z.array(z.string().url()).max(10).default([]) }), req.body); const space = await writableSpace(req.user!.id);
    const { imageUrls, memoryDate, ...memory } = body;
    res.status(201).json(await prisma.partnerMemories.create({ data: { ...memory, memoryDate: memoryDate ? new Date(memoryDate) : null, userPartnerId: space.id, createdBy: req.user!.id, partnerMemoryItems: { create: (imageUrls ?? []).map((imageUrl) => ({ imageUrl, uploadedBy: req.user!.id })) } }, include: { partnerMemoryItems: true } }));
  } catch (error) { next(error); }
});

spaceRouter.patch('/memories/:id/favorite', async (req, res, next) => {
  try { const space = await writableSpace(req.user!.id); const body = parse(z.object({ isFavorite: z.boolean() }), req.body); const result = await prisma.partnerMemories.updateMany({ where: { id: req.params.id, userPartnerId: space.id, deletedAt: null }, data: body }); if (!result.count) throw new AppError(404, 'Memory not found'); res.status(204).send(); } catch (error) { next(error); }
});

spaceRouter.get('/lists', async (req, res, next) => {
  try { const space = await spaceFor(req.user!.id); res.json(await prisma.sharedList.findMany({ where: { userPartnerId: space.id }, include: { items: { orderBy: { createdAt: 'asc' } } }, orderBy: { createdAt: 'asc' } })); } catch (error) { next(error); }
});

spaceRouter.post('/lists', async (req, res, next) => {
  try { const body = parse(z.object({ name: text.max(100) }), req.body); const space = await writableSpace(req.user!.id); res.status(201).json(await prisma.sharedList.create({ data: { ...body, userPartnerId: space.id, createdBy: req.user!.id } })); } catch (error) { next(error); }
});

spaceRouter.post('/lists/:listId/items', async (req, res, next) => {
  try { const body = parse(z.object({ title: text, note: optionalText }), req.body); const space = await writableSpace(req.user!.id); const list = await prisma.sharedList.findFirst({ where: { id: req.params.listId, userPartnerId: space.id } }); if (!list) throw new AppError(404, 'List not found'); res.status(201).json(await prisma.sharedListItem.create({ data: { ...body, listId: list.id } })); } catch (error) { next(error); }
});

spaceRouter.patch('/list-items/:id', async (req, res, next) => {
  try { const body = parse(z.object({ title: z.string().trim().min(1).max(500).optional(), note: optionalText, completed: z.boolean().optional() }), req.body); const space = await writableSpace(req.user!.id); const item = await prisma.sharedListItem.findFirst({ where: { id: req.params.id, list: { userPartnerId: space.id } } }); if (!item) throw new AppError(404, 'List item not found'); res.json(await prisma.sharedListItem.update({ where: { id: item.id }, data: body })); } catch (error) { next(error); }
});

spaceRouter.get('/insights', async (req, res, next) => {
  try {
    const space = await spaceFor(req.user!.id); const since = new Date(Date.now() - 7 * 86400000);
    const [answers, moods, checkIns, plans, pokes] = await Promise.all([prisma.dailyQuestionAnswer.count({ where: { dailyQuestion: { userPartnerId: space.id }, createdAt: { gte: since }, deletedAt: null } }), prisma.userMood.count({ where: { userId: req.user!.id, createdAt: { gte: since } } }), prisma.weeklyCheckIn.count({ where: { userPartnerId: space.id, weekStart: { gte: since } } }), prisma.userPartnerPlans.count({ where: { userPartnerId: space.id, dateTime: { gte: new Date() } } }), prisma.poke.count({ where: { userPartnerId: space.id, createdAt: { gte: since } } })]);
    res.json({ periodDays: 7, activity: { dailyAnswers: answers, moods, weeklyCheckIns: checkIns, upcomingPlans: plans, pokes }, score: Math.min(100, answers * 5 + moods * 3 + checkIns * 25 + Math.min(plans, 4) * 5) });
  } catch (error) { next(error); }
});

spaceRouter.get('/access', async (req, res, next) => {
  try { const space = await spaceFor(req.user!.id); const subscription = space.subscription; const writable = !subscription || Boolean((subscription.trialEndsAt && subscription.trialEndsAt > new Date()) || (subscription.activeUntil && subscription.activeUntil > new Date())); res.json({ writable, subscription }); } catch (error) { next(error); }
});

spaceRouter.post('/subscriptions', async (req, res, next) => {
  try { const body = parse(z.object({ plan: z.enum(['monthly', 'yearly']) }), req.body); const space = await spaceFor(req.user!.id); const activeUntil = new Date(); activeUntil.setMonth(activeUntil.getMonth() + (body.plan === 'yearly' ? 12 : 1)); res.json(await prisma.subscription.upsert({ where: { userPartnerId: space.id }, update: { plan: body.plan, activeUntil }, create: { userPartnerId: space.id, plan: body.plan, activeUntil } })); } catch (error) { next(error); }
});
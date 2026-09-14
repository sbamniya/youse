import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/app-error";
import Cacheable from "../../utils/cacheable";
import { getUserProfile, userByIdCacheable } from "../auth/auth.service";
import type {
  SaveRelationshipInput,
  UnlinkRelationshipInput,
} from "./space.schema";

export const userSpaceCache = new Cacheable({
  generateKey: (userId: string) => `user_space:${userId}`,
  fetchData: async (userId: string) => {
    const space = await prisma.userPartner.findFirst({
      where: { deletedAt: null, OR: [{ userId }, { partnerId: userId }] },
      include: { subscription: true, user: true, partner: true },
      orderBy: { joinedAt: "desc" },
    });
    return space;
  },
  ttlSeconds: 60, // cache for 60 seconds
});

export async function spaceFor(userId: string) {
  const space = await userSpaceCache.execute(userId);
  if (!space) throw new AppError(404, "No shared space found");
  return space;
}

export async function writableSpace(userId: string) {
  const space = await spaceFor(userId);
  const subscription = space.subscription;
  const active =
    !subscription ||
    (subscription.trialEndsAt && subscription.trialEndsAt > new Date()) ||
    (subscription.activeUntil && subscription.activeUntil > new Date());
  if (!active)
    throw new AppError(
      402,
      "Your trial has ended. Choose a plan to add new activity.",
    );
  return space;
}

const inviteCode = () =>
  Array.from(
    { length: 8 },
    () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)],
  ).join("");

async function generateUniqueInviteCode(
  isUsed: (code: string) => Promise<boolean>,
) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = inviteCode();
    if (!(await isUsed(code))) return code;
  }
  throw new AppError(
    503,
    "Could not generate an invite code. Please try again.",
  );
}

const isInviteCodeUsed = async (
  code: string,
  transaction: Prisma.TransactionClient,
) => {
  const partner = await transaction.userPartner.findUnique({
    where: { invitationCode: code },
    select: { id: true },
  });
  return Boolean(partner);
};

export const userHasPreviousRelationShipCache = new Cacheable({
  generateKey: (userId: string) => `user_has_previous_relationship:${userId}`,
  fetchData: async (userId: string) => {
    const count = await prisma.userPartner.count({
      where: {
        status: "accepted",
        deletedAt: { not: null },
        OR: [{ userId }, { partnerId: userId }],
      },
    });
    return count > 0;
  },
  ttlSeconds: 60, // cache for 60 seconds
});

export const saveRelationship = async (
  userId: string,
  input: SaveRelationshipInput,
) => {
  const result = await prisma.$transaction(async (transaction) => {
    const existing = await transaction.userPartner.findFirst({
      where: {
        deletedAt: null,
        status: { in: ["invited", "accepted"] },
        OR: [{ userId }, { partnerId: userId }],
      },
      orderBy: { invitedAt: "desc" },
    });
    const invitationCode =
      existing?.invitationCode ??
      (await generateUniqueInviteCode(async (code) =>
        isInviteCodeUsed(code, transaction),
      ));

    const relationshipData = {
      relationshipType: input.relationshipType,
      goal: input.goal,
      partnerName: input.partnerName,
      anniversary: new Date(input.anniversary),
      invitationCode,
    };
    if (existing) {
      const relationship = await transaction.userPartner.update({
        where: { id: existing.id },
        data: {
          ...relationshipData,
          invitedAt: existing.invitedAt ?? new Date(),
        },
      });
      return { relationship, inviteCode: invitationCode, created: false };
    }
    const relationship = await transaction.userPartner.create({
      data: { userId, ...relationshipData, invitedAt: new Date() },
    });
    await transaction.sharedList.createMany({
      data: ["Date ideas", "Bucket list", "Gifts"].map((name) => ({
        name,
        userPartnerId: relationship.id,
        createdBy: userId,
      })),
    });
    return { relationship, inviteCode: invitationCode, created: true };
  });
  await Promise.all([
    userByIdCacheable.refresh(userId),
    userHasPreviousRelationShipCache.refresh(userId),
  ]);
  return { ...result, user: await getUserProfile(userId) };
};

export const getCurrentRelationship = (userId: string) => spaceFor(userId);

export const getLatestPartnerActivity = async (userId: string) => {
  const space = await spaceFor(userId);
  const partnerId = space.userId === userId ? space.partnerId : space.userId;
  if (!partnerId) return null;

  const [memory, photo, plan, listItem] = await Promise.all([
    prisma.partnerMemories.findFirst({
      where: { userPartnerId: space.id, createdBy: partnerId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, createdAt: true },
    }),
    prisma.partnerMemoryItem.findFirst({
      where: {
        uploadedBy: partnerId,
        deletedAt: null,
        partnerMemory: { userPartnerId: space.id, deletedAt: null },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        partnerMemory: { select: { id: true, title: true } },
      },
    }),
    prisma.userPartnerPlans.findFirst({
      where: { userPartnerId: space.id, createdBy: partnerId },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, createdAt: true },
    }),
    prisma.sharedListItem.findFirst({
      where: { createdBy: partnerId, list: { userPartnerId: space.id } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        createdAt: true,
        list: { select: { name: true } },
      },
    }),
  ]);

  const activities = [
    memory && {
      entityId: memory.id,
      entityType: "memory" as const,
      createdAt: memory.createdAt,
      title: `Created a memory: ${memory.title}`,
    },
    photo && {
      entityId: photo.partnerMemory.id,
      entityType: "memory" as const,
      createdAt: photo.createdAt,
      title: `Shared a photo in ${photo.partnerMemory.title}`,
    },
    plan && {
      entityId: plan.id,
      entityType: "plan" as const,
      createdAt: plan.createdAt,
      title: `Created a plan: ${plan.title}`,
    },
    listItem && {
      entityId: listItem.id,
      entityType: "list" as const,
      createdAt: listItem.createdAt,
      title: `Added ${listItem.title} to ${listItem.list.name}`,
    },
  ].filter((activity): activity is NonNullable<typeof activity> =>
    Boolean(activity),
  );

  return (
    activities.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    )[0] ?? null
  );
};

export const exportSpace = async (userId: string) => {
  const space = await spaceFor(userId);
  const [memories, plans, lists, checkIns, questions, moods, pokes] =
    await Promise.all([
      prisma.partnerMemories.findMany({
        where: { userPartnerId: space.id },
        include: { partnerMemoryItems: true },
      }),
      prisma.userPartnerPlans.findMany({ where: { userPartnerId: space.id } }),
      prisma.sharedList.findMany({
        where: { userPartnerId: space.id },
        include: { items: true },
      }),
      prisma.weeklyCheckIn.findMany({
        where: { userPartnerId: space.id },
        include: { weeklyCheckInQnAs: true },
      }),
      prisma.dailyQuestion.findMany({
        where: { userPartnerId: space.id },
        include: { dailyQuestionAnswers: true },
      }),
      prisma.userMood.findMany({ where: { userId } }),
      prisma.poke.findMany({ where: { userPartnerId: space.id } }),
    ]);
  return {
    exportedAt: new Date(),
    relationship: space,
    memories,
    plans,
    lists,
    checkIns,
    questions,
    moods,
    pokes,
  };
};

export const unlinkRelationship = async (
  userId: string,
  input: UnlinkRelationshipInput,
) => {
  const space = await spaceFor(userId);
  const partnerId = space.userId === userId ? space.partnerId : space.userId;
  await prisma.$transaction(async (transaction) => {
    await transaction.user.update({
      where: { id: userId },
      data: { partnerId: null },
    });
    if (partnerId)
      await transaction.user.update({
        where: { id: partnerId },
        data: { partnerId: null },
      });
    // Keep the relationship and its shared records for history, reconnects,
    // and auditability. All normal space queries exclude soft-deleted spaces.
    await transaction.userPartner.update({
      where: { id: space.id },
      data: { deletedAt: new Date(), brokenAt: new Date() },
    });
  });
  await Promise.all([
    userByIdCacheable.refresh(userId),
    userSpaceCache.refresh(userId),
    ...(partnerId
      ? [
          userByIdCacheable.refresh(partnerId),
          userSpaceCache.refresh(partnerId),
        ]
      : []),
  ]);
  return { mode: input.mode, unlinkedAt: new Date() };
};

export const reconnectRelationship = async (userId: string) => {
  const space = await prisma.userPartner.findFirst({
    where: {
      brokenAt: { not: null },
      status: "accepted",
      OR: [{ userId }, { partnerId: userId }],
    },
    orderBy: { brokenAt: "desc" },
    include: { reconnectRequests: { where: { cancelledAt: null } } },
  });
  if (!space) throw new AppError(404, "No previous relationship to reconnect");
  await prisma.reconnectRequest.upsert({
    where: {
      userPartnerId_requesterId: {
        userPartnerId: space.id,
        requesterId: userId,
      },
    },
    update: { cancelledAt: null },
    create: { userPartnerId: space.id, requesterId: userId },
  });
  const otherId = space.userId === userId ? space.partnerId : space.userId;
  const mutual =
    otherId !== null &&
    space.reconnectRequests.some((request) => request.requesterId === otherId);
  if (!mutual)
    return {
      statusCode: 202,
      body: {
        mutual: false,
        message:
          "Request saved. Your partner will not be told unless they also ask.",
      },
    };
  await prisma.$transaction(async (transaction) => {
    await Promise.all([
      transaction.userPartner.update({
        where: { id: space.id },
        data: { deletedAt: null, brokenAt: null, restoredAt: new Date() },
      }),
      transaction.user.update({
        where: { id: space.userId },
        data: { partnerId: space.partnerId },
      }),
      space.partnerId
        ? transaction.user.update({
            where: { id: space.partnerId },
            data: { partnerId: space.userId },
          })
        : null,
      transaction.reconnectRequest.deleteMany({
        where: { userPartnerId: space.id },
      }),
    ]);
  });
  await Promise.allSettled([
    userSpaceCache.refresh(userId),
    userHasPreviousRelationShipCache.refresh(userId),
  ]);
  return {
    statusCode: 200,
    body: { mutual: true, message: "You are reconnected." },
  };
};

export const saveQuestionTime = async (
  userId: string,
  input: { dailyQuestionTime: string },
) => {
  const space = await spaceFor(userId);
  const updatedSpace = await prisma.userPartner.update({
    where: { id: space.id },
    data: { dailyQuestionTime: new Date(input.dailyQuestionTime) },
  });
  await Promise.allSettled([
    userSpaceCache.refresh(updatedSpace.userId),
    updatedSpace.partnerId
      ? userSpaceCache.refresh(updatedSpace.partnerId)
      : null,
    userByIdCacheable.refresh(updatedSpace.userId),
    updatedSpace.partnerId
      ? userByIdCacheable.refresh(updatedSpace.partnerId)
      : null,
    userHasPreviousRelationShipCache.refresh(updatedSpace.userId),
    updatedSpace.partnerId
      ? userHasPreviousRelationShipCache.refresh(updatedSpace.partnerId)
      : null,
  ]);
  return updatedSpace;
};

import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/app-error";
import {
  refreshRelationshipCaches,
  spaceFor,
} from "../space/space.service";
import dayjs from "dayjs";

const getActiveInvitation = async (code: string) => {
  const relationship = await prisma.userPartner.findUnique({
    where: { invitationCode: code },
    include: {
      user: {
        select: { id: true, name: true, profilePicture: true },
      },
    },
  });
  if (
    !relationship ||
    relationship.status !== "invited" ||
    relationship.deletedAt
  ) {
    throw new AppError(404, "Invite not found or no longer active");
  }
  return relationship;
};

export const verifyInvitation = async (code: string) => {
  const relationship = await getActiveInvitation(code);
  return {
    valid: true,
    invitation: {
      relationshipType: relationship.relationshipType,
      goal: relationship.goal,
      partnerName: relationship.partnerName,
      anniversary: relationship.anniversary,
      invitedAt: relationship.invitedAt,
      inviter: relationship.user,
    },
  };
};

export const acceptInvitation = async (userId: string, code: string) => {
  const relationship = await getActiveInvitation(code);
  if (relationship.userId === userId) {
    throw new AppError(400, "You cannot accept your own invite");
  }

  const updated = await prisma.$transaction(async (transaction) => {
    await transaction.user.update({
      where: { id: relationship.userId },
      data: { partnerId: userId },
    });
    await transaction.user.update({
      where: { id: userId },
      data: { partnerId: relationship.userId },
    });
    const acceptedRelationship = await transaction.userPartner.update({
      where: { id: relationship.id },
      data: { partnerId: userId, status: "accepted", joinedAt: new Date() },
    });
    await transaction.subscription.create({
      data: {
        userPartnerId: relationship.id,
        trialEndsAt: dayjs().add(14, "day").startOf("day").toDate(),
      },
    });
    return acceptedRelationship;
  });
  await refreshRelationshipCaches(updated.userId, updated.partnerId);
  return updated;
};

export const resendInvitation = async (userId: string) => {
  const space = await spaceFor(userId);
  if (space.status !== "invited")
    throw new AppError(409, "This invite has already been accepted");
  if (space.userId !== userId)
    throw new AppError(403, "Only the inviter can resend this invite");
  const updated = await prisma.userPartner.update({
    where: { id: space.id },
    data: { invitedAt: new Date() },
  });
  await refreshRelationshipCaches(space.userId, space.partnerId);
  return { inviteCode: updated.invitationCode, invitedAt: updated.invitedAt };
};

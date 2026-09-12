import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/app-error";
import { spaceFor } from "../space/space.service";

export const acceptInvitation = async (userId: string, code: string) => {
  const relationship = await prisma.userPartner.findUnique({ where: { invitationCode: code.toUpperCase() } });
  if (!relationship || relationship.status !== "invited" || relationship.deletedAt) {
    throw new AppError(404, "Invite not found or no longer active");
  }
  if (relationship.userId === userId) throw new AppError(400, "You cannot accept your own invite");
  return prisma.$transaction(async (transaction) => {
    await transaction.user.update({ where: { id: relationship.userId }, data: { partnerId: userId } });
    await transaction.user.update({ where: { id: userId }, data: { partnerId: relationship.userId } });
    const updated = await transaction.userPartner.update({ where: { id: relationship.id }, data: { partnerId: userId, status: "accepted", joinedAt: new Date() } });
    await transaction.subscription.create({ data: { userPartnerId: relationship.id, trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) } });
    return updated;
  });
};

export const resendInvitation = async (userId: string) => {
  const space = await spaceFor(userId);
  if (space.status !== "invited") throw new AppError(409, "This invite has already been accepted");
  if (space.userId !== userId) throw new AppError(403, "Only the inviter can resend this invite");
  const updated = await prisma.userPartner.update({ where: { id: space.id }, data: { invitedAt: new Date() } });
  return { inviteCode: updated.invitationCode, invitedAt: updated.invitedAt };
};

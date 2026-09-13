import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/app-error";
import { writableSpace } from "../space/space.service";
import type { PokeInput } from "./poke.schema";

export const sendPoke = async (userId: string, input: PokeInput) => {
  const space = await writableSpace(userId);
  const recipientId = space.userId === userId ? space.partnerId : space.userId;
  if (!recipientId || space.status !== "accepted") {
    throw new AppError(409, "Your partner has not joined yet");
  }
  const recipient = await prisma.user.findUnique({
    where: { id: recipientId },
    select: { pokesEnabled: true },
  });
  if (!recipient?.pokesEnabled) {
    throw new AppError(403, "Your partner has disabled pokes");
  }
  return prisma.poke.create({
    data: { userPartnerId: space.id, senderId: userId, recipientId, type: input.type },
  });
};

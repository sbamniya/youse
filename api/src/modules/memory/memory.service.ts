import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/app-error";
import { spaceFor, writableSpace } from "../space/space.service";
import type { AddMemoryPhotoInput, CreateMemoryInput, FavoriteMemoryInput, UpdateMemoryItemCaptionInput } from "./memory.schema";
export const list = async (userId: string) => { const space = await spaceFor(userId); return prisma.partnerMemories.findMany({ where: { userPartnerId: space.id, deletedAt: null }, include: { partnerMemoryItems: { where: { deletedAt: null } } }, orderBy: { memoryDate: "desc" } }); };
export const create = async (userId: string, input: CreateMemoryInput) => {
  const space = await writableSpace(userId);
  const { imagePaths, memoryDate, thumbnailPath, ...memory } = input;
  const userImagePrefix = `images/${userId}/`;
  const paths = [...imagePaths, ...(thumbnailPath ? [thumbnailPath] : [])];

  if (paths.some((path) => !path.startsWith(userImagePrefix))) {
    throw new AppError(400, "Memory images must belong to the current user");
  }

  return prisma.partnerMemories.create({
    data: {
      ...memory,
      thumbnail: thumbnailPath,
      memoryDate: memoryDate ? new Date(memoryDate) : null,
      userPartnerId: space.id,
      createdBy: userId,
      partnerMemoryItems: {
        create: imagePaths.map((imageUrl) => ({
          imageUrl,
          uploadedBy: userId,
        })),
      },
    },
    include: { partnerMemoryItems: true },
  });
};
export const addPhoto = async (userId: string, memoryId: string, input: AddMemoryPhotoInput) => {
  const space = await writableSpace(userId);

  if (!input.imagePath.startsWith(`images/${userId}/`)) {
    throw new AppError(400, "Memory images must belong to the current user");
  }

  return prisma.$transaction(async (transaction) => {
    const memory = await transaction.partnerMemories.findFirst({
      where: {
        id: memoryId,
        userPartnerId: space.id,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!memory) {
      throw new AppError(404, "Memory not found");
    }

    return transaction.partnerMemoryItem.create({
      data: {
        partnerMemoryId: memory.id,
        imageUrl: input.imagePath,
        caption: input.caption ?? null,
        uploadedBy: userId,
      },
    });
  });
};
export const updatePhotoCaption = async (
  userId: string,
  memoryId: string,
  itemId: string,
  input: UpdateMemoryItemCaptionInput,
) => {
  const space = await writableSpace(userId);
  const item = await prisma.partnerMemoryItem.findFirst({
    where: {
      id: itemId,
      partnerMemoryId: memoryId,
      deletedAt: null,
      partnerMemory: {
        userPartnerId: space.id,
        deletedAt: null,
      },
    },
    select: { id: true },
  });

  if (!item) {
    throw new AppError(404, "Memory photo not found");
  }

  return prisma.partnerMemoryItem.update({
    where: { id: item.id },
    data: { caption: input.caption?.trim() || null },
  });
};
export const removePhoto = async (
  userId: string,
  memoryId: string,
  itemId: string,
) => {
  const space = await writableSpace(userId);

  await prisma.$transaction(async (transaction) => {
    const item = await transaction.partnerMemoryItem.findFirst({
      where: {
        id: itemId,
        partnerMemoryId: memoryId,
        deletedAt: null,
        partnerMemory: {
          userPartnerId: space.id,
          deletedAt: null,
        },
      },
      include: { partnerMemory: { select: { thumbnail: true } } },
    });

    if (!item) {
      throw new AppError(404, "Memory photo not found");
    }

    await transaction.partnerMemoryItem.update({
      where: { id: item.id },
      data: { deletedAt: new Date() },
    });

    if (item.partnerMemory.thumbnail === item.imageUrl) {
      const replacement = await transaction.partnerMemoryItem.findFirst({
        where: {
          partnerMemoryId: memoryId,
          id: { not: item.id },
          deletedAt: null,
          imageUrl: { not: null },
        },
        orderBy: { createdAt: "asc" },
        select: { imageUrl: true },
      });

      await transaction.partnerMemories.update({
        where: { id: memoryId },
        data: { thumbnail: replacement?.imageUrl ?? null },
      });
    }
  });
};
export const setFavorite = async (userId: string, memoryId: string, input: FavoriteMemoryInput) => { const space = await writableSpace(userId); const result = await prisma.partnerMemories.updateMany({ where: { id: memoryId, userPartnerId: space.id, deletedAt: null }, data: input }); if (!result.count) throw new AppError(404, "Memory not found"); };
export const get = async (userId: string, memoryId: string) => { const space = await spaceFor(userId); const memory = await prisma.partnerMemories.findFirst({ where: { id: memoryId, userPartnerId: space.id, deletedAt: null }, include: { partnerMemoryItems: { where: { deletedAt: null } }, creator: { select: { id: true, name: true, profilePicture: true } } } }); if (!memory) throw new AppError(404, "Memory not found"); return memory; };
export const remove = async (userId: string, memoryId: string) => { const space = await writableSpace(userId); const result = await prisma.partnerMemories.updateMany({ where: { id: memoryId, userPartnerId: space.id, deletedAt: null }, data: { deletedAt: new Date() } }); if (!result.count) throw new AppError(404, "Memory not found"); };

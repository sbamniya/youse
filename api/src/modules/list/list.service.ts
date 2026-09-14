import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/app-error";
import { spaceFor, writableSpace } from "../space/space.service";
import type { CreateListInput, CreateListItemInput, UpdateListInput, UpdateListItemInput } from "./list.schema";

export const DEFAULT_LIST_NAMES = ["Date ideas", "Bucket list", "Gifts"] as const;

const listsForSpace = (userPartnerId: string) =>
  prisma.sharedList.findMany({
    where: { userPartnerId },
    include: { items: { orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "asc" },
  });

export const list = async (userId: string) => {
  const space = await spaceFor(userId);
  let lists = await listsForSpace(space.id);

  if (lists.length) return lists;

  await prisma.sharedList.createMany({
    data: DEFAULT_LIST_NAMES.map((name) => ({
      name,
      userPartnerId: space.id,
      createdBy: userId,
    })),
    skipDuplicates: true,
  });
  lists = await listsForSpace(space.id);
  return lists;
};
export const create = async (userId: string, input: CreateListInput) => { const space = await writableSpace(userId); return prisma.sharedList.create({ data: { ...input, userPartnerId: space.id, createdBy: userId } }); };
export const update = async (userId: string, listId: string, input: UpdateListInput) => { const space = await writableSpace(userId); const result = await prisma.sharedList.updateMany({ where: { id: listId, userPartnerId: space.id }, data: input }); if (!result.count) throw new AppError(404, "List not found"); return prisma.sharedList.findUnique({ where: { id: listId }, include: { items: { orderBy: { createdAt: "asc" } } } }); };
export const createItem = async (userId: string, listId: string, input: CreateListItemInput) => { const space = await writableSpace(userId); const list = await prisma.sharedList.findFirst({ where: { id: listId, userPartnerId: space.id } }); if (!list) throw new AppError(404, "List not found"); return prisma.sharedListItem.create({ data: { ...input, listId: list.id, createdBy: userId } }); };
export const updateItem = async (userId: string, itemId: string, input: UpdateListItemInput) => { const space = await writableSpace(userId); const item = await prisma.sharedListItem.findFirst({ where: { id: itemId, list: { userPartnerId: space.id } } }); if (!item) throw new AppError(404, "List item not found"); return prisma.sharedListItem.update({ where: { id: item.id }, data: input }); };
export const remove = async (userId: string, listId: string) => { const space = await writableSpace(userId); const result = await prisma.sharedList.deleteMany({ where: { id: listId, userPartnerId: space.id } }); if (!result.count) throw new AppError(404, "List not found"); };
export const removeItem = async (userId: string, itemId: string) => { const space = await writableSpace(userId); const result = await prisma.sharedListItem.deleteMany({ where: { id: itemId, list: { userPartnerId: space.id } } }); if (!result.count) throw new AppError(404, "List item not found"); };

import { queryOptions } from "@tanstack/react-query";
import dayjs from "dayjs";

import api from "./api";
import { getImageUrl } from "./image-url";

export type MemoryItem = {
  id: string;
  partnerMemoryId: string;
  imageUrl: string | null;
  caption: string | null;
  uploadedBy: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AddMemoryPhotoInput = {
  imagePath: string;
  caption: string | null;
};

export type ApiMemory = {
  id: string;
  userPartnerId: string;
  title: string;
  description: string | null;
  memoryDate: string | null;
  thumbnail: string | null;
  location: string | null;
  isFavorite: boolean;
  createdBy: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  partnerMemoryItems: MemoryItem[];
  creator?: {
    id: string;
    name: string | null;
    profilePicture: string | null;
  };
};

export type CreateMemoryInput = {
  title: string;
  description: string | null;
  memoryDate: string | null;
  thumbnailPath: string | null;
  location: string | null;
  imagePaths: string[];
};

export const memoriesQueryKey = ["memories"] as const;

export async function getMemories(): Promise<ApiMemory[]> {
  return api.get<ApiMemory[]>("/memories");
}

export async function createMemory(
  input: CreateMemoryInput,
): Promise<ApiMemory> {
  return api.post<ApiMemory, CreateMemoryInput>("/memories", input);
}

export async function addMemoryPhoto(
  memoryId: string,
  input: AddMemoryPhotoInput,
): Promise<MemoryItem> {
  return api.post<MemoryItem, AddMemoryPhotoInput>(
    `/memories/${encodeURIComponent(memoryId)}/photos`,
    input,
  );
}

export const memoriesQueryOptions = queryOptions({
  queryKey: memoriesQueryKey,
  queryFn: getMemories,
});

export const memoryQueryKey = (memoryId: string) =>
  [...memoriesQueryKey, memoryId] as const;

export async function getMemory(memoryId: string): Promise<ApiMemory> {
  return api.get<ApiMemory>(`/memories/${encodeURIComponent(memoryId)}`);
}

export const memoryQueryOptions = (memoryId: string) =>
  queryOptions({
    queryKey: memoryQueryKey(memoryId),
    queryFn: () => getMemory(memoryId),
  });

export function getMemoryImageUrl(memory: ApiMemory): string | null {
  return getImageUrl(
    memory.thumbnail ??
      memory.partnerMemoryItems.find((item) => item.imageUrl)?.imageUrl,
  );
}

export function formatMemoryDate(
  memoryDate: string | null,
  format = "D MMM",
): string {
  const date = dayjs(memoryDate);
  return memoryDate && date.isValid() ? date.format(format) : "DATE NOT SET";
}

export function getOnThisDayMemory(
  memories: ApiMemory[],
  today = dayjs(),
): ApiMemory | undefined {
  return memories.find((memory) => {
    if (!memory.memoryDate) {
      return false;
    }

    const memoryDate = dayjs(memory.memoryDate);
    return (
      memoryDate.isValid() &&
      memoryDate.month() === today.month() &&
      memoryDate.date() === today.date()
    );
  });
}

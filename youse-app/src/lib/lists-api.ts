import { queryOptions } from "@tanstack/react-query";

import api from "./api";

export type SharedListItem = {
  id: string;
  listId: string;
  title: string;
  note: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SharedList = {
  id: string;
  userPartnerId: string;
  name: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  items: SharedListItem[];
};

export const listsQueryKey = ["shared-lists"] as const;

export async function getLists(): Promise<SharedList[]> {
  return api.get<SharedList[]>("/lists");
}

export const listsQueryOptions = queryOptions({
  queryKey: listsQueryKey,
  queryFn: getLists,
});

export async function createList(name: string): Promise<SharedList> {
  return api.post<SharedList, { name: string }>("/lists", { name });
}

export async function updateList(listId: string, name: string): Promise<SharedList> {
  return api.patch<SharedList, { name: string }>(
    `/lists/${encodeURIComponent(listId)}`,
    { name },
  );
}

export async function deleteList(listId: string): Promise<void> {
  await api.delete<void>(`/lists/${encodeURIComponent(listId)}`);
}

export async function createListItem(
  listId: string,
  title: string,
): Promise<SharedListItem> {
  return api.post<SharedListItem, { title: string }>(
    `/lists/${encodeURIComponent(listId)}/items`,
    { title },
  );
}

export async function updateListItem(
  itemId: string,
  input: Partial<Pick<SharedListItem, "title" | "note" | "completed">>,
): Promise<SharedListItem> {
  return api.patch<SharedListItem, typeof input>(
    `/lists/items/${encodeURIComponent(itemId)}`,
    input,
  );
}

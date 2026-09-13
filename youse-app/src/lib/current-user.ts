import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import api from "./api";
import { authStorage } from "./auth-storage";
import type { AuthUser } from "./auth-user";

export const currentUserQueryKey = ["auth", "me"] as const;

export function usePersistCurrentUser() {
  const queryClient = useQueryClient();

  return useCallback(
    async (user: AuthUser) => {
      queryClient.setQueryData(currentUserQueryKey, user);
      await authStorage.setUser(user);
    },
    [queryClient],
  );
}

export async function refreshCurrentUser(): Promise<AuthUser> {
  const currentUser = await api.get<AuthUser>("/auth/me");
  await authStorage.setUser(currentUser);
  return currentUser;
}

export async function getCurrentUser(): Promise<AuthUser> {
  // Most screens can render immediately from persisted state. Call
  // refreshCurrentUser explicitly after a mutation that changes server data.
  const storedUser = await authStorage.getUser();
  if (storedUser) {
    return storedUser;
  }

  return refreshCurrentUser();
}

import api from "./api";
import { authStorage } from "./auth-storage";
import type { AuthUser } from "./auth-user";

export const currentUserQueryKey = ["auth", "me"] as const;

export async function getCurrentUser(): Promise<AuthUser> {
  const storedUser = await authStorage.getUser();
  if (storedUser) {
    return storedUser;
  }

  const currentUser = await api.get<AuthUser>("/auth/me");
  await authStorage.setUser(currentUser);
  return currentUser;
}

import type { Href } from "expo-router";

export type AuthUser = {
  id: string;
  phone: string;
  name: string | null;
  profilePicture: string | null;
  timezone: string | null;
  gender: string | null;
  birthday: string | null;
  partnerId: string | null;
  partnerSpace: unknown | null;
};

export type AuthenticationResponse = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
};

export type UserRoutingMode = "login" | "returning";

export function getUserDestination(
  user: AuthUser,
  mode: UserRoutingMode,
): Href {
  if (!user.name?.trim() || !user.profilePicture) {
    return {
      pathname: "/onboarding-details",
      params: { mode, userId: user.id },
    };
  }

  if (user.partnerId) {
    return mode === "login" ? "/connected" : "/(tabs)/today";
  }

  if (user.partnerSpace) {
    return mode === "login" ? "/invite-code" : "/invite-sent";
  }

  return "/invite-partner";
}

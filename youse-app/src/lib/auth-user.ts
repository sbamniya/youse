import type { Href } from "expo-router";

export type AuthUser = {
  id: string;
  phone: string;
  name: string | null;
  profilePicture: string | null;
  timezone: string | null;
  gender: string | null;
  birthday: string | null;
  pokesEnabled: boolean;
  partnerId: string | null;
  partnerSpace: unknown | null;
  partnerName: string | null;
  invitationCode: string | null;
  anniversary: string | null;
  relationshipType: string | null;
  relationshipGoal: string | null;
  hasPreviousRelationship: boolean;
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

  if (user.hasPreviousRelationship) {
    return "/invite-code";
  }

  // Relationship setup is completed in onboarding steps 2 and 3. A user who
  // has finished their profile but has not created a shared space must resume
  // that flow instead of being sent to the old invite-only screen.
  return {
    pathname: "/onboarding-details",
    params: { mode, userId: user.id },
  };
}

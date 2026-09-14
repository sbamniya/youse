import { useMutation, useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { router, useLocalSearchParams } from "expo-router";
import { Heart, UserRound } from "lucide-react-native";
import { ActivityIndicator, Image, View } from "react-native";

import { AppHeader } from "@/components/app/app-header";
import { AppScreen, AppScrollScreen } from "@/components/app/app-screen";
import { PageIntro } from "@/components/app/page-intro";
import { PrimaryAction } from "@/components/app/primary-action";
import { ThemedIcon } from "@/components/app/themed-icon";
import { Text } from "@/components/ui/text";
import { getUserDestination } from "@/lib/auth-user";
import {
  refreshCurrentUser,
  usePersistCurrentUser,
} from "@/lib/current-user";
import { getImageUrl } from "@/lib/image-url";
import {
  VERIFIED_INVITATION_STALE_TIME_MS,
  acceptInvitationCode,
  invitationQueryKey,
  normalizeInvitationCode,
  verifyInvitationCode,
} from "@/lib/invite";

export default function InviteWelcome() {
  const persistCurrentUser = usePersistCurrentUser();
  const { code, flow } = useLocalSearchParams<{
    code?: string;
    flow?: "authenticated";
  }>();
  const normalizedCode = normalizeInvitationCode(code ?? "");
  const isAuthenticatedFlow = flow === "authenticated";
  const {
    data,
    isError,
    isPending,
    refetch,
  } = useQuery({
    // The code-entry screen seeds this cache. The query function also supports
    // opening this route directly from a deep link or after an app reload.
    queryKey: invitationQueryKey(normalizedCode),
    queryFn: () => verifyInvitationCode(normalizedCode),
    enabled: Boolean(normalizedCode),
    retry: false,
    staleTime: VERIFIED_INVITATION_STALE_TIME_MS,
  });
  const {
    error: acceptError,
    isPending: isAccepting,
    mutate: acceptInvitation,
  } = useMutation({
    mutationFn: async () => {
      await acceptInvitationCode(normalizedCode);
      return refreshCurrentUser();
    },
    onSuccess: async (updatedUser) => {
      await persistCurrentUser(updatedUser);
      router.replace(getUserDestination(updatedUser, "login"));
    },
  });

  if (!normalizedCode || isError) {
    return (
      <AppScreen>
        <View className="flex-1 px-3">
          <AppHeader />
          <View className="flex-1 items-center justify-center px-3">
            <Text className="text-center font-serif text-[18px] text-muted-foreground">
              We couldn&apos;t load this invitation. Check the code and try again.
            </Text>
            {normalizedCode ? (
              <PrimaryAction
                className="mt-7 w-full"
                label="Try again"
                onPress={() => void refetch()}
              />
            ) : null}
          </View>
        </View>
      </AppScreen>
    );
  }

  if (isPending || !data) {
    return (
      <AppScreen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator colorClassName="accent-primary" size="large" />
        </View>
      </AppScreen>
    );
  }

  const { invitation } = data;
  const inviterName = invitation.inviter.name?.trim() || "Your partner";
  const inviterImage = getImageUrl(invitation.inviter.profilePicture);
  const anniversary = dayjs(invitation.anniversary.slice(0, 10));

  return (
    <AppScrollScreen>
      <AppHeader />

      <View className="items-center pt-10">
        <View className="relative">
          {inviterImage ? (
            <Image
              source={{ uri: inviterImage }}
              resizeMode="cover"
              className="h-40 w-40 rounded-full border-2 border-primary"
            />
          ) : (
            <View className="h-40 w-40 items-center justify-center rounded-full border-2 border-primary bg-muted">
              <ThemedIcon icon={UserRound} tone="muted" size={64} />
            </View>
          )}
          <View className="absolute -bottom-2 right-1 h-12 w-12 items-center justify-center rounded-full bg-primary">
            <ThemedIcon icon={Heart} tone="primaryForeground" filled size={22} />
          </View>
        </View>

        <PageIntro
          align="center"
          className="mt-9"
          description={`${inviterName} invited you to join a shared space on Youse.`}
          displayTitle
          eyebrow="YOU'RE INVITED"
          title={`Welcome, ${invitation.partnerName}`}
        />
        <View className="mt-7 w-full rounded-2xl border border-muted px-6 py-5">
          <InvitationDetail label="INVITE CODE" value={normalizedCode} />
          <InvitationDetail
            className="mt-5"
            label="RELATIONSHIP"
            value={formatRelationshipType(invitation.relationshipType)}
          />
          <InvitationDetail
            className="mt-5"
            label="YOUR SHARED GOAL"
            value={invitation.goal}
          />
          <InvitationDetail
            className="mt-5"
            label="ANNIVERSARY"
            value={
              anniversary.isValid()
                ? anniversary.format("MMMM D, YYYY")
                : "Not set"
            }
          />
        </View>
      </View>

      <PrimaryAction
        className="mt-8"
        disabled={isAccepting}
        label={isAccepting ? "Accepting invite..." : "Continue"}
        onPress={() => {
          if (isAuthenticatedFlow) {
            acceptInvitation();
            return;
          }

          router.push({
            pathname: "/email-otp",
            params: {
              flow: "invite",
              invitationCode: normalizedCode,
              name: invitation.partnerName,
            },
          });
        }}
        showArrow
      />
      {acceptError ? (
        <Text className="mt-3 font-serif text-[15px] text-destructive">
          We couldn&apos;t accept this invitation. Please try again.
        </Text>
      ) : null}
    </AppScrollScreen>
  );
}

function InvitationDetail({
  className,
  label,
  value,
}: {
  className?: string;
  label: string;
  value: string;
}) {
  return (
    <View className={className}>
      <Text
        className="text-[11px] text-placeholder"
        style={{ letterSpacing: 3 }}
      >
        {label}
      </Text>
      <Text className="mt-2 font-serif text-[18px] text-foreground">
        {value}
      </Text>
    </View>
  );
}

function formatRelationshipType(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

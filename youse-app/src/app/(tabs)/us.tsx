import { useQuery } from "@tanstack/react-query";
import { router, type Href } from "expo-router";
import { ChevronRight, UserRound, X } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PrimaryAction } from "@/components/app/primary-action";
import { ThemedIcon } from "@/components/app/themed-icon";
import { TrialBadge } from "@/components/app/trial-badge";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Text } from "@/components/ui/text";
import {
  currentSpaceQueryOptions,
  getPartnerFromSpace,
  getTrialDaysRemaining,
} from "@/lib/current-space";
import { currentUserQueryKey, getCurrentUser } from "@/lib/current-user";
import { getImageUrl } from "@/lib/image-url";
import { cn } from "@/lib/utils";

const dailyQuestionTimes = Array.from({ length: 46 }, (_, index) => {
  const totalMinutes = 60 + index * 30;
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  const period = hour < 12 ? "AM" : "PM";
  const displayHour = hour % 12 || 12;

  return `${String(displayHour).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${period}`;
});

type SettingsRow = {
  comingSoon?: boolean;
  detail: string;
  route?: Href;
  section?: string;
  title: string;
};

const settingsRows: SettingsRow[] = [
  {
    detail: "8:00 AM",
    section: "NOTIFICATIONS",
    title: "Daily question",
  },
  {
    detail: "On",
    title: "Pokes from Arjun",
  },
  {
    detail: "Download a copy of your memories",
    section: "PRIVACY & DATA",
    title: "Export our data",
    comingSoon: true,
  },
  {
    detail: "How we keep your data safe",
    title: "Privacy",
    route: "/privacy",
  },
  {
    detail: "The guidelines for using Youse",
    title: "Terms & conditions",
    route: "/terms",
  },
];

export default function Us() {
  const insets = useSafeAreaInsets();
  const [dailyQuestionTime, setDailyQuestionTime] = useState<string | null>(
    null,
  );
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [pokesEnabled, setPokesEnabled] = useState(true);
  const {
    data: currentUser,
    isError: isUserError,
    isPending: isUserPending,
    refetch: refetchCurrentUser,
  } = useQuery({
    queryKey: currentUserQueryKey,
    queryFn: getCurrentUser,
  });
  const {
    data: currentSpace,
    isError: isSpaceError,
    isPending: isSpacePending,
    refetch: refetchCurrentSpace,
  } = useQuery(currentSpaceQueryOptions);

  if (isUserPending || isSpacePending || !currentUser || !currentSpace) {
    if (isUserError || isSpaceError) {
      return (
        <View className="flex-1 items-center justify-center bg-background px-6">
          <Text className="text-center font-serif text-[18px] text-muted-foreground">
            We couldn&apos;t load your shared space. Check your connection and try
            again.
          </Text>
          <PrimaryAction
            className="mt-7 w-full"
            label="Try again"
            onPress={() => {
              void refetchCurrentUser();
              void refetchCurrentSpace();
            }}
          />
        </View>
      );
    }

    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator colorClassName="accent-primary" size="large" />
      </View>
    );
  }

  const partner = getPartnerFromSpace(currentSpace, currentUser.id);
  const currentMember =
    currentSpace.user.id === currentUser.id
      ? currentSpace.user
      : currentSpace.partner?.id === currentUser.id
        ? currentSpace.partner
        : currentUser;
  const currentUserName = currentMember.name?.trim() || "Your profile";
  const partnerName =
    partner?.name?.trim() ||
    currentSpace.partnerName?.trim() ||
    currentUser.partnerName?.trim() ||
    "Your partner";
  const currentUserImage = getImageUrl(currentMember.profilePicture);
  const relationshipDetail = formatRelationshipStatus(
    currentSpace.status,
    currentSpace.joinedAt ?? currentSpace.invitedAt,
  );
  const displayedDailyQuestionTime =
    dailyQuestionTime ??
    formatDailyQuestionTime(
      currentSpace.dailyQuestionTime,
      currentMember.timezone,
    );
  const trialDaysRemaining = getTrialDaysRemaining(currentSpace);
  const subscription = getSubscriptionDisplay(currentSpace.subscription);

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-12"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingTop: Math.max(insets.top + 18, 42) }}>
          <Text className="text-[28px] font-bold leading-10.75 text-foreground">
            Us
          </Text>
          <Text
            className="mt-2 text-[10px] font-semibold text-muted-foreground"
            style={{ letterSpacing: 2 }}
          >
            SAME PEOPLE{"\n"}BRIGHTER DAYS
          </Text>
          <View className="mt-2 h-px w-6 bg-muted-foreground" />

          <Pressable
            accessibilityLabel={`Edit ${currentUserName} profile`}
            className="mt-6 flex-row items-center active:opacity-70"
            onPress={() => router.push("/profile")}
          >
            <ProfileAvatar imageUrl={currentUserImage} />
            <View className="ml-5 flex-1">
              <Text className="text-[16px] font-bold leading-8 text-foreground">
                {currentUserName}
              </Text>
              <Text className="mt-1 font-serif text-[14px] text-primary">
                {currentMember.phone}
              </Text>
            </View>
            <ThemedIcon icon={ChevronRight} size={28} strokeWidth={1.5} />
          </Pressable>

          <View className="mt-4 border-t border-border-subtle pt-4">
            <SectionLabel label="RELATIONSHIP" />
            <Pressable
              accessibilityLabel="Manage relationship and billing"
              accessibilityRole="button"
              className="mt-1 flex-row items-center active:opacity-70"
              onPress={() => router.push("/billing")}
            >
              <View className="flex-1">
                <Text className="font-serif text-[16px] text-foreground">
                  {currentUserName} + {partnerName}
                </Text>
                <Text className="mt-1 font-serif text-[12px] text-primary">
                  {relationshipDetail}
                </Text>
              </View>
              <View className="h-21 w-px bg-border-subtle" />
              <View className="ml-6 flex-1">
                <Text className="font-serif text-[16px] text-foreground">
                  {subscription.title}
                </Text>
                {trialDaysRemaining !== null ? (
                  <TrialBadge
                    className="mt-1 self-start"
                    days={trialDaysRemaining}
                    interactive={false}
                  />
                ) : (
                  <Text className="mt-1 font-serif text-[12px] text-primary">
                    {subscription.detail}
                  </Text>
                )}
              </View>
              <ThemedIcon icon={ChevronRight} size={24} strokeWidth={1.5} />
            </Pressable>
          </View>

          {/* <View className="mt-4 border-t border-border-subtle pt-4">
            <SectionLabel label="APPEARANCE" />
            <View className="mt-5 flex-row items-center">
              <View className="flex-1">
                <Text className="font-serif text-[16px] text-foreground">
                  Dark mode
                </Text>
                <Text className="mt-1 font-serif text-[14px] text-primary">
                  A calmer, kinder space
                </Text>
              </View>
              <Switch
                accessibilityLabel="Dark mode"
                onValueChange={setDarkMode}
                thumbColor="#fff6f2"
                trackColor={{ false: "#4c3036", true: "#d9adae" }}
                value={darkMode}
              />
            </View>
          </View> */}

          {settingsRows.map(({ detail, section, title, comingSoon, route }) => {
            const isDailyQuestion = title === "Daily question";
            const isPokes = title === "Pokes from Arjun";
            const rowTitle = isPokes ? `Pokes from ${partnerName}` : title;
            const rowDetail = isDailyQuestion
              ? displayedDailyQuestionTime
              : isPokes
                ? pokesEnabled ? "On" : "Off"
                : detail;

            return (
            <View
              key={title}
              className="mt-4 border-t border-border-subtle pt-4"
            >
              {section ? <SectionLabel label={section} /> : null}
              <Pressable
                accessibilityLabel={rowTitle}
                className={cn(
                  section
                    ? "mt-5 flex-row items-center active:opacity-70"
                    : "flex-row items-center active:opacity-70",
                  {
                    "opacity-50": comingSoon,
                  },
                )}
                disabled={comingSoon}
                onPress={() => {
                  if (comingSoon) return;
                  if (isDailyQuestion) {
                    setIsTimePickerOpen(true);
                    return;
                  }
                  if (isPokes) {
                    setPokesEnabled((current) => !current);
                    return;
                  }
                  if (route) {
                    router.push(route);
                    return;
                  }
                  Alert.alert(rowTitle, rowDetail);
                }}
              >
                <View className="flex-1">
                  <Text className="font-serif text-[16px] text-foreground">
                    {rowTitle}
                    {comingSoon ? " (Coming Soon)" : ""}
                  </Text>
                  <Text className="mt-1 font-serif text-[14px] text-primary">
                    {rowDetail}
                  </Text>
                </View>
                <ThemedIcon icon={ChevronRight} size={24} strokeWidth={1.5} />
              </Pressable>
            </View>
            );
          })}

          <View className="mt-8 border-t border-border-subtle pt-7">
            <SectionLabel label="RELATIONSHIP STATUS" />
            <View className="mt-5 flex-row items-center">
              <Pressable
                accessibilityRole="button"
                className="rounded-full w-full border border-primary px-5 py-3 active:opacity-70"
                onPress={() => router.push("/unlink-partner")}
              >
                <Text className="text-[17px] text-center font-semibold text-primary">
                  Unlink partner
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
      <AlertDialog onOpenChange={setIsTimePickerOpen} open={isTimePickerOpen}>
        <AlertDialogContent className="mx-4 self-stretch rounded-3xl border-border-subtle bg-card p-5 web:mx-0 web:self-center">
          <AlertDialogHeader className="relative pr-12">
            <AlertDialogTitle className="text-left text-[22px] text-foreground">
              Daily question time
            </AlertDialogTitle>
            <AlertDialogCancel
              accessibilityLabel="Close time picker"
              className="absolute -right-1 -top-1 h-10 w-10 items-center justify-center rounded-full border-0 bg-transparent p-0 active:bg-muted"
            >
              <ThemedIcon icon={X} size={19} strokeWidth={2} />
            </AlertDialogCancel>
          </AlertDialogHeader>
          <Text className="-mt-2 font-serif text-[14px] text-muted-foreground">
            Choose when you’d like your daily question.
          </Text>
          <ScrollView className="max-h-80" showsVerticalScrollIndicator={false}>
            <View className="-mx-1 flex-row flex-wrap">
              {dailyQuestionTimes.map((time) => {
                const isSelected = time === displayedDailyQuestionTime;

                return (
                  <View key={time} className="w-1/2 p-1">
                    <Pressable
                      accessibilityRole="radio"
                      accessibilityState={{ checked: isSelected }}
                      className={cn(
                        "h-11 items-center justify-center rounded-xl border active:opacity-75",
                        isSelected
                          ? "border-primary bg-primary"
                          : "border-border-subtle bg-background",
                      )}
                      onPress={() => {
                        setDailyQuestionTime(time);
                        setIsTimePickerOpen(false);
                      }}
                    >
                      <Text
                        className={cn(
                          "text-[14px] font-semibold",
                          isSelected ? "text-primary-foreground" : "text-foreground",
                        )}
                      >
                        {time}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </AlertDialogContent>
      </AlertDialog>
    </View>
  );
}

function ProfileAvatar({ imageUrl }: { imageUrl: string | null }) {
  if (imageUrl) {
    return (
      <Image
        accessibilityLabel="Your profile photo"
        className="h-14 w-14 rounded-full border border-primary"
        resizeMode="cover"
        source={{ uri: imageUrl }}
      />
    );
  }

  return (
    <View className="h-14 w-14 items-center justify-center rounded-full border border-primary bg-card">
      <ThemedIcon icon={UserRound} size={24} strokeWidth={1.6} />
    </View>
  );
}

function formatRelationshipStatus(
  status: "invited" | "accepted" | "rejected",
  dateValue: string | null,
) {
  const label =
    status === "accepted"
      ? "Connected"
      : status === "invited"
        ? "Invited"
        : "Invitation declined";

  if (!dateValue) return label;

  const date = new Date(dateValue);
  if (!Number.isFinite(date.getTime())) return label;

  return `${label} ${new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)}`;
}

function formatDailyQuestionTime(
  value: string | null,
  timeZone: string | null,
) {
  if (!value) return "08:00 AM";

  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "08:00 AM";

  try {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      hour12: true,
      minute: "2-digit",
      ...(timeZone ? { timeZone } : {}),
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      hour12: true,
      minute: "2-digit",
    }).format(date);
  }
}

function getSubscriptionDisplay(subscription: {
  activeUntil: string | null;
  plan: string | null;
  trialEndsAt: string | null;
} | null) {
  if (!subscription) {
    return { title: "Youse access", detail: "Active" };
  }

  const activeUntil = subscription?.activeUntil
    ? new Date(subscription.activeUntil)
    : null;
  const hasActivePlan =
    activeUntil !== null &&
    Number.isFinite(activeUntil.getTime()) &&
    activeUntil.getTime() > Date.now();

  if (hasActivePlan) {
    const planName = subscription?.plan?.trim();
    return {
      title: planName ? `Youse ${planName}` : "Youse membership",
      detail: `Active until ${new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(activeUntil)}`,
    };
  }

  if (subscription?.plan) {
    return { title: `Youse ${subscription.plan}`, detail: "View billing" };
  }

  const trialEnd = subscription.trialEndsAt
    ? new Date(subscription.trialEndsAt).getTime()
    : null;

  return {
    title: "Youse trial",
    detail:
      trialEnd !== null && Number.isFinite(trialEnd) && trialEnd <= Date.now()
        ? "Trial ended"
        : "View billing",
  };
}

function SectionLabel({ label }: { label: string }) {
  return (
    <Text className="text-[12px] font-medium tracking-[4px] text-primary">
      {label}
    </Text>
  );
}

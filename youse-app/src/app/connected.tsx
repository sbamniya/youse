import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  CalendarDays,
  Check,
  Image as ImageIcon,
  Pencil,
  UserRound,
  type LucideIcon,
} from "lucide-react-native";
import { ActivityIndicator, Image, ScrollView, View } from "react-native";
import { useCSSVariable } from "uniwind";

import { AppScreen } from "@/components/app/app-screen";
import { BrandMark } from "@/components/app/brand-mark";
import { PageIntro } from "@/components/app/page-intro";
import { PrimaryAction } from "@/components/app/primary-action";
import { ThemedIcon } from "@/components/app/themed-icon";
import { Text } from "@/components/ui/text";
import {
  currentSpaceQueryOptions,
  getPartnerFromSpace,
} from "@/lib/current-space";
import { currentUserQueryKey, getCurrentUser } from "@/lib/current-user";
import { currentDailyQuestionQueryOptions } from "@/lib/daily-question-api";
import { getImageUrl } from "@/lib/image-url";
import { memoriesQueryOptions } from "@/lib/memory-api";
import { upcomingPlansQueryOptions } from "@/lib/plans-api";

type ReadyItem = {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  loaded: boolean;
};

function getDaysRemaining(endDate: string | null | undefined): number | null {
  if (!endDate) return null;

  const endTime = new Date(endDate).getTime();
  if (!Number.isFinite(endTime) || endTime <= Date.now()) return null;

  return Math.ceil((endTime - Date.now()) / (24 * 60 * 60 * 1000));
}

function MemberAvatar({
  imageUri,
  label,
  overlap = false,
}: {
  imageUri: string | null;
  label: string;
  overlap?: boolean;
}) {
  return (
    <View
      className="aspect-square overflow-hidden rounded-full border-2 border-primary bg-muted"
      style={{ marginLeft: overlap ? -20 : 0, width: "30%" }}
    >
      {imageUri ? (
        <Image
          accessibilityLabel={`${label}'s profile photo`}
          source={{ uri: imageUri }}
          resizeMode="cover"
          className="h-full w-full"
        />
      ) : (
        <View className="h-full w-full items-center justify-center">
          <ThemedIcon icon={UserRound} tone="muted" size={44} />
        </View>
      )}
    </View>
  );
}

export default function Connected() {
  const [card, background] = useCSSVariable([
    "--color-card",
    "--color-background",
  ]) as [string, string];
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
  const {
    data: dailyQuestion,
    isError: isQuestionError,
    isPending: isQuestionPending,
  } = useQuery(currentDailyQuestionQueryOptions);
  const {
    data: memories,
    isError: isMemoriesError,
    isPending: isMemoriesPending,
  } = useQuery(memoriesQueryOptions);
  const {
    data: upcomingPlans,
    isError: isPlansError,
    isPending: isPlansPending,
  } = useQuery(upcomingPlansQueryOptions);

  if (isUserPending || isSpacePending) {
    return (
      <AppScreen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator colorClassName="accent-primary" size="large" />
        </View>
      </AppScreen>
    );
  }

  const partner =
    currentUser && currentSpace
      ? getPartnerFromSpace(currentSpace, currentUser.id)
      : null;

  if (
    isUserError ||
    isSpaceError ||
    !currentUser ||
    !currentSpace ||
    !partner
  ) {
    return (
      <AppScreen>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center font-serif text-[18px] text-muted-foreground">
            We couldn&apos;t load your shared space. Check your connection and
            try again.
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
      </AppScreen>
    );
  }

  const currentUserName = currentUser.name?.trim() || "You";
  const partnerName =
    partner.name?.trim() || currentUser.partnerName?.trim() || "your partner";
  const currentUserImage = getImageUrl(currentUser.profilePicture);
  const partnerImage = getImageUrl(partner.profilePicture);
  const currentUserAnswer = dailyQuestion?.dailyQuestionAnswers.find(
    (answer) => answer.userId === currentUser.id,
  );
  const partnerAnswer = dailyQuestion?.dailyQuestionAnswers.find(
    (answer) => answer.userId === partner.id,
  );

  let questionSubtitle = "Today’s question isn’t available yet.";
  if (isQuestionPending) {
    questionSubtitle = "Loading today’s question…";
  } else if (!isQuestionError && dailyQuestion) {
    if (currentUserAnswer && partnerAnswer) {
      questionSubtitle = "Both of your answers are ready.";
    } else if (currentUserAnswer) {
      questionSubtitle = "Your answer is saved.";
    } else if (partnerAnswer) {
      questionSubtitle = `${partnerName} has answered.`;
    } else {
      questionSubtitle = "Ready for both of you.";
    }
  }

  const memoryCount = memories?.length ?? 0;
  const memorySubtitle = isMemoriesPending
    ? "Loading your shared memories…"
    : isMemoriesError
      ? "Memories aren’t available right now."
      : memoryCount === 0
        ? "No memories saved yet."
        : `${memoryCount} ${memoryCount === 1 ? "memory" : "memories"} saved.`;

  const planCount = upcomingPlans?.length ?? 0;
  const planSubtitle = isPlansPending
    ? "Loading your upcoming plans…"
    : isPlansError
      ? "Plans aren’t available right now."
      : planCount === 0
        ? "No upcoming plans yet."
        : `${planCount} upcoming ${planCount === 1 ? "plan" : "plans"}.`;

  const readyItems: ReadyItem[] = [
    {
      title: "Today’s question",
      subtitle: questionSubtitle,
      icon: Pencil,
      loaded: !isQuestionPending && !isQuestionError,
    },
    {
      title: "Shared memories",
      subtitle: memorySubtitle,
      icon: ImageIcon,
      loaded: !isMemoriesPending && !isMemoriesError,
    },
    {
      title: "Plans",
      subtitle: planSubtitle,
      icon: CalendarDays,
      loaded: !isPlansPending && !isPlansError,
    },
  ];

  const trialDaysRemaining = getDaysRemaining(
    currentSpace.subscription?.trialEndsAt,
  );
  const paidDaysRemaining = getDaysRemaining(
    currentSpace.subscription?.activeUntil,
  );
  const hasPaidPlan = Boolean(
    currentSpace.subscription?.plan && paidDaysRemaining,
  );
  const description = hasPaidPlan
    ? `Your shared Space with ${partnerName} is live.\nYour plan is active for both of you.`
    : trialDaysRemaining
      ? `Your shared Space with ${partnerName} is live.\nYour ${trialDaysRemaining}-day full-access trial is active, no card required.`
      : `Your shared Space with ${partnerName} is live.\nEverything is ready for both of you.`;
  const actionLabel = hasPaidPlan
    ? "Continue to Youse"
    : trialDaysRemaining
      ? `See your ${trialDaysRemaining}-day trial`
      : "Continue to Youse";

  return (
    <AppScreen>
      <LinearGradient
        colors={[card, background, card]}
        className="absolute inset-0"
      />
      <ScrollView
        className="flex-1"
        style={{ flex: 1 }}
        contentContainerClassName="px-3 pb-3"
        showsVerticalScrollIndicator={false}
      >
        <BrandMark className="pt-2" logoClassName="w-40" showTagline />

        <View className="relative mt-6 flex-row items-center justify-center">
          <MemberAvatar
            imageUri={currentUserImage}
            label={currentUserName}
          />
          <MemberAvatar imageUri={partnerImage} label={partnerName} overlap />
          <View
            className="absolute bg-foreground"
            style={{
              borderRadius: 999,
              height: 44,
              left: "47%",
              top: "33%",
              width: 20,
            }}
          />
        </View>

        <PageIntro
          className="mt-6"
          description={description}
          title="You’re connected."
        />

        <View className="mt-6">
          {readyItems.map(({ title, subtitle, icon: Icon, loaded }, index) => (
            <View
              key={title}
              className={`flex-row items-center py-3 ${index ? "border-t border-muted" : ""}`}
            >
              <View className="h-12 w-12 items-center justify-center rounded-full bg-secondary">
                <ThemedIcon icon={Icon} size={22} strokeWidth={1.8} />
              </View>
              <View className="ml-5 flex-1">
                <Text className="text-[16px] font-semibold text-foreground">
                  {title}
                </Text>
                <Text className="mt-1 font-serif text-[14px] text-muted-foreground">
                  {subtitle}
                </Text>
              </View>
              {loaded ? (
                <View className="h-8 w-8 items-center justify-center rounded-full bg-primary">
                  <ThemedIcon
                    icon={Check}
                    tone="primaryForeground"
                    size={20}
                    strokeWidth={2.2}
                  />
                </View>
              ) : null}
            </View>
          ))}
        </View>
      </ScrollView>

      <View className="px-3 pt-2 pb-3">
        <PrimaryAction
          label={actionLabel}
          onPress={() =>
            router.push(
              hasPaidPlan || !trialDaysRemaining ? "/(tabs)/today" : "/trial",
            )
          }
          showArrow
        />
      </View>
    </AppScreen>
  );
}

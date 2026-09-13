import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  Check,
  ChevronRight,
  Pencil,
  Plane,
  Smile,
  UtensilsCrossed,
  UserRound,
  Eye,
} from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCSSVariable } from "uniwind";

import { PrimaryAction } from "@/components/app/primary-action";
import { ThemedIcon } from "@/components/app/themed-icon";
import { TrialBadge } from "@/components/app/trial-badge";
import { Text } from "@/components/ui/text";
import {
  currentSpaceQueryOptions,
  getPartnerFromSpace,
  getTrialDaysRemaining,
} from "@/lib/current-space";
import { currentUserQueryKey, getCurrentUser } from "@/lib/current-user";
import { currentDailyQuestionQueryOptions } from "@/lib/daily-question-api";
import { getImageUrl } from "@/lib/image-url";
import { cn } from "@/lib/utils";

const logo = require("../../../assets/images/logo-full-white.png");

const heroImage =
  "https://images.unsplash.com/photo-1726387871055-35c2c98357f9?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
const moods = ["😔", "😐", "🙂", "😌", "😄"];

const plans = [
  {
    key: "dinner",
    eyebrow: "TONIGHT",
    title: "Dinner at Veronica’s",
    sub: "8:30 PM",
    icon: UtensilsCrossed,
    colors: ["#1e3832", "#163028"] as const,
  },
  {
    key: "goa",
    eyebrow: "COUNTDOWN",
    title: "12",
    sub: "days until Goa",
    icon: Plane,
    colors: ["#1a3a52", "#1e3558"] as const,
    isCountdown: true,
  },
];

const pokeRows = [
  ["Thinking of you", "Proud of you"],
  ["Miss you", "Call me"],
];

export default function Today() {
  const insets = useSafeAreaInsets();
  const [background] = useCSSVariable(["--color-background"]) as [string];
  const [activeMood, setActiveMood] = useState(2);
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
    isError: isDailyQuestionError,
    isPending: isDailyQuestionPending,
  } = useQuery(currentDailyQuestionQueryOptions);

  if (isUserPending || isSpacePending || !currentUser || !currentSpace) {
    if (isUserError || isSpaceError) {
      return (
        <View className="flex-1 items-center justify-center bg-background px-6">
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
      );
    }

    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator colorClassName="accent-primary" size="large" />
      </View>
    );
  }

  const partner = getPartnerFromSpace(currentSpace, currentUser.id);
  const partnerName =
    partner?.name?.trim() || currentUser.partnerName?.trim() || "Your partner";
  const currentUserImage = getImageUrl(currentUser.profilePicture);
  const partnerImage = getImageUrl(partner?.profilePicture);
  const canSendPokes = partner?.pokesEnabled === true;
  const currentUserAnswer = dailyQuestion?.dailyQuestionAnswers.find(
    (answer) => answer.userId === currentUser.id,
  );
  const partnerAnswer = dailyQuestion?.dailyQuestionAnswers.find(
    (answer) => answer.userId === partner?.id,
  );
  const trialDaysRemaining = getTrialDaysRemaining(currentSpace);
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="pb-8"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View className="relative overflow-hidden" style={{ height: 460 }}>
          <Image
            source={{ uri: heroImage }}
            resizeMode="cover"
            className="absolute inset-0 h-full w-full"
          />
          <View className="absolute inset-0 bg-black/35" />
          <LinearGradient
            colors={["transparent", `${background}cc`, background]}
            locations={[0, 0.55, 1]}
            className="absolute inset-0"
          />

          <View
            className="absolute inset-x-0 top-0 flex-row items-start justify-between px-5"
            style={{ paddingTop: insets.top + 10 }}
          >
            <View className="items-start">
              <View className="flex-row items-center gap-1.5">
                <Image
                  source={logo}
                  resizeMode="contain"
                  className="h-6 w-16"
                />
              </View>
              <Text
                className="mt-0.5 text-[9px] font-medium text-muted-foreground"
                style={{ letterSpacing: 2 }}
              >
                A BRIGHTER US, DAILY
              </Text>
            </View>

            <View className="flex-row items-center gap-2">
              {trialDaysRemaining !== null ? (
                <TrialBadge days={trialDaysRemaining} />
              ) : null}
              <Pressable
                accessibilityLabel="Open profile"
                accessibilityRole="button"
                className="rounded-full active:opacity-70"
                hitSlop={8}
                onPress={() => router.push("/profile")}
              >
                <ProfileAvatar
                  imageUrl={currentUserImage}
                  className="h-9 w-9 border border-foreground/25"
                  iconSize={17}
                />
              </Pressable>
            </View>
          </View>

          <View className="absolute inset-x-0 bottom-0 px-6 pb-6">
            <Text
              className="text-[10px] font-medium text-muted-foreground"
              style={{ letterSpacing: 2 }}
            >
              {formattedDate}
            </Text>
            <Text className="mt-3 font-serif text-[28px] font-semibold leading-9 text-foreground">
              {dailyQuestion?.question ??
                (isDailyQuestionPending
                  ? "Getting today’s question…"
                  : "Today’s question isn’t ready yet.")}
            </Text>

            <View className="mt-3 flex-row items-end justify-between">
              <Text className="max-w-45 font-serif text-[15px] italic leading-5 text-muted-foreground">
                Small answers make a big difference.
              </Text>
              <Text className="text-right font-serif text-[13px] italic leading-4 text-muted-foreground">
                Same{"\n"}Team{"\n"}Always ♡
              </Text>
            </View>

            {currentUserAnswer ? (
              <PrimaryAction
                className="mt-5"
                icon={Eye}
                label="View answers"
                onPress={() =>
                  router.push({
                    pathname: "/answer-results",
                    params: { id: dailyQuestion?.id },
                  })
                }
              />
            ) : dailyQuestion ? (
              <PrimaryAction
                className="mt-5"
                icon={Pencil}
                label="Write my answer"
                onPress={() =>
                  router.push({
                    pathname: "/answer",
                    params: {
                      id: dailyQuestion.id,
                    },
                  })
                }
              />
            ) : (
              <Text className="mt-5 text-[14px] leading-5 text-muted-foreground">
                {isDailyQuestionError
                  ? "We’ll share a question here as soon as it’s ready."
                  : "One thoughtful prompt is on its way."}
              </Text>
            )}

            {dailyQuestion ? (
              <View className="mt-5 flex-row items-center">
                <View className="flex-1 flex-row items-center gap-2.5">
                  <View className="relative h-12 w-12">
                    <ProfileAvatar
                      imageUrl={currentUserImage}
                      className="h-12 w-12 border-2 border-foreground/10"
                      iconSize={21}
                    />
                    {currentUserAnswer ? (
                      <View className="absolute -bottom-0.5 -right-0.5 h-4 w-4 items-center justify-center rounded-full border-2 border-background bg-primary">
                        <Check color="#1d1115" size={9} strokeWidth={3} />
                      </View>
                    ) : null}
                  </View>
                  <View>
                    <Text className="text-[14px] font-semibold text-foreground">
                      You
                    </Text>
                    <Text className="text-[12px] text-muted-foreground">
                      {currentUserAnswer
                        ? "Answered today"
                        : "Hasn’t answered yet"}
                    </Text>
                  </View>
                </View>

                <View className="mx-1 h-9 w-px bg-foreground/10" />

                <View className="flex-1 flex-row items-center gap-2.5 pl-1">
                  <View className="relative h-12 w-12">
                    <ProfileAvatar
                      imageUrl={partnerImage}
                      className="h-12 w-12 border-2 border-foreground/10"
                      iconSize={21}
                    />
                    {dailyQuestion.revealed && partnerAnswer ? (
                      <View className="absolute -bottom-0.5 -right-0.5 h-4 w-4 items-center justify-center rounded-full border-2 border-background bg-primary">
                        <Check color="#1d1115" size={9} strokeWidth={3} />
                      </View>
                    ) : null}
                  </View>
                  <View>
                    <Text className="text-[14px] font-semibold text-foreground">
                      {partnerName}
                    </Text>
                    <Text className="text-[12px] text-muted-foreground">
                      {dailyQuestion.revealed && partnerAnswer
                        ? "Answered today"
                        : "Answer to reveal"}
                    </Text>
                  </View>
                </View>
              </View>
            ) : null}
          </View>
        </View>

        {/* Our mood today */}
        <View className="px-4 pt-5">
          <Text
            className="text-[10px] font-semibold text-muted-foreground"
            style={{ letterSpacing: 2 }}
          >
            OUR MOOD TODAY
          </Text>
          <Text className="mt-2.5 text-[13px] text-muted-foreground">
            How are you feeling?
          </Text>

          <View className="mt-2.5 flex-row gap-2">
            {moods.map((emoji, index) => (
              <Pressable
                key={emoji}
                onPress={() => setActiveMood(index)}
                className={`aspect-square flex-1 items-center justify-center rounded-xl border ${
                  index === activeMood
                    ? "border-primary/45 bg-primary/15"
                    : "border-border-subtle bg-card"
                }`}
              >
                <Text className="text-[20px]">{emoji}</Text>
              </Pressable>
            ))}
          </View>

          <View className="mt-4 flex-row items-center gap-3 rounded-2xl border border-border-subtle bg-card p-3.5">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/15">
              <ThemedIcon icon={Smile} size={20} strokeWidth={1.6} />
            </View>
            <View className="flex-1">
              <Text className="font-serif text-[18px] font-semibold leading-5 text-foreground">
                Calm &amp; Close
              </Text>
              <Text
                className="text-[10px] font-semibold text-muted-foreground"
                style={{ letterSpacing: 1 }}
              >
                A little brighter than yesterday
              </Text>
            </View>
            <Text className="max-w-[105px] text-right font-serif text-[12px] italic leading-4 text-muted-foreground">
              A more connected life is a kinder life.
            </Text>
          </View>
        </View>

        <View className="mx-4 my-5 h-px bg-border-subtle" />

        {/* Next up */}
        <View className="px-4">
          <Text
            className="text-[10px] font-semibold text-muted-foreground"
            style={{ letterSpacing: 2 }}
          >
            NEXT UP
          </Text>
          <View className="mt-2.5 flex-row gap-2.5">
            {plans.map((plan) => (
              <View
                key={plan.key}
                className="flex-1 overflow-hidden rounded-2xl border border-border-subtle bg-card"
              >
                <View className="p-3 pb-2">
                  <Text
                    className="text-[9px] font-semibold text-muted-foreground"
                    style={{ letterSpacing: 1.5 }}
                  >
                    {plan.eyebrow}
                  </Text>
                  <Text
                    className={
                      plan.isCountdown
                        ? "font-serif text-[32px] font-light leading-9 text-foreground"
                        : "mt-0.5 font-serif text-[16px] font-semibold leading-5 text-foreground"
                    }
                  >
                    {plan.title}
                  </Text>
                  <Text className="mt-0.5 text-[11px] text-muted-foreground">
                    {plan.sub}
                  </Text>
                </View>
                <LinearGradient
                  colors={plan.colors}
                  className="h-16 items-center justify-center"
                >
                  <ThemedIcon icon={plan.icon} size={26} strokeWidth={1.3} />
                </LinearGradient>
              </View>
            ))}
          </View>
        </View>

        <View className="mx-4 my-5 h-px bg-border-subtle" />

        {/* From partner */}
        <View className="px-4">
          <Text
            className="text-[10px] font-semibold text-muted-foreground"
            style={{ letterSpacing: 2 }}
          >
            FROM {partnerName.toLocaleUpperCase()}
          </Text>
          <Pressable className="mt-2.5 flex-row items-center gap-3 rounded-2xl border border-border-subtle bg-card p-3.5">
            <ProfileAvatar
              imageUrl={partnerImage}
              className="h-10 w-10"
              iconSize={18}
            />
            <View className="flex-1">
              <Text className="text-[14px] font-semibold text-foreground">
                Shared a photo
              </Text>
              <Text className="text-[12px] text-muted-foreground">
                22 minutes ago
              </Text>
            </View>
            <ThemedIcon
              icon={ChevronRight}
              tone="muted"
              size={18}
              strokeWidth={2}
            />
          </Pressable>
        </View>

        <View className="mx-4 my-5 h-px bg-border-subtle" />

        {/* Send a poke */}
        <View className="px-4">
          {canSendPokes ? (
            <>
              <View className="flex-row items-baseline justify-between">
                <Text
                  className="text-[10px] font-semibold text-muted-foreground"
                  style={{ letterSpacing: 2 }}
                >
                  SEND A POKE
                </Text>
                <Text className="text-[12px] text-muted-foreground">
                  to{" "}
                  <Text className="font-medium text-accent">{partnerName}</Text>
                </Text>
              </View>
              <Text className="mt-1.5 text-[12px] text-muted-foreground">
                A tiny signal, no conversation required.
              </Text>
              <View className="mt-2.5 gap-2">
                {pokeRows.map((row) => (
                  <View key={row.join("-")} className="flex-row gap-2">
                    {row.map((label) => (
                      <Pressable
                        key={label}
                        className="flex-1 items-center rounded-full border border-border-subtle bg-card px-3.5 py-3"
                      >
                        <Text className="text-[13px] text-foreground">
                          {label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                ))}
              </View>
            </>
          ) : (
            <View className="rounded-2xl border border-border-subtle bg-card px-4 py-4">
              <Text
                className="text-[10px] font-semibold text-muted-foreground"
                style={{ letterSpacing: 2 }}
              >
                POKES UNAVAILABLE
              </Text>
              <Text className="mt-1.5 text-[14px] leading-5 text-muted-foreground">
                {partnerName} has disabled pokes.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function ProfileAvatar({
  className,
  iconSize,
  imageUrl,
}: {
  className: string;
  iconSize: number;
  imageUrl: string | null;
}) {
  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        resizeMode="cover"
        className={cn("rounded-full", className)}
      />
    );
  }

  return (
    <View
      className={cn(
        "items-center justify-center rounded-full bg-muted",
        className,
      )}
    >
      <ThemedIcon icon={UserRound} tone="muted" size={iconSize} />
    </View>
  );
}

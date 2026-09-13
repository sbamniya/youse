import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { Image, ScrollView, View } from "react-native";

import { AppScreen } from "@/components/app/app-screen";
import { BackButton } from "@/components/app/back-button";
import { PrimaryAction } from "@/components/app/primary-action";
import { ThemedIcon } from "@/components/app/themed-icon";
import { Text } from "@/components/ui/text";
import {
  currentSpaceQueryOptions,
  getPartnerFromSpace,
} from "@/lib/current-space";
import { currentUserQueryKey, getCurrentUser } from "@/lib/current-user";
import { currentDailyQuestionQueryOptions, type DailyQuestionAnswer } from "@/lib/daily-question-api";
import { getImageUrl } from "@/lib/image-url";
import { UserRound } from "lucide-react-native";

const logoFull = require("../../assets/images/logo-full-white.png");

export default function AnswerResults() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { data: currentUser, isPending: isUserPending } = useQuery({
    queryKey: currentUserQueryKey,
    queryFn: getCurrentUser,
  });
  const { data: currentSpace, isPending: isSpacePending } = useQuery(currentSpaceQueryOptions);
  const {
    data: dailyQuestion,
    isError: isQuestionError,
    isPending: isQuestionPending,
    refetch,
  } = useQuery({
    ...currentDailyQuestionQueryOptions,
    enabled: Boolean(id),
  });

  if (isUserPending || isSpacePending || isQuestionPending) {
    return <AppScreen><View className="flex-1" /></AppScreen>;
  }

  if (!id || isQuestionError || !currentUser || !currentSpace || dailyQuestion?.id !== id) {
    return (
      <AppScreen>
        <View className="flex-row px-4 pt-2"><BackButton /></View>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center font-serif text-[18px] text-muted-foreground">
            This answer is no longer available.
          </Text>
          <PrimaryAction className="mt-7 w-full" label="Try again" onPress={() => void refetch()} />
        </View>
      </AppScreen>
    );
  }

  const partner = getPartnerFromSpace(currentSpace, currentUser.id);
  const ownAnswer = dailyQuestion.dailyQuestionAnswers.find(
    (answer) => answer.userId === currentUser.id,
  );
  const partnerAnswer = dailyQuestion.dailyQuestionAnswers.find(
    (answer) => answer.userId === partner?.id,
  );
  const bothAnswered = dailyQuestion.revealed && Boolean(ownAnswer && partnerAnswer);

  return (
    <AppScreen>
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center gap-3 pt-2">
          <BackButton />
          <Image source={logoFull} resizeMode="contain" style={{ height: 40, width: 80 }} />
        </View>

        <Text className="mt-4 text-[12px] font-semibold text-muted-foreground" style={{ letterSpacing: 3 }}>
          {bothAnswered ? "YOU BOTH ANSWERED" : "YOUR ANSWER"}
        </Text>
        <Text className="mt-3 text-[32px] font-bold leading-9 text-foreground">
          {bothAnswered ? "The little things we notice" : "Your answer is safe here."}
        </Text>
        <Text className="mt-3 font-serif text-[17px] leading-6 text-muted-foreground">
          {dailyQuestion.question}
        </Text>

        <View className="mt-7">
          {ownAnswer ? (
            <AnswerRow answer={ownAnswer} label="YOU" name="You" />
          ) : (
            <View className="rounded-2xl border border-border-subtle bg-card p-5">
              <Text className="text-[15px] text-muted-foreground">Your answer has not been saved yet.</Text>
            </View>
          )}
          {bothAnswered && partnerAnswer ? (
            <AnswerRow
              answer={partnerAnswer}
              label="ANSWERED"
              name={partner?.name?.trim() || "Your partner"}
              separated
            />
          ) : (
            <View className="mt-5 rounded-2xl border border-border-subtle bg-card p-5">
              <Text className="text-[11px] font-semibold text-muted-foreground" style={{ letterSpacing: 1.5 }}>
                WAITING FOR {partner?.name?.trim()?.toLocaleUpperCase() || "YOUR PARTNER"}
              </Text>
              <Text className="mt-2 font-serif text-[18px] leading-6 text-foreground">
                Their answer will appear here once they’ve answered today’s question.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View className="px-4 pb-3 pt-2">
        <PrimaryAction label="Back to today" onPress={() => router.replace("/(tabs)/today")} />
      </View>
    </AppScreen>
  );
}

function AnswerRow({
  answer,
  label,
  name,
  separated = false,
}: {
  answer: DailyQuestionAnswer;
  label: string;
  name: string;
  separated?: boolean;
}) {
  const imageUrl = getImageUrl(answer.imageUrl ?? answer.user.profilePicture);

  return (
    <View className={separated ? "border-t border-border-subtle pt-6" : ""}>
      <View className="flex-row gap-4 py-2">
        {imageUrl ? (
          <Image className="h-16 w-16 rounded-full border-2 border-primary/50" resizeMode="cover" source={{ uri: imageUrl }} />
        ) : (
          <View className="h-16 w-16 items-center justify-center rounded-full border-2 border-primary/50 bg-card">
            <ThemedIcon icon={UserRound} tone="muted" size={24} strokeWidth={1.5} />
          </View>
        )}
        <View className="flex-1">
          <Text className="text-[16px] font-bold text-foreground">{name}</Text>
          <Text className="mt-0.5 text-[10px] font-semibold text-muted-foreground" style={{ letterSpacing: 1.5 }}>
            {label}
          </Text>
          <Text className="mt-2 font-serif text-[22px] italic leading-7 text-foreground">
            {answer.answer}
          </Text>
        </View>
      </View>
    </View>
  );
}

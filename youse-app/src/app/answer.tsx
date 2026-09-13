import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ImagePickerAsset } from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { Camera } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Image, Pressable, View } from "react-native";

import { AppScreen } from "@/components/app/app-screen";
import { BackButton } from "@/components/app/back-button";
import { ImageSourcePicker } from "@/components/app/image-source-picker";
import { PageIntro } from "@/components/app/page-intro";
import { PrimaryAction } from "@/components/app/primary-action";
import { ThemedIcon } from "@/components/app/themed-icon";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import {
  currentDailyQuestionQueryKey,
  currentDailyQuestionQueryOptions,
  saveDailyAnswer,
} from "@/lib/daily-question-api";
import { uploadImage } from "@/lib/image-upload";

const logoFull = require("../../assets/images/logo-full-white.png");

const MAX_LENGTH = 500;
export default function Answer() {
  const { id } = useLocalSearchParams<{
    id?: string;
  }>();
  const queryClient = useQueryClient();
  const [answer, setAnswer] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoAsset, setPhotoAsset] = useState<ImagePickerAsset | null>(null);
  const [error, setError] = useState("");
  const {
    data: dailyQuestion,
    isError: isQuestionError,
    isPending: isQuestionPending,
    refetch: refetchQuestion,
  } = useQuery({
    ...currentDailyQuestionQueryOptions,
    enabled: Boolean(id),
  });
  const isRequestedQuestion = dailyQuestion?.id === id;
  const saveAnswerMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error("Daily question is unavailable");
      const imagePath = photoAsset ? (await uploadImage(photoAsset)).path : null;
      return saveDailyAnswer(id, { answer: answer.trim(), imagePath });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: currentDailyQuestionQueryKey,
      });
      router.replace({ pathname: "/answer-results", params: { id } });
    },
    onError: () => {
      setError("We couldn't save your answer. Check your connection and try again.");
    },
  });

  if (isQuestionPending) {
    return (
      <AppScreen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator colorClassName="accent-primary" size="large" />
        </View>
      </AppScreen>
    );
  }

  if (!id || isQuestionError || !isRequestedQuestion || !dailyQuestion) {
    return (
      <AppScreen>
        <View className="flex-row px-4 pt-2"><BackButton /></View>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center font-serif text-[18px] text-muted-foreground">
            This daily question is no longer available.
          </Text>
          <PrimaryAction className="mt-7 w-full" label="Try again" onPress={() => void refetchQuestion()} />
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <View className="flex-1 px-4">
        <View className="flex-row items-center gap-3 pt-2">
          <BackButton />
          <Image
            source={logoFull}
            resizeMode="contain"
            style={{ height: 50, width: 120 }}
          />
        </View>

        <PageIntro
          className="mt-4"
          description="Your answer stays private until you both answer."
          displayTitle
          eyebrow="TODAY’S QUESTION"
          title={dailyQuestion.question}
        />

        <View className="mt-8 flex-1 border-l-2 border-primary/70 pl-4">
          <Input
            autoFocus
            className="flex-1 font-serif text-[20px] text-foreground"
            maxLength={MAX_LENGTH}
            multiline
            onChangeText={(value) => {
              setAnswer(value);
              setError("");
            }}
            placeholder="Write what comes to mind…"
            style={{ textAlignVertical: "top" }}
            value={answer}
            variant="plain"
          />
        </View>

        <Text className="text-right text-[12px] text-muted-foreground">
          {answer.length} / {MAX_LENGTH}
        </Text>

        <ImageSourcePicker
          aspect={[4, 3]}
          onImageSelected={(uri, asset) => {
            setPhotoUri(uri);
            setPhotoAsset(asset);
            setError("");
          }}
        >
          {({ onPress }) => (
            <Pressable className="mt-4 flex-row items-center gap-3" onPress={onPress}>
              {photoUri ? (
                <Image className="h-11 w-11 rounded-full" resizeMode="cover" source={{ uri: photoUri }} />
              ) : (
                <View className="h-11 w-11 items-center justify-center rounded-full bg-primary/20">
                  <ThemedIcon icon={Camera} size={18} strokeWidth={1.8} />
                </View>
              )}
              <Text className="text-[15px] text-foreground">
                {photoUri ? "Change photo" : "Add a photo"} <Text className="text-muted-foreground">(optional)</Text>
              </Text>
            </Pressable>
          )}
        </ImageSourcePicker>
        {error ? (
          <Text className="mt-4 font-serif text-[15px] text-destructive">
            {error}
          </Text>
        ) : null}
      </View>

      <View className="px-4 pb-3 pt-2">
        <PrimaryAction
          disabled={!id || !answer.trim() || saveAnswerMutation.isPending}
          label={saveAnswerMutation.isPending ? "Saving..." : "Save my answer"}
          onPress={() => saveAnswerMutation.mutate()}
        />
      </View>
    </AppScreen>
  );
}

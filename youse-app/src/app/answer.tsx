import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { Camera } from "lucide-react-native";
import { useState } from "react";
import { Image, Pressable, View } from "react-native";

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
  saveDailyAnswer,
} from "@/lib/daily-question-api";

const logoFull = require("../../assets/images/logo-full-white.png");

const MAX_LENGTH = 500;
const DEFAULT_QUESTION = "What’s something you wish we did more often?";
const DEFAULT_PARTNER = "Arjun";

export default function Answer() {
  const { id, question, partner, answer: existingAnswer } = useLocalSearchParams<{
    id?: string;
    question?: string;
    partner?: string;
    answer?: string;
  }>();
  const queryClient = useQueryClient();
  const [answer, setAnswer] = useState(existingAnswer ?? "");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [error, setError] = useState("");

  const resolvedQuestion = question ?? DEFAULT_QUESTION;
  const resolvedPartner = partner ?? DEFAULT_PARTNER;
  const saveAnswerMutation = useMutation({
    mutationFn: () => {
      if (!id) throw new Error("Daily question is unavailable");
      return saveDailyAnswer(id, answer.trim());
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: currentDailyQuestionQueryKey,
      });
      router.replace("/(tabs)/today");
    },
    onError: () => {
      setError("We couldn't save your answer. Check your connection and try again.");
    },
  });

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
          description={`${resolvedPartner} can’t see this until you both answer.`}
          displayTitle
          eyebrow="TODAY’S QUESTION"
          title={resolvedQuestion}
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

        <ImageSourcePicker aspect={[4, 3]} onImageSelected={setPhotoUri}>
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

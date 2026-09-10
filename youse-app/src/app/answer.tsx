import { router, useLocalSearchParams } from "expo-router";
import { Camera, ChevronLeft } from "lucide-react-native";
import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { useCSSVariable } from "uniwind";

import { AppScreen } from "@/components/app/app-screen";
import { PageIntro } from "@/components/app/page-intro";
import { PrimaryAction } from "@/components/app/primary-action";
import { ThemedIcon } from "@/components/app/themed-icon";
import { Text } from "@/components/ui/text";

const MAX_LENGTH = 500;
const DEFAULT_QUESTION = "What’s something you wish we did more often?";
const DEFAULT_PARTNER = "Arjun";

export default function Answer() {
  const { question, partner } = useLocalSearchParams<{
    question?: string;
    partner?: string;
  }>();
  const placeholder = useCSSVariable("--color-placeholder") as string;
  const [answer, setAnswer] = useState("");

  const resolvedQuestion = question ?? DEFAULT_QUESTION;
  const resolvedPartner = partner ?? DEFAULT_PARTNER;

  return (
    <AppScreen>
      <View className="flex-1 px-4">
        <Pressable
          accessibilityLabel="Go back"
          className="h-10 w-10 items-center justify-center"
          onPress={() => router.back()}
        >
          <ThemedIcon icon={ChevronLeft} tone="foreground" size={26} strokeWidth={2} />
        </Pressable>

        <PageIntro
          className="mt-4"
          description={`${resolvedPartner} can’t see this until you both answer.`}
          displayTitle
          eyebrow="TODAY’S QUESTION"
          title={resolvedQuestion}
        />

        <View className="mt-8 flex-1 border-l-2 border-primary/70 pl-4">
          <TextInput
            autoFocus
            className="flex-1 font-serif text-[20px] text-foreground"
            maxLength={MAX_LENGTH}
            multiline
            onChangeText={setAnswer}
            placeholder="Write what comes to mind…"
            placeholderTextColor={placeholder}
            style={{ textAlignVertical: "top" }}
            value={answer}
          />
        </View>

        <Text className="text-right text-[12px] text-muted-foreground">
          {answer.length} / {MAX_LENGTH}
        </Text>

        <Pressable className="mt-4 flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-full bg-primary/20">
            <ThemedIcon icon={Camera} size={18} strokeWidth={1.8} />
          </View>
          <Text className="text-[15px] text-foreground">
            Add a photo <Text className="text-muted-foreground">(optional)</Text>
          </Text>
        </Pressable>
      </View>

      <View className="px-4 pb-3 pt-2">
        <PrimaryAction label="Save my answer" onPress={() => router.back()} />
      </View>
    </AppScreen>
  );
}

import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { Image, Pressable, ScrollView, View } from "react-native";

import { AppScreen } from "@/components/app/app-screen";
import { PrimaryAction } from "@/components/app/primary-action";
import { ThemedIcon } from "@/components/app/themed-icon";
import { Text } from "@/components/ui/text";

const logoFull = require("../../assets/images/logo-full.png");

const DEFAULT_QUESTION = "What’s something you wish we did more often?";
const DEFAULT_MY_ANSWER = "Small answers make a big difference.";
const DEFAULT_PARTNER_ANSWER = "How you make ordinary mornings feel special.";
const SUMMARY_TITLE = "The little things we notice";

const meeraImage =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=700&auto=format&fit=crop";
const arjunImage =
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=700&auto=format&fit=crop";

export default function AnswerResults() {
  const { question, myAnswer, partnerAnswer } = useLocalSearchParams<{
    question?: string;
    myAnswer?: string;
    partnerAnswer?: string;
  }>();

  const resolvedQuestion = question ?? DEFAULT_QUESTION;
  const resolvedMyAnswer = myAnswer || DEFAULT_MY_ANSWER;
  const resolvedPartnerAnswer = partnerAnswer ?? DEFAULT_PARTNER_ANSWER;

  const answers = [
    { name: "Meera", image: meeraImage, text: resolvedMyAnswer },
    { name: "Arjun", image: arjunImage, text: resolvedPartnerAnswer },
  ];

  return (
    <AppScreen>
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center gap-3 pt-2">
          <Pressable
            accessibilityLabel="Go back"
            hitSlop={12}
            onPress={() => router.back()}
          >
            <ThemedIcon icon={ChevronLeft} tone="foreground" size={26} strokeWidth={2} />
          </Pressable>
          <Image
            source={logoFull}
            resizeMode="contain"
            style={{ height: 22, width: 66 }}
          />
        </View>

        <Text
          className="mt-4 text-[12px] font-semibold text-muted-foreground"
          style={{ letterSpacing: 3 }}
        >
          YOU BOTH ANSWERED
        </Text>
        <Text className="mt-3 text-[32px] font-bold leading-9 text-foreground">
          {SUMMARY_TITLE}
        </Text>
        <Text className="mt-3 font-serif text-[17px] leading-6 text-muted-foreground">
          {resolvedQuestion}
        </Text>

        <View className="mt-7">
          {answers.map((entry, index) => (
            <View
              key={entry.name}
              className={`flex-row gap-4 py-6 ${index ? "border-t border-border-subtle" : ""}`}
            >
              <Image
                source={{ uri: entry.image }}
                resizeMode="cover"
                className="h-16 w-16 rounded-full border-2 border-primary/50"
              />
              <View className="flex-1">
                <Text className="text-[16px] font-bold text-foreground">
                  {entry.name}
                </Text>
                <Text
                  className="mt-0.5 text-[10px] font-semibold text-muted-foreground"
                  style={{ letterSpacing: 1.5 }}
                >
                  ANSWERED
                </Text>
                <Text className="mt-2 font-serif text-[22px] italic leading-7 text-foreground">
                  {entry.text}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View className="px-4 pb-3 pt-2">
        <PrimaryAction
          label="Send a poke"
          onPress={() => router.replace("/(tabs)/today")}
        />
      </View>
    </AppScreen>
  );
}

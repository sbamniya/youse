import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ScrollView, View } from "react-native";
import { useCSSVariable } from "uniwind";

import { AppScreen } from "@/components/app/app-screen";
import { BrandMark } from "@/components/app/brand-mark";
import { PrimaryAction } from "@/components/app/primary-action";
import { Text } from "@/components/ui/text";

const trialDetails = [
  {
    number: "1",
    title: "Everything is unlocked",
    description: "Explore all features, with no\nlimitations, together.",
  },
  {
    number: "2",
    title: "Your clock has\nalready started",
    description: "You’re both connected, so your\n14 days are counting down now.",
  },
  {
    number: "3",
    title: "No card required",
    description: "Start your trial without\nadding a payment method.",
  },
  {
    number: "14",
    title: "After day 14 —\nhistory remains viewable",
    description: "Even when your trial ends,\nyour shared history is always\navailable to both of you.",
  },
];

export default function Trial() {
  const [card, background] = useCSSVariable([
    "--color-card",
    "--color-background",
  ]) as [string, string];

  return (
    <AppScreen>
      <LinearGradient
        colors={[card, background, card]}
        className="absolute inset-0"
      />
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-3 pb-3"
        showsVerticalScrollIndicator={false}
      >
        <BrandMark className="pt-2" showName showTagline />

        <View className="mt-6">
          <Text className="text-[12px] text-muted-foreground" style={{ letterSpacing: 5 }}>
            YOUR TRIAL STARTS NOW
          </Text>
          <Text className="mt-4 text-[28px] font-bold leading-10.75 text-foreground">
            14 days of the full
            {"\n"}Youse experience.
          </Text>
          <Text className="mt-3 font-serif text-[18px] leading-7 text-muted-foreground">
            No card. No locked features.
            {"\n"}Both of you can use everything.
          </Text>
          <View className="mt-2 self-start rounded-full bg-primary px-4 py-1">
            <Text className="text-[16px] text-primary-foreground">
              One trial · both partners
            </Text>
          </View>
        </View>

        <View className="mt-4">
          {trialDetails.map((detail, index) => (
            <View
              key={detail.number}
              className={`flex-row py-4 ${index ? "border-t border-border-subtle" : ""}`}
            >
              <View className="h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted">
                <Text className="text-[16px] font-semibold text-foreground">{detail.number}</Text>
              </View>
              <View className="ml-5 flex-1 pt-1">
                <Text className="text-[16px] font-semibold text-foreground">
                  {detail.title}
                </Text>
                <Text className="mt-1 font-serif text-[14px] text-muted-foreground">
                  {detail.description}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View className="px-3 pb-3 pt-2">
        <PrimaryAction
          label="Start using Youse"
          onPress={() => router.replace("/(tabs)/today")}
          showArrow
        />
      </View>
    </AppScreen>
  );
}
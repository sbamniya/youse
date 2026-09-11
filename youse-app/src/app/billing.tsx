import { router } from "expo-router";
import {
  CalendarDays,
  CreditCard,
  Heart,
  Image as ImageIcon,
  UsersRound,
} from "lucide-react-native";
import { useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PageIntro } from "@/components/app/page-intro";
import { PrimaryAction } from "@/components/app/primary-action";
import { SelectionOption } from "@/components/app/selection-option";
import { ThemedIcon } from "@/components/app/themed-icon";
import { Text } from "@/components/ui/text";

type Plan = "yearly" | "monthly";

const benefits = [
  {
    description: "Photos, notes and moments, in one place.",
    icon: ImageIcon,
    title: "All your memories",
  },
  {
    description: "Keep track of what’s next.",
    icon: CalendarDays,
    title: "Plan together",
  },
  {
    description: "Gentle insights for a closer you.",
    icon: Heart,
    title: "Understand each other",
  },
  {
    description: "Private, safe and ad-free.",
    icon: UsersRound,
    title: "A space that’s just yours",
  },
];

export default function Billing() {
  const insets = useSafeAreaInsets();
  const [plan, setPlan] = useState<Plan>("yearly");
  const isYearly = plan === "yearly";

  const continueWithPlan = () => {
    const label = isYearly ? "₹999/year" : "₹149/month";

    Alert.alert(
      "Trial continued",
      `${label} will start after your 14-day trial.`,
      [{ text: "OK", onPress: () => router.replace("/(tabs)/today") }],
    );
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-11"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingTop: Math.max(insets.top + 18, 42) }}>
          <PageIntro
            className="mt-2"
            eyebrow="YOUR 14-DAY TRIAL"
            description={`Keep your space going.\nYour shared history stays\nviewable, always.`}
            title="Welcome back"
            backArrow={{
              onPress: () =>
                router.canGoBack()
                  ? router.back()
                  : router.replace("/(tabs)/today"),
            }}
          />

          <View className="mt-2">
            {benefits.map(({ description, icon, title }, index) => (
              <View
                key={title}
                className={`flex-row py-4 ${index ? "border-t border-border-subtle" : ""}`}
              >
                <View className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Text className="text-[16px] font-semibold text-foreground">
                    <ThemedIcon icon={icon} size={18} strokeWidth={1.5} />
                  </Text>
                </View>
                <View className="ml-5 flex-1 pt-1">
                  <Text className="text-[16px] font-semibold text-foreground">
                    {title}
                  </Text>
                  <Text className="mt-1 font-serif text-[14px] text-muted-foreground">
                    {description}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View className="mt-4 gap-3">
            <SelectionOption
              badge="Save 44%"
              caption="JUST ₹83/MONTH"
              isSelected={isYearly}
              onPress={() => setPlan("yearly")}
              title="₹999/year"
            />
            <SelectionOption
              caption="BILLED MONTHLY"
              isSelected={!isYearly}
              onPress={() => setPlan("monthly")}
              title="₹149/month"
            />
          </View>

          <Text className="mt-4 text-center font-serif text-[14px] text-primary">
            One subscription covers both partners.
          </Text>

          <PrimaryAction
            accessibilityLabel={`Continue with ${isYearly ? "yearly" : "monthly"} plan`}
            label={`Continue with ${isYearly ? "yearly" : "monthly"}`}
            onPress={continueWithPlan}
            icon={CreditCard}
            showArrow
          />

          <Pressable
            accessibilityRole="button"
            className="mt-4 items-center self-center px-2 py-1 active:opacity-65"
            onPress={() => router.replace("/(tabs)/today")}
          >
            <Text className="font-serif text-[16px] text-primary">Not now</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

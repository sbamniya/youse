import { router } from "expo-router";
import {
  CalendarDays,
  CreditCard,
  Heart,
  Image as ImageIcon,
  UsersRound
} from "lucide-react-native";
import { useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PageIntro } from "@/components/app/page-intro";
import { PrimaryAction } from "@/components/app/primary-action";
import { ThemedIcon } from "@/components/app/themed-icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

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
            className="mt-4"
            eyebrow="YOUR 14-DAY TRIAL"
            description={`Keep your space going.\nYour shared history stays\nviewable, always.`}
            title="Welcome back"
            backArrow={{
              onPress: () => router.replace("/connected"),
            }}
          />

          <View className="mt-4">
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
            <PlanOption
              badge="Save 44%"
              caption="JUST ₹83/MONTH"
              isSelected={isYearly}
              onPress={() => setPlan("yearly")}
              price="₹999/year"
            />
            <PlanOption
              caption="BILLED MONTHLY"
              isSelected={!isYearly}
              onPress={() => setPlan("monthly")}
              price="₹149/month"
            />
          </View>

          <Text className="mt-4 text-center font-serif text-[14px] text-primary">
            One subscription covers both partners.
          </Text>

          <PrimaryAction
            accessibilityLabel={`Continue with ${isYearly ? "yearly" : "monthly"} plan`}
            className="mt-4"
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

type PlanOptionProps = {
  badge?: string;
  caption: string;
  isSelected: boolean;
  onPress: () => void;
  price: string;
};

function PlanOption({
  badge,
  caption,
  isSelected,
  onPress,
  price,
}: PlanOptionProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected }}
      className={cn(
        "min-h-20 flex-row items-center rounded-[18px] border px-4 active:opacity-80",
        isSelected ? "border-primary bg-secondary/20" : "border-border-subtle",
      )}
      onPress={onPress}
    >
      <View
        className={cn(
          "h-6 w-6 items-center justify-center rounded-full border-2",
          isSelected ? "border-primary" : "border-primary/80",
        )}
      >
        {isSelected ? (
          <View className="h-2 w-2 rounded-full bg-primary" />
        ) : null}
      </View>
      <View className="ml-5 flex-1">
        <Text className="text-[20px] font-bold leading-7 text-foreground">
          {price}
        </Text>
        <Text className="mt-0.5 text-[8px] font-medium tracking-[3px] text-primary">
          {caption}
        </Text>
      </View>
      {badge ? (
        <View className="rounded-full bg-primary px-2 py-1.5">
          <Text className="text-[12px] font-semibold text-primary-foreground">
            {badge}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

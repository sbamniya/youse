import { router } from "expo-router";
import {
    CalendarDays,
    ChevronLeft,
    Heart,
    Image as ImageIcon,
    UsersRound,
} from "lucide-react-native";
import { useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

    Alert.alert("Trial continued", `${label} will start after your 14-day trial.`, [
      { text: "OK", onPress: () => router.replace("/(tabs)/today") },
    ]);
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-11"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingTop: Math.max(insets.top + 18, 42) }}>
          <Pressable
            accessibilityLabel="Back to trial details"
            className="h-11 w-11 items-center justify-center active:opacity-65"
            hitSlop={12}
            onPress={() => router.replace("/connected")}
          >
            <ThemedIcon icon={ChevronLeft} size={36} strokeWidth={1.7} />
          </Pressable>

          <View className="mt-8 px-3">
            <Text className="text-[12px] font-semibold tracking-[4px] text-primary">
              YOUR 14-DAY TRIAL
            </Text>
            <Text className="mt-4 text-[38px] font-bold leading-[42px] tracking-[-0.8px] text-foreground">
              Keep your{"\n"}space going.
            </Text>
            <Text className="mt-4 font-serif text-[22px] leading-[29px] text-primary">
              Your shared history stays{"\n"}viewable, always.
            </Text>
          </View>

          <View className="mt-9 gap-5 px-3">
            {benefits.map(({ description, icon, title }) => (
              <View key={title} className="flex-row items-center">
                <View className="h-16 w-16 shrink-0 items-center justify-center rounded-full bg-secondary">
                  <ThemedIcon icon={icon} size={28} strokeWidth={1.7} />
                </View>
                <View className="ml-5 flex-1">
                  <Text className="text-[18px] font-bold leading-6 text-foreground">{title}</Text>
                  <Text className="mt-0.5 font-serif text-[15px] leading-5 text-primary">
                    {description}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View className="mt-9 gap-3">
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

          <Text className="mt-6 text-center font-serif text-[16px] text-primary">
            One subscription covers both partners.
          </Text>

          <PrimaryAction
            accessibilityLabel={`Continue with ${isYearly ? "yearly" : "monthly"} plan`}
            className="mt-8"
            label={`Continue with ${isYearly ? "yearly" : "monthly"}`}
            onPress={continueWithPlan}
          />

          <Pressable
            accessibilityRole="button"
            className="mt-6 items-center self-center px-5 py-2 active:opacity-65"
            onPress={() => router.replace("/(tabs)/today")}
          >
            <Text className="font-serif text-[20px] text-primary">Not now</Text>
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

function PlanOption({ badge, caption, isSelected, onPress, price }: PlanOptionProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected }}
      className={cn(
        "min-h-28 flex-row items-center rounded-[18px] border px-4 active:opacity-80",
        isSelected ? "border-primary bg-secondary/20" : "border-border-subtle",
      )}
      onPress={onPress}
    >
      <View
        className={cn(
          "h-8 w-8 items-center justify-center rounded-full border-2",
          isSelected ? "border-primary" : "border-primary/80",
        )}
      >
        {isSelected ? <View className="h-4 w-4 rounded-full bg-primary" /> : null}
      </View>
      <View className="ml-5 flex-1">
        <Text className="text-[23px] font-bold leading-7 text-foreground">{price}</Text>
        <Text className="mt-0.5 text-[11px] font-medium tracking-[3px] text-primary">{caption}</Text>
      </View>
      {badge ? (
        <View className="rounded-full bg-primary px-3 py-2.5">
          <Text className="text-[14px] font-semibold text-primary-foreground">{badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

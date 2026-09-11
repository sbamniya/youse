import { router } from "expo-router";
import { Pressable } from "react-native";

import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

type TrialBadgeProps = {
  className?: string;
  days: number;
};

function TrialBadge({ className, days }: TrialBadgeProps) {
  return (
    <Pressable
      accessibilityLabel={`${days} days left in trial. View billing.`}
      accessibilityRole="button"
      className={cn(
        "rounded-full border border-primary/35 bg-background/60 px-2.5 py-1.5 active:opacity-70",
        className,
      )}
      onPress={() => router.push("/billing")}
    >
      <Text className="text-[11px] font-medium text-accent">
        {days} days left
      </Text>
    </Pressable>
  );
}

export { TrialBadge };

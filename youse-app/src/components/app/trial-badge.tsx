import { router } from "expo-router";
import { Pressable, View } from "react-native";

import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

type TrialBadgeProps = {
  className?: string;
  days: number;
  interactive?: boolean;
};

function TrialBadge({ className, days, interactive = true }: TrialBadgeProps) {
  const content = (
    <Text className="text-[11px] font-medium text-accent">
      {days} days left
    </Text>
  );

  const containerClassName = cn(
    "rounded-full border border-primary/35 bg-background/60 px-2.5 py-1.5",
    interactive && "active:opacity-70",
    className,
  );

  if (!interactive) {
    return <View className={containerClassName}>{content}</View>;
  }

  return (
    <Pressable
      accessibilityLabel={`${days} days left in trial. View billing.`}
      accessibilityRole="button"
      className={containerClassName}
      onPress={() => router.push("/billing")}
    >
      {content}
    </Pressable>
  );
}

export { TrialBadge };

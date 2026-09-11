import { type LucideIcon } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { ThemedIcon } from "@/components/app/themed-icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

type SelectionOptionProps = {
  badge?: string;
  caption?: string;
  compact?: boolean;
  description?: string;
  disabled?: boolean;
  icon?: LucideIcon;
  isSelected: boolean;
  onPress: () => void;
  title: string;
};

function SelectionOption({
  badge,
  caption,
  compact = false,
  description,
  disabled = false,
  icon,
  isSelected,
  onPress,
  title,
}: SelectionOptionProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected, disabled }}
      className={cn(
        "flex-row items-center border active:opacity-80",
        compact
          ? "min-h-0 rounded-2xl px-3"
          : "min-h-20 rounded-[18px] px-4",
        isSelected ? "border-primary bg-secondary/20" : "border-border-subtle",
        disabled && "opacity-50",
      )}
      disabled={disabled}
      onPress={onPress}
    >
      <View
        className={cn(
          "shrink-0 items-center justify-center rounded-full border-2",
          compact ? "h-5 w-5" : "h-6 w-6",
          isSelected ? "border-primary" : "border-primary/80",
        )}
      >
        {isSelected ? <View className={cn("rounded-full bg-primary", compact ? "h-1.5 w-1.5" : "h-2 w-2")} /> : null}
      </View>
      {icon ? (
        <View className={cn("shrink-0 items-center justify-center rounded-full bg-muted", compact ? "ml-3 h-9 w-9" : "ml-5 h-10 w-10")}>
          <ThemedIcon icon={icon} size={compact ? 18 : 20} strokeWidth={1.6} />
        </View>
      ) : null}
      <View className={cn("flex-1", compact ? "ml-3 py-2" : "ml-5 py-3")}>
        <Text className={cn("font-bold text-foreground", compact ? "text-[16px] leading-5" : "text-[20px] leading-7")}>
          {title}
        </Text>
        {caption ? (
          <Text className="mt-0.5 text-[8px] font-medium tracking-[3px] text-primary">
            {caption}
          </Text>
        ) : null}
        {description ? (
          <Text className={cn("mt-1 font-serif text-muted-foreground", compact ? "text-[12px] leading-4" : "text-[14px] leading-5")}>
            {description}
          </Text>
        ) : null}
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

export { SelectionOption };
export type { SelectionOptionProps };

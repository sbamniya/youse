import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { Pressable } from "react-native";

import { ThemedIcon } from "@/components/app/themed-icon";
import { cn } from "@/lib/utils";

type BackButtonProps = {
  className?: string;
  onPress?: () => void;
};

function BackButton({ className, onPress = () => router.back() }: BackButtonProps) {
  return (
    <Pressable
      accessibilityLabel="Go back"
      accessibilityRole="button"
      className={cn(
        "h-11 w-11 items-center justify-center rounded-full border border-primary/35 bg-background/60 active:opacity-70",
        className,
      )}
      hitSlop={8}
      onPress={onPress}
    >
      <ThemedIcon icon={ChevronLeft} size={22} strokeWidth={1.8} />
    </Pressable>
  );
}

export { BackButton };

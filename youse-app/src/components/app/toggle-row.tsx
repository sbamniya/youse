import { Pressable, View } from "react-native";

import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

type ToggleRowProps = {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

function ToggleRow({ label, value, onValueChange }: ToggleRowProps) {
  return (
    <Pressable
      className="mt-7 flex-row items-center justify-between"
      onPress={() => onValueChange(!value)}
    >
      <Text className="text-[17px] text-foreground">{label}</Text>
      <View
        className={cn(
          "h-8 w-14 justify-center rounded-full p-1",
          value ? "items-end bg-primary" : "items-start bg-muted",
        )}
      >
        <View className="h-6 w-6 rounded-full bg-foreground" />
      </View>
    </Pressable>
  );
}

export { ToggleRow };

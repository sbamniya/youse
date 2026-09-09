import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { BrandMark } from "@/components/app/brand-mark";
import { ThemedIcon } from "@/components/app/themed-icon";

type AppHeaderProps = {
  onBack?: () => void;
};

function AppHeader({ onBack = () => router.back() }: AppHeaderProps) {
  return (
    <View className="flex-row items-center pt-2">
      <Pressable
        accessibilityLabel="Go back"
        className="h-11 w-11 items-center justify-center rounded-full border border-muted"
        onPress={onBack}
      >
        <ThemedIcon icon={ArrowLeft} size={22} />
      </Pressable>
      <BrandMark className="ml-3" />
    </View>
  );
}

export { AppHeader };

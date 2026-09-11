import { router } from "expo-router";
import { View } from "react-native";

import { BackButton } from "@/components/app/back-button";
import { BrandMark } from "@/components/app/brand-mark";

type AppHeaderProps = {
  onBack?: () => void;
};

function AppHeader({ onBack = () => router.back() }: AppHeaderProps) {
  return (
    <View className="flex-row items-center pt-2">
      <BackButton onPress={onBack} />
      <BrandMark className="ml-3" />
    </View>
  );
}

export { AppHeader };

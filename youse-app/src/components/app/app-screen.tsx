import { StatusBar } from "expo-status-bar";
import type { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { cn } from "@/lib/utils";

type AppScreenProps = {
  children: ReactNode;
  className?: string;
};

type AppScrollScreenProps = AppScreenProps & {
  contentClassName?: string;
  keyboardShouldPersistTaps?: "always" | "handled" | "never";
};

function AppScreen({ children, className }: AppScreenProps) {
  return (
    <View className={cn("flex-1 bg-background", className)}>
      <StatusBar style="light" />
      <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
        {children}
      </SafeAreaView>
    </View>
  );
}

function AppScrollScreen({
  children,
  className,
  contentClassName,
  keyboardShouldPersistTaps,
}: AppScrollScreenProps) {
  return (
    <AppScreen className={className}>
      <ScrollView
        contentContainerClassName={cn("px-3 pb-3", contentClassName)}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </AppScreen>
  );
}

export { AppScreen, AppScrollScreen };

import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { MemoryProvider } from "@/lib/memory-store";

import "../global.css";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <MemoryProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </MemoryProvider>
    </SafeAreaProvider>
  );
}

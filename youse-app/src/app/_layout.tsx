import { DarkTheme, Stack, ThemeProvider } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { MemoryProvider } from "@/lib/memory-store";

import "../global.css";

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#160d11",
    card: "#160d11",
  },
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider value={navigationTheme}>
        <MemoryProvider>
          <Stack
            screenOptions={{
              animation: "slide_from_right",
              contentStyle: { backgroundColor: "#160d11" },
              headerShown: false,
            }}
          />
        </MemoryProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

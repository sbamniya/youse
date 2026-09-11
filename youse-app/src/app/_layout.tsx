import { MemoryProvider } from "@/lib/memory-store";
import { PortalHost } from "@rn-primitives/portal";
import { DarkTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";

import "../global.css";

SplashScreen.setOptions({
  duration: 350,
  fade: true,
});

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
        <PortalHost />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

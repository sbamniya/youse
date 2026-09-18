import { LinearGradient } from "expo-linear-gradient";
import { usePathname } from "expo-router";
import { Download, Smartphone } from "lucide-react-native";
import { type ReactNode, useState } from "react";
import { Image, Linking, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BrandMark } from "@/components/app/brand-mark";
import { ThemedIcon } from "@/components/app/themed-icon";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { APP_STORE_URL, PLAY_STORE_URL } from "@/lib/app-download";

const CONTINUE_ON_WEB_KEY = "youse:continue-on-web";
const heroImage = require("../../../assets/images/memory-ladakh-hero.png");

type PlatformChoiceGateProps = {
  children: ReactNode;
};

function PlatformChoiceGate({ children }: PlatformChoiceGateProps) {
  const pathname = usePathname();
  const [continueOnWeb, setContinueOnWeb] = useState(
    () =>
      typeof window !== "undefined" &&
      window.sessionStorage.getItem(CONTINUE_ON_WEB_KEY) === "true",
  );

  if (continueOnWeb || pathname.startsWith("/invite/")) {
    return children;
  }

  const handleContinue = () => {
    window.sessionStorage.setItem(CONTINUE_ON_WEB_KEY, "true");
    setContinueOnWeb(true);
  };

  return (
    <View className="flex-1 overflow-hidden bg-background">
      <Image
        source={heroImage}
        resizeMode="cover"
        className="absolute inset-0 h-full w-full scale-105"
      />
      <View className="absolute inset-0 bg-black/35" />
      <LinearGradient
        colors={["rgba(22,13,17,0.08)", "rgba(22,13,17,0.78)", "#160d11"]}
        locations={[0, 0.54, 0.82]}
        className="absolute inset-0"
      />

      <SafeAreaView
        className="flex-1"
        style={{ paddingHorizontal: 24 }}
      >
        <BrandMark
          className="items-start"
          logoClassName="h-20 w-28"
          showTagline
        />

        <View className="flex-1 justify-end pb-6 sm:pb-8">
          <View className="mb-5 h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/10">
            <ThemedIcon icon={Smartphone} size={23} strokeWidth={1.7} />
          </View>

          <Text className="max-w-[360px] font-serif text-[38px] leading-[43px] text-foreground sm:text-[44px] sm:leading-[49px]">
            Better together, wherever you are.
          </Text>
          <Text className="mt-4 max-w-[360px] text-[16px] leading-6 text-muted-foreground">
            Keep your connection close with the full Youse experience on your
            phone.
          </Text>

          <View className="mt-7 rounded-[28px] border border-white/15 bg-black/25 p-5">
            <View className="flex-row items-center gap-3">
              <View className="h-11 w-11 items-center justify-center rounded-full bg-primary/15">
                <ThemedIcon icon={Download} size={21} strokeWidth={2} />
              </View>
              <View className="flex-1">
                <Text className="font-serif text-[24px] leading-7 text-foreground">
                  Download the app
                </Text>
                <Text className="mt-1 text-[13px] text-muted-foreground">
                  The best way to experience Youse
                </Text>
              </View>
            </View>

            <View className="mt-5 gap-3">
              <Button
                accessibilityLabel="Download Youse from the App Store"
                className="h-15 w-full rounded-full px-5"
                onPress={() => void Linking.openURL(APP_STORE_URL)}
              >
                <ThemedIcon
                  icon={Download}
                  tone="primaryForeground"
                  size={20}
                  strokeWidth={2}
                />
                <Text className="text-[17px] font-bold text-primary-foreground">
                  Download on the App Store
                </Text>
              </Button>

              <Button
                accessibilityLabel="Download Youse from Google Play"
                className="h-15 w-full rounded-full px-5"
                onPress={() => void Linking.openURL(PLAY_STORE_URL)}
              >
                <ThemedIcon
                  icon={Download}
                  tone="primaryForeground"
                  size={20}
                  strokeWidth={2}
                />
                <Text className="text-[17px] font-bold text-primary-foreground">
                  Get it on Google Play
                </Text>
              </Button>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            className="mx-auto mt-4 min-h-10 items-center justify-center px-4 focus-visible:ring-[3px] focus-visible:ring-primary/40"
            onPress={handleContinue}
          >
            <Text className="text-[13px] text-muted-foreground underline">
              Continue on web instead
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

export { PlatformChoiceGate };

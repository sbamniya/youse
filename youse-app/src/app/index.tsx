import { LinearGradient } from "expo-linear-gradient";
import { Link, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Image, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCSSVariable } from "uniwind";

import { BrandMark } from "@/components/app/brand-mark";
import { PrimaryAction } from "@/components/app/primary-action";
import { Text } from "@/components/ui/text";

const backgroundImage =
  "https://images.unsplash.com/photo-1726387871055-35c2c98357f9?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

export default function Index() {
  const background = useCSSVariable("--color-background") as string;

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="light" />
      <Image
        source={{ uri: backgroundImage }}
        resizeMode="cover"
        className="absolute inset-0 h-full w-full"
      />
      <View className="absolute inset-0 bg-black/25" />
      <LinearGradient
        colors={["transparent", `${background}33`, background]}
        locations={[0, 0.48, 1]}
        className="absolute inset-x-0 bottom-0 h-[58%]"
      />

      <SafeAreaView
        className="flex-1"
        edges={["top", "bottom"]}
        style={{ paddingHorizontal: 12 }}
      >
        <View className="flex-1 pt-1">
          <BrandMark
            className="items-start"
            logoClassName="h-24 w-24"
            showTagline
          />

        </View>
      </SafeAreaView>

      <View
        className="absolute items-center"
        style={{
          left: 16,
          right: 16,
          bottom: 32,
          zIndex: 10,
        }}
      >
        <PrimaryAction
          className="w-full"
          label="Get started"
          onPress={() => router.push("/email-otp")}
        />
        <Link href="/invite-code" asChild>
          <Pressable className="mt-6 items-center">
            <Text
              className="font-serif text-[20px] text-accent underline"
              style={{ letterSpacing: 0.2 }}
            >
              I already have an invite code
            </Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

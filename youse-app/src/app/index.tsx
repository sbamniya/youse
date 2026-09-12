import { isAxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { Link, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, Image, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCSSVariable } from "uniwind";

import { BrandMark } from "@/components/app/brand-mark";
import { PrimaryAction } from "@/components/app/primary-action";
import { Text } from "@/components/ui/text";
import api from "@/lib/api";
import { authStorage } from "@/lib/auth-storage";
import { type AuthUser, getUserDestination } from "@/lib/auth-user";

const backgroundImage =
  "https://images.unsplash.com/photo-1726387871055-35c2c98357f9?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

export default function Index() {
  const background = useCSSVariable("--color-background") as string;
  const {
    data: sessionUser,
    isError,
    isFetching,
    isPending,
    refetch,
  } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async (): Promise<AuthUser | null> => {
      const accessToken = await authStorage.getAccessToken();
      if (!accessToken) {
        return null;
      }

      try {
        const user = await api.get<AuthUser>("/auth/me");
        await authStorage.setUser(user);
        return user;
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 401) {
          await authStorage.clear();
          return null;
        }

        throw error;
      }
    },
    retry: false,
  });

  useEffect(() => {
    if (sessionUser) {
      router.replace(getUserDestination(sessionUser, "returning"));
    }
  }, [sessionUser]);

  if (isPending || isFetching || sessionUser) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator colorClassName="accent-primary" size="large" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <BrandMark showTagline />
        <Text className="mt-8 text-center font-serif text-[18px] text-muted-foreground">
          We couldn&apos;t restore your session. Check your connection and try
          again.
        </Text>
        <PrimaryAction
          className="mt-7 w-full"
          label="Try again"
          onPress={() => void refetch()}
        />
        <Pressable
          className="mt-5"
          onPress={async () => {
            await authStorage.clear();
            await refetch();
          }}
        >
          <Text className="font-serif text-[17px] text-accent underline">
            Use another account
          </Text>
        </Pressable>
      </View>
    );
  }

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

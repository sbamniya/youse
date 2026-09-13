import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Ellipsis,
  ImageIcon,
  ImagePlus,
  Pencil,
  UserRound,
} from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Pressable,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCSSVariable } from "uniwind";

import { AppScreen } from "@/components/app/app-screen";
import { BackButton } from "@/components/app/back-button";
import { PrimaryAction } from "@/components/app/primary-action";
import { ThemedIcon } from "@/components/app/themed-icon";
import { Text } from "@/components/ui/text";
import { getImageUrl } from "@/lib/image-url";
import {
  type ApiMemory,
  formatMemoryDate,
  getMemoryImageUrl,
  memoryQueryOptions,
} from "@/lib/memory-api";

const HERO_HEIGHT = 460;

export default function MemoryDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [scrollY] = useState(() => new Animated.Value(0));
  const {
    data: memory,
    isError,
    isPending,
    refetch,
  } = useQuery({
    ...memoryQueryOptions(id ?? ""),
    enabled: Boolean(id),
  });
  const foreground = useCSSVariable("--color-foreground") as string;
  const collapsedHeaderHeight = Math.max(insets.top + 56, 76);
  const collapseDistance = HERO_HEIGHT - collapsedHeaderHeight;
  const heroHeight = scrollY.interpolate({
    inputRange: [0, collapseDistance],
    outputRange: [HERO_HEIGHT, collapsedHeaderHeight],
    extrapolate: "clamp",
  });
  const heroTranslateY = scrollY.interpolate({
    inputRange: [0, collapseDistance],
    outputRange: [0, -96],
    extrapolate: "clamp",
  });
  const heroScale = scrollY.interpolate({
    inputRange: [0, collapseDistance],
    outputRange: [1, 1.08],
    extrapolate: "clamp",
  });
  const compactHeaderOpacity = scrollY.interpolate({
    inputRange: [collapseDistance * 0.55, collapseDistance],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const compactTitleOpacity = scrollY.interpolate({
    inputRange: [collapseDistance * 0.7, collapseDistance],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const controlCircleOpacity = scrollY.interpolate({
    inputRange: [collapseDistance * 0.45, collapseDistance],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  if (id && isPending) {
    return (
      <AppScreen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator colorClassName="accent-primary" size="large" />
        </View>
      </AppScreen>
    );
  }

  if (!id || isError || !memory) {
    return (
      <AppScreen>
        <View className="flex-row px-4 pt-2">
          <BackButton onPress={() => router.replace("/memories")} />
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center font-serif text-[18px] text-muted-foreground">
            We couldn&apos;t load this memory.
          </Text>
          <PrimaryAction
            className="mt-7 w-full"
            label="Try again"
            onPress={() => void refetch()}
          />
        </View>
      </AppScreen>
    );
  }

  const heroImageUrl = getMemoryImageUrl(memory);
  const creatorName = memory.creator?.name?.trim() || "Someone special";
  const creatorImageUrl = getImageUrl(memory.creator?.profilePicture);
  const memoryDetails = [
    formatMemoryDate(memory.memoryDate, "D MMMM YYYY"),
    memory.location?.trim(),
  ]
    .filter(Boolean)
    .join(" · ");

  const openMemoryMenu = () => {
    Alert.alert(memory.title, "What would you like to do?", [
      { text: "Share memory" },
      { text: "Delete memory", style: "destructive" },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const returnToMemories = () => {
    router.replace("/memories");
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="light" />
      <Animated.ScrollView
        className="flex-1"
        contentContainerClassName="bg-background"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View className="w-full overflow-hidden" style={{ height: heroHeight }}>
          <Animated.View
            className="h-[460px] w-full"
            style={{ transform: [{ translateY: heroTranslateY }, { scale: heroScale }] }}
          >
            {heroImageUrl ? (
              <Image
                accessibilityLabel={`${memory.title} memory photo`}
                className="h-full w-full"
                resizeMode="cover"
                source={{ uri: heroImageUrl }}
              />
            ) : (
              <View className="h-full w-full items-center justify-center bg-card">
                <ThemedIcon
                  icon={ImageIcon}
                  tone="muted"
                  size={48}
                  strokeWidth={1.3}
                />
              </View>
            )}
          </Animated.View>
        </Animated.View>
        <View
          className="px-8 pt-9"
          style={{ paddingBottom: Math.max(insets.bottom + 34, 54) }}
        >
          <Text
            className="text-[11px] font-medium uppercase text-primary"
            style={{ letterSpacing: 3.2 }}
          >
            {memoryDetails}
          </Text>

          <Text className="mt-3.5 text-[50px] font-bold leading-[54px] text-foreground">
            {memory.title}
          </Text>

          <Text className="mt-3 font-serif text-[23px] leading-[30px] text-primary/90">
            {memory.description?.trim() || "A moment worth keeping."}
          </Text>

          <View className="mt-9 flex-row items-center justify-between">
            <View className="flex-row items-center gap-4">
              {creatorImageUrl ? (
                <Image
                  accessibilityLabel={`${creatorName}'s profile photo`}
                  className="h-[58px] w-[58px] rounded-full border border-primary/80"
                  resizeMode="cover"
                  source={{ uri: creatorImageUrl }}
                />
              ) : (
                <View className="h-[58px] w-[58px] items-center justify-center rounded-full border border-primary/80 bg-card">
                  <ThemedIcon
                    icon={UserRound}
                    tone="muted"
                    size={25}
                    strokeWidth={1.5}
                  />
                </View>
              )}
              <View>
                <Text
                  className="text-[10px] font-medium uppercase text-primary"
                  style={{ letterSpacing: 2.4 }}
                >
                  Added by
                </Text>
                <Text className="mt-0.5 font-serif text-[22px] text-foreground">
                  {creatorName}
                </Text>
              </View>
            </View>

            <Pressable
              accessibilityLabel={`Edit ${memory.title}`}
              className="flex-row items-center gap-2 rounded-full px-2 py-2 active:bg-secondary/60"
              onPress={() => router.push("/create-memory")}
            >
              <ThemedIcon
                icon={Pencil}
                tone="primary"
                size={22}
                strokeWidth={1.7}
              />
              <Text className="font-serif text-[19px] text-primary">Edit</Text>
            </Pressable>
          </View>

          <Gallery memory={memory} />
        </View>
      </Animated.ScrollView>

      <View
        className="absolute inset-x-0 top-0 z-10"
        pointerEvents="box-none"
        style={{ height: collapsedHeaderHeight }}
      >
        <Animated.View
          className="absolute inset-0 bg-background"
          pointerEvents="none"
          style={{ opacity: compactHeaderOpacity }}
        />
        <View
          className="flex-row items-center justify-between px-5"
          pointerEvents="box-none"
          style={{ paddingTop: Math.max(insets.top + 8, 24) }}
        >
          <BackButton onPress={returnToMemories} />

          <Animated.Text
            numberOfLines={1}
            style={{ color: foreground, fontSize: 18, fontWeight: "700", opacity: compactTitleOpacity }}
          >
            {memory.title}
          </Animated.Text>

          <Pressable
            accessibilityLabel="More memory options"
            className="h-10 w-10 items-center justify-center"
            hitSlop={8}
            onPress={openMemoryMenu}
          >
            <Animated.View
              className="absolute inset-0 rounded-full bg-black/45"
              style={{ opacity: controlCircleOpacity }}
            />
            <ThemedIcon icon={Ellipsis} tone="foreground" size={26} strokeWidth={2.4} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function Gallery({ memory }: { memory: ApiMemory }) {
  return (
    <View className="mt-9">
      <Text
        className="text-[10px] font-medium uppercase text-primary"
        style={{ letterSpacing: 2.4 }}
      >
        Gallery · {memory.partnerMemoryItems.length}{" "}
        {memory.partnerMemoryItems.length === 1 ? "photo" : "photos"}
      </Text>
      <View className="-mx-1.5 mt-3 flex-row flex-wrap">
        <View className="w-1/2 p-1.5">
          <Pressable
            accessibilityLabel={`Add a photo to ${memory.title}`}
            className="aspect-[3/4] w-full items-center justify-center rounded-2xl border border-dashed border-border bg-card px-4 active:opacity-70"
            onPress={() => router.push(`/memory/${memory.id}/add-photo`)}
          >
            <View className="h-11 w-11 items-center justify-center rounded-full bg-secondary">
              <ThemedIcon icon={ImagePlus} size={22} strokeWidth={1.8} />
            </View>
            <Text className="mt-3 text-center text-[14px] font-semibold text-primary">Add photo</Text>
            <Text className="mt-1 text-center text-[11px] text-muted-foreground">Caption optional</Text>
          </Pressable>
        </View>
        {memory.partnerMemoryItems.map((photo) => {
          const imageUrl = getImageUrl(photo.imageUrl);

          return (
            <View key={photo.id} className="w-1/2 p-1.5">
              <View className="overflow-hidden rounded-2xl bg-card">
                <View className="aspect-[3/4] w-full overflow-hidden">
                  {imageUrl ? (
                    <Image
                      accessibilityLabel={`${memory.title} gallery photo`}
                      className="h-full w-full"
                      resizeMode="cover"
                      source={{ uri: imageUrl }}
                    />
                  ) : (
                    <View className="h-full w-full items-center justify-center">
                      <ThemedIcon
                        icon={ImageIcon}
                        tone="muted"
                        size={26}
                        strokeWidth={1.5}
                      />
                    </View>
                  )}
                </View>
                {photo.caption ? (
                  <Text className="px-3 py-2.5 font-serif text-[13px] leading-5 text-foreground">
                    {photo.caption}
                  </Text>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

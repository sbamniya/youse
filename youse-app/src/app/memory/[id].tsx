import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ChevronLeft, Ellipsis, ImagePlus, Pencil } from "lucide-react-native";
import {
  Alert,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedIcon } from "@/components/app/themed-icon";
import { Text } from "@/components/ui/text";
import { featuredMemory } from "@/lib/memories";
import { useMemories } from "@/lib/memory-store";

const meeraAvatar = require("../../../assets/images/memory-meera-avatar.png");

export default function MemoryDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { memories } = useMemories();
  const memory = memories.find((item) => item.id === id) ?? featuredMemory;

  const openMemoryMenu = () => {
    Alert.alert(memory.title, "What would you like to do?", [
      { text: "Share memory" },
      { text: "Delete memory", style: "destructive" },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="light" />
      <ScrollView
        className="flex-1"
        contentContainerClassName="bg-background"
        showsVerticalScrollIndicator={false}
      >
        <ImageBackground
          accessibilityLabel={`${memory.title} memory photo`}
          className="h-[460px] w-full"
          resizeMode="cover"
          source={memory.image}
        >
          <View
            className="flex-row items-center justify-between px-5"
            style={{ paddingTop: Math.max(insets.top + 12, 28) }}
          >
            <Pressable
              accessibilityLabel="Go back"
              className="h-10 w-10 items-center justify-center rounded-full bg-black/45 active:opacity-75"
              hitSlop={8}
              onPress={() => router.back()}
            >
              <ThemedIcon
                icon={ChevronLeft}
                tone="foreground"
                size={25}
                strokeWidth={2}
              />
            </Pressable>

            <Pressable
              accessibilityLabel="More memory options"
              className="h-10 w-10 items-center justify-center rounded-full bg-black/45 active:opacity-75"
              hitSlop={8}
              onPress={openMemoryMenu}
            >
              <ThemedIcon
                icon={Ellipsis}
                tone="foreground"
                size={26}
                strokeWidth={2.4}
              />
            </Pressable>
          </View>
        </ImageBackground>
        <View
          className="px-8 pt-9"
          style={{ paddingBottom: Math.max(insets.bottom + 34, 54) }}
        >
          <Text
            className="text-[11px] font-medium uppercase text-primary"
            style={{ letterSpacing: 3.2 }}
          >
            {memory.date} · {memory.location}
          </Text>

          <Text className="mt-3.5 text-[50px] font-bold leading-[54px] text-foreground">
            {memory.title}
          </Text>

          <Text className="mt-3 font-serif text-[23px] leading-[30px] text-primary/90">
            {memory.story}
          </Text>

          <View className="mt-9 flex-row items-center justify-between">
            <View className="flex-row items-center gap-4">
              <Image
                accessibilityLabel={`${memory.author}'s profile photo`}
                className="h-[58px] w-[58px] rounded-full border border-primary/80"
                resizeMode="cover"
                source={meeraAvatar}
              />
              <View>
                <Text
                  className="text-[10px] font-medium uppercase text-primary"
                  style={{ letterSpacing: 2.4 }}
                >
                  Added by
                </Text>
                <Text className="mt-0.5 font-serif text-[22px] text-foreground">
                  {memory.author}
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
      </ScrollView>
    </View>
  );
}

function Gallery({ memory }: { memory: ReturnType<typeof useMemories>["memories"][number] }) {
  return (
    <View className="mt-9">
      <Text
        className="text-[10px] font-medium uppercase text-primary"
        style={{ letterSpacing: 2.4 }}
      >
        Gallery · {memory.photos.length} {memory.photos.length === 1 ? "photo" : "photos"}
      </Text>
      <View className="mt-3 flex-row flex-wrap gap-3">
        <Pressable
          accessibilityLabel={`Add a photo to ${memory.title}`}
          className="aspect-[3/4] w-[48%] items-center justify-center rounded-2xl border border-dashed border-border bg-card px-4 active:opacity-70"
          onPress={() => router.push(`/memory/${memory.id}/add-photo`)}
        >
          <View className="h-11 w-11 items-center justify-center rounded-full bg-secondary">
            <ThemedIcon icon={ImagePlus} size={22} strokeWidth={1.8} />
          </View>
          <Text className="mt-3 text-center text-[14px] font-semibold text-primary">Add photo</Text>
          <Text className="mt-1 text-center text-[11px] text-muted-foreground">Caption optional</Text>
        </Pressable>
        {memory.photos.map((photo) => (
          <View key={photo.id} className="w-[48%] overflow-hidden rounded-2xl bg-card">
            <View className="aspect-[3/4] w-full overflow-hidden">
              <Image
                accessibilityLabel={photo.caption ?? `${memory.title} gallery photo`}
                className="h-full w-full"
                resizeMode="cover"
                source={photo.image}
              />
            </View>
            {photo.caption ? (
              <Text className="px-3 py-2 font-serif text-[14px] leading-5 text-primary">
                {photo.caption}
              </Text>
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}

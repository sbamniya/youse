import { router } from "expo-router";
import { Plus } from "lucide-react-native";
import { Image, Pressable, ScrollView, View } from "react-native";

import { AppScreen } from "@/components/app/app-screen";
import { ThemedIcon } from "@/components/app/themed-icon";
import { Text } from "@/components/ui/text";
import { featuredMemory } from "@/lib/memories";
import { useMemories } from "@/lib/memory-store";

export default function Memories() {
  const { memories } = useMemories();
  return (
    <AppScreen>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-8 pt-3"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-start justify-between">
          <View>
            <Text className="text-[28px] font-bold leading-10.75 text-foreground">
              Memories
            </Text>
            <Text
              className="mt-2 text-[10px] font-semibold text-muted-foreground"
              style={{ letterSpacing: 2 }}
            >
              OUR STORY, A BRIGHTER US
            </Text>
          </View>
          <Pressable
            accessibilityLabel="Add a memory"
            className="h-9 w-9 items-center justify-center"
            onPress={() => router.push("/create-memory")}
          >
            <ThemedIcon icon={Plus} size={26} strokeWidth={1.8} />
          </Pressable>
        </View>

        {/* On this day */}
        <Text
          className="mt-6 text-[10px] font-semibold text-muted-foreground"
          style={{ letterSpacing: 2 }}
        >
          ON THIS DAY
        </Text>
        <Pressable
          className="mt-3 flex-row items-center gap-4 active:opacity-80"
          onPress={() => router.push(`/memory/${featuredMemory.id}`)}
        >
          <Image
            source={featuredMemory.image}
            resizeMode="cover"
            className="h-24 w-32 rounded-2xl"
          />
          <View className="flex-1">
            <Text className="font-serif text-[24px] text-foreground">
              {featuredMemory.title}
            </Text>
            <Text
              className="mt-0.5 text-[11px] font-semibold text-muted-foreground"
              style={{ letterSpacing: 1.5 }}
            >
              {featuredMemory.dateLabel}
            </Text>
            <View className="mt-2 h-px w-5 bg-muted-foreground" />
            <Text className="mt-2 font-serif text-[15px] leading-5 text-muted-foreground">
              Same place,{"\n"}brighter days.
            </Text>
          </View>
        </Pressable>

        {/* Grid */}
        <View className="mt-6 flex-row flex-wrap gap-2">
          {memories.map((memory) => (
            <Pressable
              key={memory.id}
              className="w-[48.5%] active:opacity-80"
              onPress={() => router.push(`/memory/${memory.id}`)}
            >
              <View className="aspect-[3/4] w-full overflow-hidden rounded-2xl">
                <Image
                  source={memory.image}
                  resizeMode="cover"
                  className="absolute inset-0 h-full w-full"
                />
              </View>
              <View className="absolute inset-x-0 bottom-0 rounded-b-2xl bg-black/25 px-3 pb-3 pt-6">
                <Text className="font-serif text-[18px] text-foreground">
                  {memory.title}
                </Text>
                <Text
                  className="mt-0.5 text-[10px] font-semibold text-foreground/80"
                  style={{ letterSpacing: 1 }}
                >
                  {memory.dateLabel}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { ImageIcon, Plus } from "lucide-react-native";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  View,
} from "react-native";

import { AppScreen } from "@/components/app/app-screen";
import { PrimaryAction } from "@/components/app/primary-action";
import { ThemedIcon } from "@/components/app/themed-icon";
import { Text } from "@/components/ui/text";
import {
  type ApiMemory,
  formatMemoryDate,
  getMemoryImageUrl,
  getOnThisDayMemory,
  memoriesQueryOptions,
} from "@/lib/memory-api";
import { cn } from "@/lib/utils";

export default function Memories() {
  const { data: memories, isError, isPending, refetch } = useQuery(
    memoriesQueryOptions,
  );

  if (isPending) {
    return (
      <AppScreen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator colorClassName="accent-primary" size="large" />
        </View>
      </AppScreen>
    );
  }

  if (isError) {
    return (
      <AppScreen>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center font-serif text-[18px] text-muted-foreground">
            We couldn&apos;t load your memories. Check your connection and try
            again.
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

  const featuredMemory = getOnThisDayMemory(memories);

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

        {featuredMemory ? (
          <>
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
              <MemoryImage
                memory={featuredMemory}
                className="h-24 w-32 rounded-2xl"
              />
              <View className="flex-1">
                <Text className="font-serif text-[24px] text-foreground">
                  {featuredMemory.title}
                </Text>
                <Text
                  className="mt-0.5 text-[11px] font-semibold uppercase text-muted-foreground"
                  style={{ letterSpacing: 1.5 }}
                >
                  {formatMemoryDate(featuredMemory.memoryDate)}
                </Text>
                <View className="mt-2 h-px w-5 bg-muted-foreground" />
                <Text className="mt-2 font-serif text-[15px] leading-5 text-muted-foreground">
                  Same place,{"\n"}brighter days.
                </Text>
              </View>
            </Pressable>
          </>
        ) : null}

        {/* Grid */}
        {memories.length ? (
          <View className="mt-6 flex-row flex-wrap gap-2">
            {memories.map((memory) => (
              <Pressable
                key={memory.id}
                className="w-[48.5%] active:opacity-80"
                onPress={() => router.push(`/memory/${memory.id}`)}
              >
                <View className="aspect-[3/4] w-full overflow-hidden rounded-2xl">
                  <MemoryImage
                    memory={memory}
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
                    {formatMemoryDate(memory.memoryDate)}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        ) : (
          <View className="flex-1 items-center justify-center px-5 py-24">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-secondary">
              <ThemedIcon icon={ImageIcon} size={26} strokeWidth={1.6} />
            </View>
            <Text className="mt-5 text-center font-serif text-[24px] text-foreground">
              Your story starts here.
            </Text>
            <Text className="mt-2 text-center text-[14px] leading-5 text-muted-foreground">
              Save a favorite moment so you can find it together later.
            </Text>
            <PrimaryAction
              className="mt-7 w-full"
              label="Add your first memory"
              onPress={() => router.push("/create-memory")}
            />
          </View>
        )}
      </ScrollView>
    </AppScreen>
  );
}

function MemoryImage({
  className,
  memory,
}: {
  className: string;
  memory: ApiMemory;
}) {
  const imageUrl = getMemoryImageUrl(memory);

  if (imageUrl) {
    return (
      <Image
        accessibilityLabel={`${memory.title} memory photo`}
        className={className}
        resizeMode="cover"
        source={{ uri: imageUrl }}
      />
    );
  }

  return (
    <View className={cn("items-center justify-center bg-card", className)}>
      <ThemedIcon icon={ImageIcon} tone="muted" size={24} strokeWidth={1.5} />
    </View>
  );
}

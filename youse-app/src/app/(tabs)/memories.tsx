import { router } from "expo-router";
import { Plus } from "lucide-react-native";
import { Image, Pressable, ScrollView, View } from "react-native";

import { AppScreen } from "@/components/app/app-screen";
import { ThemedIcon } from "@/components/app/themed-icon";
import { Text } from "@/components/ui/text";

const featuredMemory = {
  title: "Goa",
  dateLabel: "3 FEB",
  quote: "Same place,\nbrighter days.",
  image:
    "https://images.unsplash.com/photo-1726387871055-35c2c98357f9?q=80&w=900&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
};

const memories = [
  {
    key: "ladakh",
    title: "Ladakh",
    dateLabel: "12 JUN",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=700&auto=format&fit=crop",
  },
  {
    key: "goa",
    title: "Goa",
    dateLabel: "3 FEB",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=700&auto=format&fit=crop",
  },
  {
    key: "apartment",
    title: "Our apartment",
    dateLabel: "14 DEC",
    image: "https://picsum.photos/seed/our-apartment/700/900",
  },
  {
    key: "diwali",
    title: "Diwali",
    dateLabel: "1 NOV",
    image: "https://picsum.photos/seed/diwali-lights/700/900",
  },
];

export default function Memories() {
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
        <Pressable className="mt-3 flex-row items-center gap-4">
          <Image
            source={{ uri: featuredMemory.image }}
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
              {featuredMemory.quote}
            </Text>
          </View>
        </Pressable>

        {/* Grid */}
        <View className="mt-6 flex-row flex-wrap gap-2">
          {memories.map((memory) => (
            <Pressable key={memory.key} className="w-[48.5%]">
              <Image
                source={{ uri: memory.image }}
                resizeMode="cover"
                className="aspect-[3/4] w-full rounded-2xl"
              />
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

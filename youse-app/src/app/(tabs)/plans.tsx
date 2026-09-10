import { router } from "expo-router";
import { Plus } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { AppScreen } from "@/components/app/app-screen";
import { PlansCalendar } from "@/components/app/plans-calendar";
import { OurLists } from "@/components/app/plans-lists";
import { ThemedIcon } from "@/components/app/themed-icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

export default function Plans() {
  const [view, setView] = useState<"calendar" | "list">("calendar");

  const isCalendar = view === "calendar";
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
              Plans
            </Text>
            <Text
              className="mt-2 text-[10px] font-semibold text-muted-foreground"
              style={{ letterSpacing: 2 }}
            >
              SAME PEOPLE{"\n"}BRIGHTER DAYS
            </Text>
            <View className="mt-2 h-px w-6 bg-muted-foreground" />
          </View>
          <Pressable
            accessibilityLabel="Add a plan"
            className="h-9 w-9 items-center justify-center"
            onPress={() => router.push("/create-plan")}
          >
            <ThemedIcon icon={Plus} size={26} strokeWidth={1.8} />
          </Pressable>
        </View>

        {/* Segmented control */}
        <View className="mt-6 flex-row rounded-full border border-border-subtle p-1">
          {(["calendar", "list"] as const).map((tab) => (
            <Pressable
              key={tab}
              className={cn(
                "flex-1 items-center rounded-full py-3",
                view === tab && "bg-primary",
              )}
              onPress={() => setView(tab)}
            >
              <Text
                className={cn(
                  "text-[15px] font-semibold capitalize",
                  view === tab ? "text-primary-foreground" : "text-foreground",
                )}
              >
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>

        {isCalendar ? <PlansCalendar /> : <OurLists />}
      </ScrollView>
    </AppScreen>
  );
}


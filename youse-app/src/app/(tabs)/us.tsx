import { ChevronRight } from "lucide-react-native";
import { useState } from "react";
import {
    Alert,
    Image,
    Pressable,
    ScrollView,
    Switch,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedIcon } from "@/components/app/themed-icon";
import { TrialBadge } from "@/components/app/trial-badge";
import { Text } from "@/components/ui/text";
import { router } from "expo-router";

const meeraAvatar = require("../../../assets/images/memory-meera-avatar.png");

const settingsRows = [
  {
    detail: "8:00 PM",
    section: "NOTIFICATIONS",
    title: "Daily question",
  },
  {
    detail: "On",
    title: "Pokes from Arjun",
  },
  {
    detail: "Download a copy of your memories",
    section: "PRIVACY & DATA",
    title: "Export our data",
  },
  {
    detail: "How we keep your data safe",
    title: "Privacy",
  },
];

export default function Us() {
  const insets = useSafeAreaInsets();
  const [darkMode, setDarkMode] = useState(true);

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-12"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingTop: Math.max(insets.top + 18, 42) }}>
          <Text className="text-[28px] font-bold leading-10.75 text-foreground">
            Us
          </Text>
          <Text
            className="mt-2 text-[10px] font-semibold text-muted-foreground"
            style={{ letterSpacing: 2 }}
          >
            SAME PEOPLE{"\n"}BRIGHTER DAYS
          </Text>
          <View className="mt-2 h-px w-6 bg-muted-foreground" />

          <Pressable
            accessibilityLabel="Edit Meera Singh profile"
            className="mt-6 flex-row items-center active:opacity-70"
            onPress={() => router.push("/profile")}
          >
            <Image
              source={meeraAvatar}
              resizeMode="cover"
              className="h-14 w-14 rounded-full border border-primary"
            />
            <View className="ml-5 flex-1">
              <Text className="text-[16px] font-bold leading-8 text-foreground">
                Meera Singh
              </Text>
              <Text className="mt-1 font-serif text-[14px] text-primary">
                meera.singh@gmail.com
              </Text>
            </View>
            <ThemedIcon icon={ChevronRight} size={28} strokeWidth={1.5} />
          </Pressable>

          <View className="mt-4 border-t border-border-subtle pt-4">
            <SectionLabel label="RELATIONSHIP" />
            <View className="mt-1 flex-row items-center">
              <View className="flex-1">
                <Text className="font-serif text-[16px] text-foreground">
                  Meera + Arjun
                </Text>
                <Text className="mt-1 font-serif text-[12px] text-primary">
                  Connected 3 Sep 2026
                </Text>
              </View>
              <View className="h-21 w-px bg-border-subtle" />
              <View className="ml-6 flex-1">
                <Text className="font-serif text-[16px] text-foreground">
                  Youse trial
                </Text>
                <TrialBadge className="mt-1 self-start" days={11} />
              </View>
              <ThemedIcon icon={ChevronRight} size={24} strokeWidth={1.5} />
            </View>
          </View>

          <View className="mt-4 border-t border-border-subtle pt-4">
            <SectionLabel label="APPEARANCE" />
            <View className="mt-5 flex-row items-center">
              <View className="flex-1">
                <Text className="font-serif text-[16px] text-foreground">
                  Dark mode
                </Text>
                <Text className="mt-1 font-serif text-[14px] text-primary">
                  A calmer, kinder space
                </Text>
              </View>
              <Switch
                accessibilityLabel="Dark mode"
                onValueChange={setDarkMode}
                thumbColor="#fff6f2"
                trackColor={{ false: "#4c3036", true: "#d9adae" }}
                value={darkMode}
              />
            </View>
          </View>

          {settingsRows.map(({ detail, section, title }, index) => (
            <View
              key={title}
              className="mt-4 border-t border-border-subtle pt-4"
            >
              {section ? <SectionLabel label={section} /> : null}
              <Pressable
                accessibilityLabel={title}
                className={
                  section
                    ? "mt-5 flex-row items-center active:opacity-70"
                    : "flex-row items-center active:opacity-70"
                }
                onPress={() => Alert.alert(title, detail)}
              >
                <View className="flex-1">
                  <Text className="font-serif text-[16px] text-foreground">
                    {title}
                  </Text>
                  <Text className="mt-1 font-serif text-[14px] text-primary">
                    {detail}
                  </Text>
                </View>
                <ThemedIcon icon={ChevronRight} size={24} strokeWidth={1.5} />
              </Pressable>
            </View>
          ))}

          <View className="mt-8 border-t border-border-subtle pt-7">
            <SectionLabel label="RELATIONSHIP STATUS" />
            <View className="mt-5 flex-row items-center">
              <Pressable
                accessibilityRole="button"
                className="rounded-full w-full border border-primary px-5 py-3 active:opacity-70"
                onPress={() =>
                  Alert.alert(
                    "Unlink Arjun?",
                    "This would end your shared connection. You can reconnect later with a new invite.",
                    [
                      { style: "cancel", text: "Keep connected" },
                      { style: "destructive", text: "Unlink" },
                    ],
                  )
                }
              >
                <Text className="text-[17px] text-center font-semibold text-primary">
                  Unlink partner
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <Text className="text-[12px] font-medium tracking-[4px] text-primary">
      {label}
    </Text>
  );
}

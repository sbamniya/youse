import { ChevronRight } from "lucide-react-native";
import { useState } from "react";
import { Alert, Image, Pressable, ScrollView, Switch, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedIcon } from "@/components/app/themed-icon";
import { Text } from "@/components/ui/text";

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
      <ScrollView className="flex-1" contentContainerClassName="px-5 pb-12" showsVerticalScrollIndicator={false}>
        <View style={{ paddingTop: Math.max(insets.top + 18, 42) }}>
          <Text className="text-[48px] font-bold leading-[52px] tracking-[-1px] text-foreground">Us</Text>
          <Text className="mt-2 text-[12px] font-medium leading-6 tracking-[4px] text-primary">
            SAME PEOPLE{"\n"}BRIGHTER DAYS
          </Text>

          <Pressable
            accessibilityLabel="Edit Meera Singh profile"
            className="mt-11 flex-row items-center active:opacity-70"
            onPress={() => Alert.alert("Profile", "Profile editing will be available here.")}
          >
            <Image source={meeraAvatar} resizeMode="cover" className="h-20 w-20 rounded-full border border-primary" />
            <View className="ml-5 flex-1">
              <Text className="text-[28px] font-bold leading-8 text-foreground">Meera Singh</Text>
              <Text className="mt-1 font-serif text-[20px] text-primary">meera.singh@gmail.com</Text>
            </View>
            <ThemedIcon icon={ChevronRight} size={34} strokeWidth={1.5} />
          </Pressable>

          <View className="mt-8 border-t border-border-subtle pt-7">
            <SectionLabel label="RELATIONSHIP" />
            <Pressable
              accessibilityLabel="Manage your relationship and trial"
              className="mt-5 flex-row items-center active:opacity-70"
              onPress={() => Alert.alert("Your relationship", "Meera and Arjun are connected with 11 trial days left.")}
            >
              <View className="flex-1">
                <Text className="font-serif text-[27px] text-foreground">Meera + Arjun</Text>
                <Text className="mt-1 font-serif text-[19px] text-primary">Connected 3 Sep 2026</Text>
              </View>
              <View className="h-21 w-px bg-border-subtle" />
              <View className="ml-6 flex-1">
                <Text className="font-serif text-[27px] text-foreground">Youse trial</Text>
                <Text className="mt-1 font-serif text-[19px] text-primary">11 days left</Text>
              </View>
              <ThemedIcon icon={ChevronRight} size={31} strokeWidth={1.5} />
            </Pressable>
          </View>

          <View className="mt-8 border-t border-border-subtle pt-7">
            <SectionLabel label="APPEARANCE" />
            <View className="mt-5 flex-row items-center">
              <View className="flex-1">
                <Text className="font-serif text-[27px] text-foreground">Dark mode</Text>
                <Text className="mt-1 font-serif text-[19px] text-primary">A calmer, kinder space</Text>
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
            <View key={title} className="mt-8 border-t border-border-subtle pt-7">
              {section ? <SectionLabel label={section} /> : null}
              <Pressable
                accessibilityLabel={title}
                className={section ? "mt-5 flex-row items-center active:opacity-70" : "flex-row items-center active:opacity-70"}
                onPress={() => Alert.alert(title, detail)}
              >
                <View className="flex-1">
                  <Text className="font-serif text-[27px] text-foreground">{title}</Text>
                  <Text className="mt-1 font-serif text-[19px] text-primary">{detail}</Text>
                </View>
                <ThemedIcon icon={ChevronRight} size={31} strokeWidth={1.5} />
              </Pressable>
            </View>
          ))}

          <View className="mt-8 border-t border-border-subtle pt-7">
            <SectionLabel label="RELATIONSHIP STATUS" />
            <View className="mt-5 flex-row items-center">
              <View className="flex-1 pr-4">
                <Text className="font-serif text-[27px] text-foreground">Unlink partner</Text>
                <Text className="mt-1 font-serif text-[18px] leading-6 text-primary">
                  This will end your connection on Youse
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                className="rounded-full border border-primary px-5 py-3 active:opacity-70"
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
                <Text className="text-[17px] font-semibold text-primary">Unlink partner</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function SectionLabel({ label }: { label: string }) {
  return <Text className="text-[12px] font-medium tracking-[4px] text-primary">{label}</Text>;
}

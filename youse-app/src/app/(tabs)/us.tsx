import { ChevronRight, X } from "lucide-react-native";
import { useState } from "react";
import { Alert, Image, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedIcon } from "@/components/app/themed-icon";
import { TrialBadge } from "@/components/app/trial-badge";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { router } from "expo-router";

const meeraAvatar = require("../../../assets/images/memory-meera-avatar.png");

const dailyQuestionTimes = Array.from({ length: 46 }, (_, index) => {
  const totalMinutes = 60 + index * 30;
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  const period = hour < 12 ? "AM" : "PM";
  const displayHour = hour % 12 || 12;

  return `${String(displayHour).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${period}`;
});

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
    comingSoon: true,
  },
  {
    detail: "How we keep your data safe",
    title: "Privacy",
  },
];

export default function Us() {
  const insets = useSafeAreaInsets();
  const [dailyQuestionTime, setDailyQuestionTime] = useState("08:00 PM");
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);

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
            <Pressable
              accessibilityLabel="Manage relationship and billing"
              accessibilityRole="button"
              className="mt-1 flex-row items-center active:opacity-70"
              onPress={() => router.push("/billing")}
            >
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
                <TrialBadge
                  className="mt-1 self-start"
                  days={11}
                  interactive={false}
                />
              </View>
              <ThemedIcon icon={ChevronRight} size={24} strokeWidth={1.5} />
            </Pressable>
          </View>

          {/* <View className="mt-4 border-t border-border-subtle pt-4">
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
          </View> */}

          {settingsRows.map(({ detail, section, title, comingSoon }) => {
            const isDailyQuestion = title === "Daily question";
            const rowDetail = isDailyQuestion ? dailyQuestionTime : detail;

            return (
            <View
              key={title}
              className="mt-4 border-t border-border-subtle pt-4"
            >
              {section ? <SectionLabel label={section} /> : null}
              <Pressable
                accessibilityLabel={title}
                className={cn(
                  section
                    ? "mt-5 flex-row items-center active:opacity-70"
                    : "flex-row items-center active:opacity-70",
                  {
                    "opacity-50": comingSoon,
                  },
                )}
                disabled={comingSoon}
                onPress={() => {
                  if (comingSoon) return;
                  if (isDailyQuestion) {
                    setIsTimePickerOpen(true);
                    return;
                  }
                  Alert.alert(title, rowDetail);
                }}
              >
                <View className="flex-1">
                  <Text className="font-serif text-[16px] text-foreground">
                    {title}
                    {comingSoon ? " (Coming Soon)" : ""}
                  </Text>
                  <Text className="mt-1 font-serif text-[14px] text-primary">
                    {rowDetail}
                  </Text>
                </View>
                <ThemedIcon icon={ChevronRight} size={24} strokeWidth={1.5} />
              </Pressable>
            </View>
            );
          })}

          <View className="mt-8 border-t border-border-subtle pt-7">
            <SectionLabel label="RELATIONSHIP STATUS" />
            <View className="mt-5 flex-row items-center">
              <Pressable
                accessibilityRole="button"
                className="rounded-full w-full border border-primary px-5 py-3 active:opacity-70"
                onPress={() => router.push("/unlink-partner")}
              >
                <Text className="text-[17px] text-center font-semibold text-primary">
                  Unlink partner
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
      <AlertDialog onOpenChange={setIsTimePickerOpen} open={isTimePickerOpen}>
        <AlertDialogContent className="mx-4 self-stretch rounded-3xl border-border-subtle bg-card p-5 web:mx-0 web:self-center">
          <AlertDialogHeader className="relative pr-12">
            <AlertDialogTitle className="text-left text-[22px] text-foreground">
              Daily question time
            </AlertDialogTitle>
            <AlertDialogCancel
              accessibilityLabel="Close time picker"
              className="absolute -right-1 -top-1 h-10 w-10 items-center justify-center rounded-full border-0 bg-transparent p-0 active:bg-muted"
            >
              <ThemedIcon icon={X} size={19} strokeWidth={2} />
            </AlertDialogCancel>
          </AlertDialogHeader>
          <Text className="-mt-2 font-serif text-[14px] text-muted-foreground">
            Choose when you’d like your daily question.
          </Text>
          <ScrollView className="max-h-80" showsVerticalScrollIndicator={false}>
            <View className="-mx-1 flex-row flex-wrap">
              {dailyQuestionTimes.map((time) => {
                const isSelected = time === dailyQuestionTime;

                return (
                  <View key={time} className="w-1/2 p-1">
                    <Pressable
                      accessibilityRole="radio"
                      accessibilityState={{ checked: isSelected }}
                      className={cn(
                        "h-11 items-center justify-center rounded-xl border active:opacity-75",
                        isSelected
                          ? "border-primary bg-primary"
                          : "border-border-subtle bg-background",
                      )}
                      onPress={() => {
                        setDailyQuestionTime(time);
                        setIsTimePickerOpen(false);
                      }}
                    >
                      <Text
                        className={cn(
                          "text-[14px] font-semibold",
                          isSelected ? "text-primary-foreground" : "text-foreground",
                        )}
                      >
                        {time}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </AlertDialogContent>
      </AlertDialog>
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

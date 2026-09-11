import dayjs from "dayjs";
import { router } from "expo-router";
import { Camera } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { AppScreen } from "@/components/app/app-screen";
import { BackButton } from "@/components/app/back-button";
import { DatePickerField } from "@/components/app/date-picker";
import { FormField } from "@/components/app/form-field";
import { PageIntro } from "@/components/app/page-intro";
import { PrimaryAction } from "@/components/app/primary-action";
import { ThemedIcon } from "@/components/app/themed-icon";
import { ToggleRow } from "@/components/app/toggle-row";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

const CATEGORIES = ["Dinner", "Trip", "Occasion"] as const;

export default function CreatePlan() {
  const [title, setTitle] = useState("Dinner at Veronica’s");
  const [selectedDate, setSelectedDate] = useState(() => dayjs("2026-09-07"));
  const [time, setTime] = useState("8:30 PM");
  const [location, setLocation] = useState("Bandra West");
  const [notes, setNotes] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("Dinner");
  const [hasPhoto, setHasPhoto] = useState(false);
  const [remindBoth, setRemindBoth] = useState(true);

  return (
    <AppScreen>
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <BackButton className="mt-2" />

        <PageIntro
          className="mt-4"
          description="Good plans bring us closer."
          displayTitle
          eyebrow="NEW SHARED PLAN"
          title="Something to look forward to."
        />

        <FormField
          label="Title"
          onChangeText={setTitle}
          placeholder="Dinner at Veronica’s"
          value={title}
        />
        <DatePickerField label="Date" onValueChange={setSelectedDate} value={selectedDate} />
        <FormField
          label="Time"
          onChangeText={setTime}
          placeholder="8:30 PM"
          value={time}
        />
        <FormField
          label="Location"
          onChangeText={setLocation}
          placeholder="Bandra West"
          value={location}
        />
        <FormField
          label="Notes"
          onChangeText={setNotes}
          placeholder="Add a note (optional)"
          value={notes}
        />

        {/* Photo */}
        <Pressable
          className="mt-6 flex-row items-center gap-3"
          onPress={() => setHasPhoto((current) => !current)}
        >
          <View
            className={cn(
              "h-11 w-11 items-center justify-center rounded-full",
              hasPhoto ? "bg-primary" : "bg-primary/20",
            )}
          >
            <ThemedIcon
              icon={Camera}
              size={18}
              strokeWidth={1.8}
              tone={hasPhoto ? "primaryForeground" : "accent"}
            />
          </View>
          <Text className="text-[15px] text-foreground">
            {hasPhoto ? "Photo added" : "Add a photo"}{" "}
            <Text className="text-muted-foreground">(optional)</Text>
          </Text>
        </Pressable>

        {/* Category */}
        <View className="mt-7 flex-row gap-2">
          {CATEGORIES.map((option) => {
            const active = option === category;
            return (
              <Pressable
                key={option}
                className={cn(
                  "rounded-full border px-5 py-3",
                  active ? "border-primary bg-primary" : "border-border-subtle",
                )}
                onPress={() => setCategory(option)}
              >
                <Text
                  className={cn(
                    "text-[15px] font-semibold",
                    active ? "text-primary-foreground" : "text-foreground",
                  )}
                >
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <ToggleRow label="Remind both of us" onValueChange={setRemindBoth} value={remindBoth} />
      </ScrollView>

      <View className="px-4 pb-3 pt-2">
        <PrimaryAction label="Add to our plans" onPress={() => router.back()} />
      </View>
    </AppScreen>
  );
}

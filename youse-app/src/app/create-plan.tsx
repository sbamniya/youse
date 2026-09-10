import { router } from "expo-router";
import { Camera, ChevronLeft } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { useCSSVariable } from "uniwind";

import { AppScreen } from "@/components/app/app-screen";
import { PageIntro } from "@/components/app/page-intro";
import { PrimaryAction } from "@/components/app/primary-action";
import { ThemedIcon } from "@/components/app/themed-icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

const CATEGORIES = ["Dinner", "Trip", "Occasion"] as const;

type PlanFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
};

function PlanField({ label, placeholder, value, onChangeText }: PlanFieldProps) {
  const placeholderColor = useCSSVariable("--color-placeholder") as string;

  return (
    <View className="mt-6">
      <Text
        className="text-[11px] font-semibold text-muted-foreground"
        style={{ letterSpacing: 2 }}
      >
        {label.toUpperCase()}
      </Text>
      <TextInput
        className="mt-2 border-b border-border-subtle pb-3 text-[18px] text-foreground"
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        value={value}
      />
    </View>
  );
}

export default function CreatePlan() {
  const [title, setTitle] = useState("Dinner at Veronica’s");
  const [date, setDate] = useState("07 Sep 2026");
  const [time, setTime] = useState("8:30 PM");
  const [location, setLocation] = useState("Bandra West");
  const [notes, setNotes] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("Dinner");
  const [hasPhoto, setHasPhoto] = useState(false);
  const [remindBoth, setRemindBoth] = useState(true);

  return (
    <AppScreen>
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <Pressable
          accessibilityLabel="Go back"
          className="pt-2"
          hitSlop={12}
          onPress={() => router.back()}
        >
          <ThemedIcon icon={ChevronLeft} tone="foreground" size={26} strokeWidth={2} />
        </Pressable>

        <PageIntro
          className="mt-4"
          description="Good plans bring us closer."
          displayTitle
          eyebrow="NEW SHARED PLAN"
          title="Something to look forward to."
        />

        <PlanField
          label="Title"
          onChangeText={setTitle}
          placeholder="Dinner at Veronica’s"
          value={title}
        />
        <PlanField
          label="Date"
          onChangeText={setDate}
          placeholder="07 Sep 2026"
          value={date}
        />
        <PlanField
          label="Time"
          onChangeText={setTime}
          placeholder="8:30 PM"
          value={time}
        />
        <PlanField
          label="Location"
          onChangeText={setLocation}
          placeholder="Bandra West"
          value={location}
        />
        <PlanField
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

        {/* Remind toggle */}
        <Pressable
          className="mt-7 flex-row items-center justify-between"
          onPress={() => setRemindBoth((current) => !current)}
        >
          <Text className="text-[17px] text-foreground">Remind both of us</Text>
          <View
            className={cn(
              "h-8 w-14 justify-center rounded-full p-1",
              remindBoth ? "items-end bg-primary" : "items-start bg-muted",
            )}
          >
            <View className="h-6 w-6 rounded-full bg-foreground" />
          </View>
        </Pressable>
      </ScrollView>

      <View className="px-4 pb-3 pt-2">
        <PrimaryAction label="Add to our plans" onPress={() => router.back()} />
      </View>
    </AppScreen>
  );
}

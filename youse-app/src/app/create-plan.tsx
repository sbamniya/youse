import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs, { type Dayjs } from "dayjs";
import type { ImagePickerAsset } from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { Camera } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, View } from "react-native";

import { AppScreen } from "@/components/app/app-screen";
import { BackButton } from "@/components/app/back-button";
import { DatePickerField } from "@/components/app/date-picker";
import { FormField } from "@/components/app/form-field";
import { ImageSourcePicker } from "@/components/app/image-source-picker";
import { PageIntro } from "@/components/app/page-intro";
import { PrimaryAction } from "@/components/app/primary-action";
import { ThemedIcon } from "@/components/app/themed-icon";
import { ToggleRow } from "@/components/app/toggle-row";
import { Text } from "@/components/ui/text";
import { getImageUrl } from "@/lib/image-url";
import { uploadImage } from "@/lib/image-upload";
import {
  createPlan,
  planQueryOptions,
  plansQueryKey,
  updatePlan,
} from "@/lib/plans-api";
import { cn } from "@/lib/utils";

const CATEGORIES = ["Dinner", "Trip", "Occasion"] as const;
const TIME_PATTERN = /^(0?[1-9]|1[0-2]):([0-5]\d)\s*(AM|PM)$/i;

function toPlanDateTime(date: Dayjs, time: string): string | null {
  const match = time.trim().match(TIME_PATTERN);
  if (!match) return null;

  const [, hourString, minuteString, meridiem] = match;
  let hour = Number(hourString);
  if (meridiem.toUpperCase() === "PM" && hour !== 12) hour += 12;
  if (meridiem.toUpperCase() === "AM" && hour === 12) hour = 0;

  return new Date(
    date.year(),
    date.month(),
    date.date(),
    hour,
    Number(minuteString),
  ).toISOString();
}

export default function CreatePlan() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = Boolean(id);
  const queryClient = useQueryClient();
  const [title, setTitle] = useState<string | null>(null);
  const [date, setDate] = useState<Dayjs | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [notes, setNotes] = useState<string | null>(null);
  const [category, setCategory] = useState<(typeof CATEGORIES)[number] | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageAsset, setImageAsset] = useState<ImagePickerAsset | null>(null);
  const [reminderEnabled, setReminderEnabled] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const {
    data: existingPlan,
    isError: isPlanError,
    isPending: isPlanPending,
    refetch,
  } = useQuery({
    ...planQueryOptions(id ?? ""),
    enabled: isEditing,
  });

  const displayedTitle = title ?? existingPlan?.title ?? "";
  const displayedDate = date ?? (existingPlan ? dayjs(existingPlan.dateTime) : dayjs());
  const displayedTime = time ?? (existingPlan ? dayjs(existingPlan.dateTime).format("h:mm A") : "7:00 PM");
  const displayedLocation = location ?? existingPlan?.location ?? "";
  const displayedNotes = notes ?? existingPlan?.note ?? "";
  const displayedCategory = category ?? (CATEGORIES.includes(existingPlan?.type as (typeof CATEGORIES)[number]) ? existingPlan?.type as (typeof CATEGORIES)[number] : "Dinner");
  const displayedImageUri = imageUri ?? getImageUrl(existingPlan?.image);
  const displayedReminderEnabled = reminderEnabled ?? (existingPlan ? existingPlan.remindAt !== null : true);
  const planDateTime = toPlanDateTime(displayedDate, displayedTime);
  const canSave = Boolean(displayedTitle.trim() && planDateTime);

  const savePlanMutation = useMutation({
    mutationFn: async () => {
      if (!planDateTime) throw new Error("Enter a valid time");
      const imagePath = imageAsset ? (await uploadImage(imageAsset)).path : undefined;
      const details = {
        title: displayedTitle.trim(),
        type: displayedCategory,
        dateTime: planDateTime,
        location: displayedLocation.trim() || null,
        note: displayedNotes.trim() || null,
        remindAt: displayedReminderEnabled
          ? dayjs(planDateTime).subtract(1, "hour").toISOString()
          : null,
      };

      if (id) {
        return updatePlan(id, imagePath === undefined ? details : { ...details, imagePath });
      }

      return createPlan({ ...details, imagePath: imagePath ?? null });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: plansQueryKey });
      router.back();
    },
    onError: () => {
      setError(
        `We couldn't ${isEditing ? "update" : "create"} this plan. Check your connection and try again.`,
      );
    },
  });

  const handleSave = () => {
    if (!canSave || savePlanMutation.isPending) return;
    setError("");
    savePlanMutation.mutate();
  };

  if (isEditing && isPlanPending) {
    return (
      <AppScreen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator colorClassName="accent-primary" size="large" />
        </View>
      </AppScreen>
    );
  }

  if (isEditing && (isPlanError || !existingPlan)) {
    return (
      <AppScreen>
        <View className="flex-row px-4 pt-2"><BackButton /></View>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center font-serif text-[18px] text-muted-foreground">We couldn&apos;t load this plan.</Text>
          <PrimaryAction className="mt-7 w-full" label="Try again" onPress={() => void refetch()} />
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <ScrollView
        automaticallyAdjustKeyboardInsets
        className="flex-1 px-4"
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <BackButton className="mt-2" />

        <PageIntro
          className="mt-4"
          description="Good plans bring us closer."
          displayTitle
          eyebrow={isEditing ? "EDIT SHARED PLAN" : "NEW SHARED PLAN"}
          title={isEditing ? "Refine the details." : "Something to look forward to."}
        />

        <FormField
          label="Title"
          onChangeText={(value) => { setTitle(value); setError(""); }}
          placeholder="Dinner at Veronica’s"
          value={displayedTitle}
        />
        <DatePickerField label="Date" onValueChange={setDate} value={displayedDate} />
        <FormField
          label="Time"
          onChangeText={(value) => { setTime(value); setError(""); }}
          placeholder="7:00 PM"
          value={displayedTime}
        />
        <FormField label="Location" onChangeText={setLocation} placeholder="Bandra West" value={displayedLocation} />
        <FormField label="Notes" multiline onChangeText={setNotes} placeholder="Add a note (optional)" value={displayedNotes} />

        <ImageSourcePicker
          aspect={[4, 3]}
          onImageSelected={(uri, asset) => {
            setImageUri(uri);
            setImageAsset(asset);
            setError("");
          }}
          title={displayedImageUri ? "Change plan photo" : "Add a plan photo"}
        >
          {({ onPress }) => (
            <Pressable className="mt-6 flex-row items-center gap-3 active:opacity-70" onPress={onPress}>
              {displayedImageUri ? (
                <Image className="h-11 w-11 rounded-full" resizeMode="cover" source={{ uri: displayedImageUri }} />
              ) : (
                <View className="h-11 w-11 items-center justify-center rounded-full bg-primary/20">
                  <ThemedIcon icon={Camera} size={18} strokeWidth={1.8} />
                </View>
              )}
              <Text className="text-[15px] text-foreground">
                {displayedImageUri ? "Change photo" : "Add a photo"} <Text className="text-muted-foreground">(optional)</Text>
              </Text>
            </Pressable>
          )}
        </ImageSourcePicker>

        <View className="mt-6 flex-row gap-2">
          {CATEGORIES.map((option) => {
            const active = option === displayedCategory;
            return (
              <Pressable
                key={option}
                className={cn("rounded-full border px-3 py-2", active ? "border-primary bg-primary" : "border-border-subtle")}
                onPress={() => setCategory(option)}
              >
                <Text className={cn("text-[13px] font-semibold", active ? "text-primary-foreground" : "text-foreground")}>{option}</Text>
              </Pressable>
            );
          })}
        </View>

        <ToggleRow label="Set a reminder one hour before" onValueChange={setReminderEnabled} value={displayedReminderEnabled} />

        {error || (!TIME_PATTERN.test(displayedTime.trim()) && displayedTime.trim()) ? (
          <Text className="mt-4 font-serif text-[15px] text-destructive">
            {error || "Use a time such as 7:00 PM."}
          </Text>
        ) : null}
      </ScrollView>

      <View className="px-4 pb-3 pt-4">
        <PrimaryAction
          disabled={!canSave || savePlanMutation.isPending}
          label={savePlanMutation.isPending ? "Saving..." : isEditing ? "Save changes" : "Add to our plans"}
          onPress={handleSave}
        />
      </View>
    </AppScreen>
  );
}

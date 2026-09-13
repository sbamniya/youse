import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import type { ImagePickerAsset } from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { ImagePlus, Pencil } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  View,
} from "react-native";

import { AppScreen } from "@/components/app/app-screen";
import { BackButton } from "@/components/app/back-button";
import { DatePickerField } from "@/components/app/date-picker";
import { FormField } from "@/components/app/form-field";
import { ImageSourcePicker } from "@/components/app/image-source-picker";
import { PageIntro } from "@/components/app/page-intro";
import { PrimaryAction } from "@/components/app/primary-action";
import { ThemedIcon } from "@/components/app/themed-icon";
import { Text } from "@/components/ui/text";
import { getImageUrl } from "@/lib/image-url";
import { uploadImage } from "@/lib/image-upload";
import {
  type ApiMemory,
  createMemory,
  memoriesQueryKey,
  memoryQueryKey,
  memoryQueryOptions,
  updateMemory,
} from "@/lib/memory-api";

export default function CreateMemory() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = Boolean(id);
  const queryClient = useQueryClient();
  const [title, setTitle] = useState<string | null>(null);
  const [date, setDate] = useState<dayjs.Dayjs | null>(() =>
    isEditing ? null : dayjs(),
  );
  const [location, setLocation] = useState<string | null>(null);
  const [story, setStory] = useState<string | null>(null);
  const [selectedPhotoUri, setSelectedPhotoUri] = useState<string | null>(null);
  const [photoAsset, setPhotoAsset] = useState<ImagePickerAsset | null>(null);
  const [error, setError] = useState("");
  const {
    data: existingMemory,
    isError: isMemoryError,
    isPending: isMemoryPending,
    refetch,
  } = useQuery({
    ...memoryQueryOptions(id ?? ""),
    enabled: isEditing,
  });
  const displayedTitle = title ?? existingMemory?.title ?? "";
  const displayedDate =
    date ??
    (existingMemory?.memoryDate ? dayjs(existingMemory.memoryDate) : dayjs());
  const displayedLocation = location ?? existingMemory?.location ?? "";
  const displayedStory = story ?? existingMemory?.description ?? "";
  const photoUri =
    selectedPhotoUri ?? getImageUrl(existingMemory?.thumbnail ?? null);
  const canSave =
    Boolean(displayedTitle.trim()) &&
    displayedDate.isValid() &&
    (isEditing || photoAsset !== null);

  const { isPending, mutate: saveMemory } = useMutation({
    mutationFn: async () => {
      const details = {
        title: displayedTitle.trim(),
        description: displayedStory.trim() || null,
        memoryDate: displayedDate.toISOString(),
        location: displayedLocation.trim() || null,
      };

      if (id) {
        return updateMemory(id, details);
      }

      if (!photoAsset) {
        throw new Error("A cover photo is required");
      }

      const { path: thumbnailPath } = await uploadImage(photoAsset);
      return createMemory({ ...details, thumbnailPath });
    },
    onSuccess: (memory) => {
      queryClient.setQueryData<ApiMemory[]>(memoriesQueryKey, (current) =>
        isEditing
          ? current?.map((item) => (item.id === memory.id ? memory : item))
          : current
            ? [memory, ...current]
            : [memory],
      );
      queryClient.setQueryData(memoryQueryKey(memory.id), memory);
      void queryClient.invalidateQueries({ queryKey: memoriesQueryKey });
      router.replace(`/memory/${memory.id}`);
    },
    onError: () => {
      setError(
        `We couldn't ${isEditing ? "update" : "create"} this memory. Check your connection and try again.`,
      );
    },
  });

  const handleSave = () => {
    if (!canSave || isPending) {
      return;
    }

    setError("");
    saveMemory();
  };

  if (isEditing && isMemoryPending) {
    return (
      <AppScreen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator colorClassName="accent-primary" size="large" />
        </View>
      </AppScreen>
    );
  }

  if (isEditing && (isMemoryError || !existingMemory)) {
    return (
      <AppScreen>
        <View className="flex-row px-4 pt-2">
          <BackButton />
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center font-serif text-[18px] text-muted-foreground">
            We couldn&apos;t load this memory.
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

  return (
    <AppScreen>
      <ScrollView
        automaticallyAdjustKeyboardInsets
        className="flex-1 px-4"
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center gap-1 pt-2">
          <BackButton />
          <Text
            className="mb-0 text-[12px] text-muted-foreground"
            style={{ letterSpacing: 5 }}
          >
            {isEditing ? "EDIT MEMORY" : "NEW MEMORY"}
          </Text>
        </View>

        <PageIntro
          displayTitle
          title={isEditing ? "Shape this memory." : "Keep this moment close."}
        />

        {isEditing ? (
          <View className="relative mt-6 h-60 overflow-hidden rounded-3xl border border-border-subtle bg-card">
            {photoUri ? (
              <Image
                accessibilityLabel={`${displayedTitle || "Memory"} cover photo`}
                className="h-full w-full"
                resizeMode="cover"
                source={{ uri: photoUri }}
              />
            ) : (
              <View className="flex-1 items-center justify-center gap-3 px-8">
                <ThemedIcon icon={ImagePlus} size={24} strokeWidth={1.8} />
                <Text className="text-[14px] text-muted-foreground">
                  No cover photo
                </Text>
              </View>
            )}
          </View>
        ) : (
        <ImageSourcePicker
          aspect={[3, 4]}
          onImageSelected={(uri, asset) => {
            setSelectedPhotoUri(uri);
            setPhotoAsset(asset);
            setError("");
          }}
          title={photoUri ? "Change memory photo" : "Add a memory photo"}
        >
          {({ onPress }) => (
            <Pressable
              accessibilityLabel={
                photoUri ? "Change memory photo" : "Choose a memory photo"
              }
              className="relative mt-6 h-60 overflow-hidden rounded-3xl border border-border-subtle bg-card active:opacity-80"
              onPress={onPress}
            >
              {photoUri ? (
                <Image
                  source={{ uri: photoUri }}
                  resizeMode="cover"
                  className="h-full w-full"
                />
              ) : (
                <View className="flex-1 items-center justify-center gap-3 px-8">
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-secondary">
                    <ThemedIcon
                      icon={ImagePlus}
                      size={24}
                      strokeWidth={1.8}
                    />
                  </View>
                  <Text className="text-[17px] font-semibold text-foreground">
                    Choose a photo
                  </Text>
                  <Text className="text-center text-[12px] text-muted-foreground">
                    JPEG, PNG, or WebP · up to 10 MB
                  </Text>
                </View>
              )}
              <View className="absolute bottom-3 right-3 flex-row items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5">
                <ThemedIcon
                  icon={photoUri ? Pencil : ImagePlus}
                  size={14}
                  strokeWidth={1.8}
                />
                <Text className="text-[13px] text-foreground">
                  {photoUri ? "Change photo" : "Choose photo"}
                </Text>
              </View>
            </Pressable>
          )}
        </ImageSourcePicker>
        )}

        <FormField
          label="Title"
          onChangeText={(value) => {
            setTitle(value);
            setError("");
          }}
          placeholder="Give this memory a name"
          value={displayedTitle}
        />
        <DatePickerField
          label="Date"
          onValueChange={setDate}
          value={displayedDate}
        />
        <FormField
          label="Location"
          onChangeText={setLocation}
          placeholder="South Goa"
          value={displayedLocation}
        />
        <FormField
          label="Story"
          multiline
          onChangeText={setStory}
          placeholder="What made this moment special?"
          value={displayedStory}
        />

        <Text className="mt-6 font-serif text-[14px] leading-5 text-muted-foreground">
          Memories are shared with your partner automatically.
        </Text>

        {error ? (
          <Text className="mt-4 font-serif text-[15px] text-destructive">
            {error}
          </Text>
        ) : null}
      </ScrollView>

      <View className="px-4 pb-3 pt-2">
        <PrimaryAction
          disabled={!canSave || isPending}
          label={
            isPending
              ? "Saving..."
              : isEditing
                ? "Update memory"
                : "Save memory"
          }
          onPress={handleSave}
        />
      </View>
    </AppScreen>
  );
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import type { ImagePickerAsset } from "expo-image-picker";
import { router } from "expo-router";
import { ImagePlus, Pencil } from "lucide-react-native";
import { useState } from "react";
import { Image, Pressable, ScrollView, View } from "react-native";

import { AppScreen } from "@/components/app/app-screen";
import { BackButton } from "@/components/app/back-button";
import { DatePickerField } from "@/components/app/date-picker";
import { FormField } from "@/components/app/form-field";
import { ImageSourcePicker } from "@/components/app/image-source-picker";
import { PageIntro } from "@/components/app/page-intro";
import { PrimaryAction } from "@/components/app/primary-action";
import { ThemedIcon } from "@/components/app/themed-icon";
import { Text } from "@/components/ui/text";
import { uploadImage } from "@/lib/image-upload";
import {
  type ApiMemory,
  type CreateMemoryInput,
  createMemory,
  memoriesQueryKey,
} from "@/lib/memory-api";

type CreateMemoryRequest = Omit<
  CreateMemoryInput,
  "imagePaths" | "thumbnailPath"
> & {
  image: ImagePickerAsset;
};

export default function CreateMemory() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(() => dayjs());
  const [location, setLocation] = useState("");
  const [story, setStory] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoAsset, setPhotoAsset] = useState<ImagePickerAsset | null>(null);
  const [error, setError] = useState("");
  const canSave = Boolean(title.trim()) && date.isValid() && photoAsset !== null;

  const { isPending, mutate: saveMemory } = useMutation({
    mutationFn: async ({ image, ...memory }: CreateMemoryRequest) => {
      const { path } = await uploadImage(image);
      return createMemory({
        ...memory,
        thumbnailPath: path,
        imagePaths: [path],
      });
    },
    onSuccess: (memory) => {
      queryClient.setQueryData<ApiMemory[]>(memoriesQueryKey, (current) =>
        current ? [memory, ...current] : [memory],
      );
      void queryClient.invalidateQueries({ queryKey: memoriesQueryKey });
      router.replace(`/memory/${memory.id}`);
    },
    onError: () => {
      setError(
        "We couldn't upload and save this memory. Check your connection and try again.",
      );
    },
  });

  const handleSave = () => {
    if (!canSave || isPending) {
      return;
    }

    setError("");
    saveMemory({
      title: title.trim(),
      description: story.trim() || null,
      memoryDate: date.toISOString(),
      location: location.trim() || null,
      image: photoAsset!,
    });
  };

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
            NEW MEMORY
          </Text>
        </View>

        <PageIntro displayTitle title="Keep this moment close." />

        <ImageSourcePicker
          aspect={[3, 4]}
          onImageSelected={(uri, asset) => {
            setPhotoUri(uri);
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

        <FormField
          label="Title"
          onChangeText={(value) => {
            setTitle(value);
            setError("");
          }}
          placeholder="Give this memory a name"
          value={title}
        />
        <DatePickerField label="Date" onValueChange={setDate} value={date} />
        <FormField
          label="Location"
          onChangeText={setLocation}
          placeholder="South Goa"
          value={location}
        />
        <FormField
          label="Story"
          multiline
          onChangeText={setStory}
          placeholder="What made this moment special?"
          value={story}
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
          label={isPending ? "Saving..." : "Save memory"}
          onPress={handleSave}
        />
      </View>
    </AppScreen>
  );
}

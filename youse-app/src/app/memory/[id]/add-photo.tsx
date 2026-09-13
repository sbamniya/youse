import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ImagePickerAsset } from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { ImagePlus, Pencil } from "lucide-react-native";
import { useState } from "react";
import { Image, Pressable, ScrollView, View } from "react-native";

import { AppScreen } from "@/components/app/app-screen";
import { BackButton } from "@/components/app/back-button";
import { FormField } from "@/components/app/form-field";
import { ImageSourcePicker } from "@/components/app/image-source-picker";
import { PrimaryAction } from "@/components/app/primary-action";
import { ThemedIcon } from "@/components/app/themed-icon";
import { Text } from "@/components/ui/text";
import { uploadImage } from "@/lib/image-upload";
import {
  type ApiMemory,
  addMemoryPhoto,
  memoriesQueryKey,
  memoryQueryKey,
  memoryQueryOptions,
} from "@/lib/memory-api";

export default function AddPhoto() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { data: memory } = useQuery({
    ...memoryQueryOptions(id ?? ""),
    enabled: Boolean(id),
  });
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageAsset, setImageAsset] = useState<ImagePickerAsset | null>(null);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState("");

  const { isPending, mutate: savePhoto } = useMutation({
    mutationFn: async ({
      asset,
      photoCaption,
      memoryId,
    }: {
      asset: ImagePickerAsset;
      photoCaption: string | null;
      memoryId: string;
    }) => {
      const { path } = await uploadImage(asset);
      return addMemoryPhoto(memoryId, {
        imagePath: path,
        caption: photoCaption,
      });
    },
    onSuccess: (photo) => {
      if (!id) return;

      queryClient.setQueryData<ApiMemory>(memoryQueryKey(id), (current) =>
        current
          ? {
              ...current,
              partnerMemoryItems: [...current.partnerMemoryItems, photo],
            }
          : current,
      );
      queryClient.setQueryData<ApiMemory[]>(memoriesQueryKey, (current) =>
        current?.map((item) =>
          item.id === id
            ? {
                ...item,
                partnerMemoryItems: [...item.partnerMemoryItems, photo],
              }
            : item,
        ),
      );
      void queryClient.invalidateQueries({ queryKey: memoriesQueryKey });
      router.replace(`/memory/${id}`);
    },
    onError: () => {
      setError(
        "We couldn't upload this photo. Check your connection and try again.",
      );
    },
  });

  const handleSave = () => {
    if (!id || !imageAsset || isPending) return;
    setError("");
    savePhoto({
      asset: imageAsset,
      memoryId: id,
      photoCaption: caption.trim() || null,
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
        <View className="flex-row items-center gap-2 pt-2">
          <BackButton />
          <Text className="text-[12px] text-muted-foreground" style={{ letterSpacing: 4 }}>
            ADD PHOTO
          </Text>
        </View>

        <Text className="mt-8 text-[30px] font-bold leading-9 text-foreground">
          Add to {memory?.title ?? "this memory"}.
        </Text>
        <Text className="mt-2 text-[15px] leading-5 text-muted-foreground">
          A photo is all that’s needed. A caption can come later—or not at all.
        </Text>

        <ImageSourcePicker
          aspect={[3, 4]}
          onImageSelected={(uri, asset) => {
            setImageUri(uri);
            setImageAsset(asset);
            setError("");
          }}
          title="Add a photo"
        >
          {({ onPress }) => (
            <Pressable
              accessibilityLabel={imageUri ? "Change selected photo" : "Choose a photo"}
              className="relative mt-7 h-72 overflow-hidden rounded-3xl border border-border-subtle bg-card active:opacity-80"
              onPress={onPress}
            >
              {imageUri ? (
                <Image className="h-full w-full" resizeMode="cover" source={{ uri: imageUri }} />
              ) : (
                <View className="flex-1 items-center justify-center gap-3 px-8">
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-secondary">
                    <ThemedIcon icon={ImagePlus} size={24} strokeWidth={1.8} />
                  </View>
                  <Text className="text-[17px] font-semibold text-foreground">Choose a photo</Text>
                </View>
              )}
              <View className="absolute bottom-3 right-3 flex-row items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5">
                <ThemedIcon icon={imageUri ? Pencil : ImagePlus} size={14} strokeWidth={1.8} />
                <Text className="text-[13px] text-foreground">{imageUri ? "Change photo" : "Choose photo"}</Text>
              </View>
            </Pressable>
          )}
        </ImageSourcePicker>

        <FormField
          label="Caption (optional)"
          onChangeText={setCaption}
          placeholder="A few words, if you want them"
          value={caption}
        />

        {error ? (
          <Text className="mt-4 font-serif text-[15px] text-destructive">
            {error}
          </Text>
        ) : null}
      </ScrollView>

      <View className="px-4 pb-3 pt-2">
        <PrimaryAction
          disabled={!imageAsset || isPending}
          label={isPending ? "Adding..." : "Add to gallery"}
          onPress={handleSave}
        />
      </View>
    </AppScreen>
  );
}

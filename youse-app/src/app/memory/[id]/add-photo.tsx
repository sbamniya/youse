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
import { useMemories } from "@/lib/memory-store";

export default function AddPhoto() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addPhoto, memories } = useMemories();
  const memory = memories.find((item) => item.id === id);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [caption, setCaption] = useState("");

  const savePhoto = () => {
    if (!id || !imageUri) return;
    addPhoto(id, imageUri, caption);
    router.replace(`/memory/${id}`);
  };

  return (
    <AppScreen>
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
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

        <ImageSourcePicker aspect={[3, 4]} onImageSelected={setImageUri} title="Add a photo">
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
      </ScrollView>

      <View className="px-4 pb-3 pt-2">
        <PrimaryAction disabled={!imageUri} label="Add to gallery" onPress={savePhoto} />
      </View>
    </AppScreen>
  );
}

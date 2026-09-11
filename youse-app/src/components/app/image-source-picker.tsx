import * as ExpoImagePicker from "expo-image-picker";
import { Camera, Image as ImageIcon, X } from "lucide-react-native";
import { type ReactElement, useState } from "react";
import { Alert, Platform } from "react-native";

import { ThemedIcon } from "@/components/app/themed-icon";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Text } from "@/components/ui/text";

type ImageSourcePickerProps = {
  aspect?: [number, number];
  children: (props: { onPress: () => void }) => ReactElement;
  onImageSelected: (uri: string) => void;
  title?: string;
};

function ImageSourcePicker({
  aspect,
  children,
  onImageSelected,
  title = "Add a photo",
}: ImageSourcePickerProps) {
  const [open, setOpen] = useState(false);

  const selectImage = async (source: "camera" | "library") => {
    setOpen(false);

    if (Platform.OS !== "web") {
      const permission = source === "camera"
        ? await ExpoImagePicker.requestCameraPermissionsAsync()
        : await ExpoImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Photo access needed",
          source === "camera"
            ? "Allow camera access to capture a photo."
            : "Allow photo library access to choose a photo.",
        );
        return;
      }
    }

    const result = source === "camera"
      ? await ExpoImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect,
          mediaTypes: ["images"],
          quality: 1,
        })
      : await ExpoImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          aspect,
          mediaTypes: ["images"],
          quality: 1,
        });

    if (!result.canceled) {
      onImageSelected(result.assets[0].uri);
    }
  };

  return (
    <AlertDialog onOpenChange={setOpen} open={open}>
      <AlertDialogTrigger asChild>
        {children({ onPress: () => setOpen(true) })}
      </AlertDialogTrigger>
      <AlertDialogContent className="mx-4 self-stretch rounded-3xl border-border-subtle bg-card p-5 web:mx-0">
        <AlertDialogHeader className="relative pr-12">
          <AlertDialogTitle className="text-left text-[22px] text-foreground">{title}</AlertDialogTitle>
          <AlertDialogCancel
            accessibilityLabel="Close photo options"
            className="absolute -right-1 -top-1 h-10 w-10 items-center justify-center rounded-full border-0 bg-transparent p-0 active:bg-muted"
          >
            <ThemedIcon icon={X} size={19} strokeWidth={2} />
          </AlertDialogCancel>
        </AlertDialogHeader>

        <Text className="-mt-2 text-[15px] text-muted-foreground">Choose where your photo comes from.</Text>

        <AlertDialogAction
          className="mt-2 h-14 justify-start rounded-2xl bg-primary px-4"
          onPress={() => void selectImage("camera")}
        >
          <ThemedIcon icon={Camera} size={20} strokeWidth={1.8} tone="primaryForeground" />
          <Text className="text-[16px] font-semibold text-primary-foreground">Take a photo</Text>
        </AlertDialogAction>
        <AlertDialogAction
          className="h-14 justify-start rounded-2xl border border-border-subtle bg-transparent px-4"
          onPress={() => void selectImage("library")}
        >
          <ThemedIcon icon={ImageIcon} size={20} strokeWidth={1.8} />
          <Text className="text-[16px] font-semibold text-foreground">Choose from library</Text>
        </AlertDialogAction>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { ImageSourcePicker };
export type { ImageSourcePickerProps };

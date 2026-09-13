import type { ImagePickerAsset } from "expo-image-picker";
import { Platform } from "react-native";

import api from "./api";

type ImageUploadResponse = {
  path: string;
};

export async function uploadImage(
  asset: ImagePickerAsset,
): Promise<ImageUploadResponse> {
  const formData = new FormData();

  if (Platform.OS === "web" && asset.file) {
    formData.append("image", asset.file);
  } else {
    const extension = asset.fileName?.split(".").pop()?.toLowerCase();
    const mimeType =
      asset.mimeType ??
      (extension === "png"
        ? "image/png"
        : extension === "webp"
          ? "image/webp"
          : "image/jpeg");

    formData.append("image", {
      name: asset.fileName ?? `image.${extension ?? "jpg"}`,
      type: mimeType,
      uri: asset.uri,
    } as unknown as Blob);
  }

  return api.postForm<ImageUploadResponse>("/uploads/images", formData);
}

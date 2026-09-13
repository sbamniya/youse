const IMAGE_BASE_URL = (
  process.env.EXPO_PUBLIC_IMAGE_BASE_URL ??
  "https://pub-eb3448cb23134f8c84763b8642729983.r2.dev"
).replace(/\/+$/, "");

export function getImageUrl(image: string | null | undefined): string | null {
  if (!image) {
    return null;
  }

  if (image.startsWith("https://")) {
    return image;
  }

  return `${IMAGE_BASE_URL}/${image.replace(/^\/+/, "")}`;
}

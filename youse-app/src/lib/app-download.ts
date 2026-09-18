const APP_STORE_URL =
  process.env.EXPO_PUBLIC_APP_STORE_URL ??
  "https://apps.apple.com/us/search?term=Youse";

const PLAY_STORE_URL =
  process.env.EXPO_PUBLIC_PLAY_STORE_URL ??
  "https://play.google.com/store/apps/details?id=com.youse.app";

const getAppInviteUrl = (code: string) =>
  `youse://invite/${encodeURIComponent(code.trim())}`;

export { APP_STORE_URL, PLAY_STORE_URL, getAppInviteUrl };

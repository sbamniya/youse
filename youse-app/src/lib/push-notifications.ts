import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import api from "./api";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerPushNotifications() {
  if (Platform.OS === "web" || !Device.isDevice) return null;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      importance: Notifications.AndroidImportance.DEFAULT,
      name: "Default",
    });
  }

  const existingPermissions = await Notifications.getPermissionsAsync();
  const permissions =
    existingPermissions.status === "granted"
      ? existingPermissions
      : await Notifications.requestPermissionsAsync();
  if (permissions.status !== "granted") return null;

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) return null;

  const token = (
    await Notifications.getExpoPushTokenAsync({ projectId })
  ).data;
  const platform = Platform.OS === "ios" ? "ios" : "android";
  await api.put<{ id: string }, { platform: "ios" | "android"; token: string }>(
    "/auth/push-token",
    { token, platform },
  );

  return token;
}

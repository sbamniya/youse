import { prisma } from "./prisma";

type PushPayload = {
  body: string;
  data?: Record<string, string>;
  title: string;
};

type ExpoPushReceipt = {
  details?: { error?: string };
  status: "ok" | "error";
};

const expoPushEndpoint = "https://exp.host/--/api/v2/push/send";

export async function sendPushNotification(
  userId: string,
  payload: PushPayload,
) {
  const pushTokens = await prisma.pushToken.findMany({
    where: { userId },
    select: { id: true, token: true },
  });
  if (!pushTokens.length) return;

  try {
    const response = await fetch(expoPushEndpoint, {
      body: JSON.stringify(
        pushTokens.map(({ token }) => ({
          to: token,
          sound: "default",
          title: payload.title,
          body: payload.body,
          data: payload.data,
        })),
      ),
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    if (!response.ok) {
      console.warn("Expo push notification request failed", response.status);
      return;
    }

    const result = (await response.json()) as { data?: ExpoPushReceipt[] };
    const invalidTokenIds = (result.data ?? [])
      .map((receipt, index) =>
        receipt.status === "error" &&
        receipt.details?.error === "DeviceNotRegistered"
          ? pushTokens[index]?.id
          : undefined,
      )
      .filter((id): id is string => Boolean(id));
    if (invalidTokenIds.length) {
      await prisma.pushToken.deleteMany({ where: { id: { in: invalidTokenIds } } });
    }
  } catch (error) {
    console.warn("Unable to send Expo push notification", error);
  }
}

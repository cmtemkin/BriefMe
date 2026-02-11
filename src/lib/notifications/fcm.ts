/**
 * Firebase Cloud Messaging integration.
 * Sends push notifications for morning digest.
 */

interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

export async function sendPushNotification(
  fcmToken: string,
  payload: PushPayload,
): Promise<boolean> {
  const serverKey = process.env.FIREBASE_SERVER_KEY;

  if (!serverKey) {
    console.warn("FIREBASE_SERVER_KEY not configured, skipping push");
    return false;
  }

  try {
    const response = await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        Authorization: `key=${serverKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: fcmToken,
        notification: {
          title: payload.title,
          body: payload.body,
          click_action: payload.url || "/dashboard",
          icon: "/icons/icon-192x192.png",
        },
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("FCM error:", error);
    return false;
  }
}

/**
 * Server-side analytics via PostHog Node SDK (HTTP API).
 * Fires events from API routes without requiring the client SDK.
 */

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST;

export async function trackServerEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>,
): Promise<void> {
  if (!POSTHOG_KEY || !POSTHOG_HOST) return;

  try {
    await fetch(`${POSTHOG_HOST}/capture/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: POSTHOG_KEY,
        event,
        distinct_id: distinctId,
        properties: {
          ...properties,
          $lib: "briefme-server",
        },
        timestamp: new Date().toISOString(),
      }),
    });
  } catch {
    // Analytics should never block the request
  }
}

/**
 * Determines which users need digests in the current time window.
 * Called by the cron job every 15 minutes.
 */

export interface ScheduledUser {
  userId: string;
  email: string;
  firstName: string | null;
  timezone: string;
  wakeTime: string;
  enabledModules: string[];
  moduleConfigs: Record<string, Record<string, unknown>>;
  deliveryChannels: {
    web: boolean;
    email: boolean;
    push: boolean;
  };
}

export function isInCurrentWindow(wakeTime: string, timezone: string): boolean {
  const now = new Date();

  // Get current time in user's timezone
  const userNow = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
  const currentMinutes = userNow.getHours() * 60 + userNow.getMinutes();

  // Parse wake time (format: "HH:MM" or "H:MM AM/PM")
  let wakeMinutes: number;
  if (wakeTime.includes("AM") || wakeTime.includes("PM")) {
    const [timePart, period] = wakeTime.split(" ");
    const [hours, minutes] = timePart.split(":").map(Number);
    let h = hours;
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    wakeMinutes = h * 60 + minutes;
  } else {
    const [hours, minutes] = wakeTime.split(":").map(Number);
    wakeMinutes = hours * 60 + minutes;
  }

  // Check if current time is within the 15-minute window
  const diff = currentMinutes - wakeMinutes;
  return diff >= 0 && diff < 15;
}

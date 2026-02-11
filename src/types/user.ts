export interface UserProfile {
  id: string;
  clerkId: string;
  email: string;
  firstName: string | null;
  timezone: string;
  wakeTime: string;
  address: string | null;
  latitude: string | null;
  longitude: string | null;
  onboardingCompleted: boolean;
  subscriptionTier: "free" | "pro" | "business";
  subscriptionStatus: "active" | "canceled" | "past_due" | "trialing" | null;
}

export interface DeliveryPrefs {
  webEnabled: boolean;
  emailEnabled: boolean;
  pushEnabled: boolean;
  emailAddress: string | null;
  deliveryTimes: Array<{ time: string; timezone: string }>;
}

export interface UserModule {
  moduleId: string;
  enabled: boolean;
  position: number;
  config: Record<string, unknown>;
}

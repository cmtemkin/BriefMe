/**
 * Analytics event taxonomy for BriefMe.
 * All events tracked via PostHog.
 */

export const EVENTS = {
  // Auth
  USER_SIGNED_UP: "user_signed_up",
  USER_SIGNED_IN: "user_signed_in",

  // Onboarding
  ONBOARDING_STEP_COMPLETED: "onboarding_step_completed",
  ONBOARDING_COMPLETED: "onboarding_completed",

  // Dashboard
  DIGEST_VIEWED: "digest_viewed",
  WIDGET_CLICKED: "widget_clicked",

  // Configuration
  WIDGET_CONFIGURED: "widget_configured",
  MODULE_ENABLED: "module_enabled",
  MODULE_DISABLED: "module_disabled",
  MODULES_REORDERED: "modules_reordered",

  // OAuth
  OAUTH_CONNECTED: "oauth_connected",
  OAUTH_DISCONNECTED: "oauth_disconnected",

  // Delivery
  DELIVERY_CHANNEL_TOGGLED: "delivery_channel_toggled",
  WAKE_TIME_CHANGED: "wake_time_changed",

  // Email
  EMAIL_OPENED: "email_opened",
  EMAIL_CLICKED: "email_clicked",

  // Monetization
  UPGRADE_CLICKED: "upgrade_clicked",
  SUBSCRIPTION_STARTED: "subscription_started",
  SUBSCRIPTION_CANCELED: "subscription_canceled",

  // Engagement
  STREAK_MILESTONE: "streak_milestone",
} as const;

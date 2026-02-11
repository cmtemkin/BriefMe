import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  time,
  timestamp,
  uuid,
  date,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const subscriptionTierEnum = pgEnum("subscription_tier", [
  "free",
  "pro",
  "business",
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "canceled",
  "past_due",
  "trialing",
]);

export const deliveryChannelEnum = pgEnum("delivery_channel", [
  "web",
  "email",
  "push",
]);

// ─── Users ──────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull(),
  firstName: text("first_name"),
  timezone: text("timezone").default("America/New_York").notNull(),
  wakeTime: time("wake_time").default("06:30").notNull(),
  address: text("address"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  subscriptionTier: subscriptionTierEnum("subscription_tier")
    .default("free")
    .notNull(),
  subscriptionStatus: subscriptionStatusEnum("subscription_status"),
});

// ─── User Modules ───────────────────────────────────────────────────────────

export const userModules = pgTable(
  "user_modules",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    moduleId: text("module_id").notNull(),
    enabled: boolean("enabled").default(true).notNull(),
    position: integer("position").notNull(),
    config: jsonb("config").default({}).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("user_module_unique").on(table.userId, table.moduleId),
  ],
);

// ─── OAuth Tokens ───────────────────────────────────────────────────────────

export const oauthTokens = pgTable(
  "oauth_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    accessToken: text("access_token").notNull(),
    refreshToken: text("refresh_token"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    scopes: text("scopes").array(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("oauth_provider_unique").on(table.userId, table.provider),
  ],
);

// ─── Delivery Preferences ───────────────────────────────────────────────────

export const deliveryPreferences = pgTable("delivery_preferences", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  webEnabled: boolean("web_enabled").default(true).notNull(),
  emailEnabled: boolean("email_enabled").default(false).notNull(),
  pushEnabled: boolean("push_enabled").default(false).notNull(),
  emailAddress: text("email_address"),
  fcmToken: text("fcm_token"),
  deliveryTimes: jsonb("delivery_times")
    .default([{ time: "06:30", timezone: "America/New_York" }])
    .notNull(),
});

// ─── Digest Logs ────────────────────────────────────────────────────────────

export const digestLogs = pgTable("digest_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  deliveredAt: timestamp("delivered_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  channel: deliveryChannelEnum("channel").notNull(),
  modulesIncluded: text("modules_included").array().notNull(),
  emailOpened: boolean("email_opened").default(false).notNull(),
  emailClicked: boolean("email_clicked").default(false).notNull(),
  subjectLine: text("subject_line"),
});

// ─── Streaks ────────────────────────────────────────────────────────────────

export const streaks = pgTable("streaks", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  currentStreak: integer("current_streak").default(0).notNull(),
  longestStreak: integer("longest_streak").default(0).notNull(),
  lastActiveDate: date("last_active_date"),
  totalDigestsViewed: integer("total_digests_viewed").default(0).notNull(),
});

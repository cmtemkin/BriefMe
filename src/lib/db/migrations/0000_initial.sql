-- BriefMe Initial Migration
-- Generated from src/lib/db/schema.ts

-- Enums
DO $$ BEGIN
  CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'business');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE delivery_channel AS ENUM ('web', 'email', 'push');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Users
CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "clerk_id" text NOT NULL UNIQUE,
  "email" text NOT NULL,
  "first_name" text,
  "timezone" text NOT NULL DEFAULT 'America/New_York',
  "wake_time" time NOT NULL DEFAULT '06:30',
  "address" text,
  "latitude" text,
  "longitude" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "onboarding_completed" boolean NOT NULL DEFAULT false,
  "stripe_customer_id" text,
  "subscription_tier" subscription_tier NOT NULL DEFAULT 'free',
  "subscription_status" subscription_status
);

-- User Modules
CREATE TABLE IF NOT EXISTS "user_modules" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "module_id" text NOT NULL,
  "enabled" boolean NOT NULL DEFAULT true,
  "position" integer NOT NULL,
  "config" jsonb NOT NULL DEFAULT '{}',
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_module_unique"
  ON "user_modules" ("user_id", "module_id");

-- OAuth Tokens
CREATE TABLE IF NOT EXISTS "oauth_tokens" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "provider" text NOT NULL,
  "access_token" text NOT NULL,
  "refresh_token" text,
  "expires_at" timestamptz,
  "scopes" text[],
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "oauth_provider_unique"
  ON "oauth_tokens" ("user_id", "provider");

-- Delivery Preferences
CREATE TABLE IF NOT EXISTS "delivery_preferences" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
  "web_enabled" boolean NOT NULL DEFAULT true,
  "email_enabled" boolean NOT NULL DEFAULT false,
  "push_enabled" boolean NOT NULL DEFAULT false,
  "email_address" text,
  "fcm_token" text,
  "delivery_times" jsonb NOT NULL DEFAULT '[{"time":"06:30","timezone":"America/New_York"}]'
);

-- Digest Logs
CREATE TABLE IF NOT EXISTS "digest_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "delivered_at" timestamptz NOT NULL DEFAULT now(),
  "channel" delivery_channel NOT NULL,
  "modules_included" text[] NOT NULL,
  "email_opened" boolean NOT NULL DEFAULT false,
  "email_clicked" boolean NOT NULL DEFAULT false,
  "subject_line" text
);

-- Streaks
CREATE TABLE IF NOT EXISTS "streaks" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
  "current_streak" integer NOT NULL DEFAULT 0,
  "longest_streak" integer NOT NULL DEFAULT 0,
  "last_active_date" date,
  "total_digests_viewed" integer NOT NULL DEFAULT 0
);

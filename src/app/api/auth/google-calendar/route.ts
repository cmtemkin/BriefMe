import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { upsertToken } from "@/lib/auth/oauth-tokens";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/calendar.events.readonly",
];

function getRedirectUri() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3003";
  return `${appUrl}/api/auth/google-calendar`;
}

// GET: Handle both redirect initiation and OAuth callback
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "Google OAuth not configured" },
      { status: 500 },
    );
  }

  // If no code, redirect user to Google consent screen
  if (!code) {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: getRedirectUri(),
      response_type: "code",
      scope: SCOPES.join(" "),
      access_type: "offline",
      prompt: "consent",
    });

    return NextResponse.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`);
  }

  // Exchange code for tokens
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || ""}/sign-in`,
    );
  }

  try {
    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: getRedirectUri(),
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const error = await tokenRes.text();
      console.error("Google token exchange failed:", error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || ""}/settings?error=google_auth_failed`,
      );
    }

    const tokens = await tokenRes.json();

    // Look up internal user ID from Clerk ID
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    if (!user) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || ""}/settings?error=user_not_found`,
      );
    }

    // Store tokens
    await upsertToken(user.id, "google_calendar", {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
      scopes: SCOPES,
    });

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || ""}/settings?connected=google`,
    );
  } catch (error) {
    console.error("Google OAuth error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || ""}/settings?error=google_auth_failed`,
    );
  }
}

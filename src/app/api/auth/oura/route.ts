import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { upsertToken } from "@/lib/auth/oauth-tokens";

const OURA_AUTH_URL = "https://cloud.ouraring.com/oauth/authorize";
const OURA_TOKEN_URL = "https://api.ouraring.com/oauth/token";
const SCOPES = "daily";

function getRedirectUri() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3003";
  return `${appUrl}/api/auth/oura`;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  const clientId = process.env.OURA_CLIENT_ID;
  const clientSecret = process.env.OURA_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "Oura OAuth not configured" },
      { status: 500 },
    );
  }

  // Redirect to Oura consent screen
  if (!code) {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: getRedirectUri(),
      response_type: "code",
      scope: SCOPES,
    });

    return NextResponse.redirect(`${OURA_AUTH_URL}?${params.toString()}`);
  }

  // Exchange code for tokens
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || ""}/sign-in`,
    );
  }

  try {
    const tokenRes = await fetch(OURA_TOKEN_URL, {
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
      console.error("Oura token exchange failed:", error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || ""}/settings?error=oura_auth_failed`,
      );
    }

    const tokens = await tokenRes.json();

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

    await upsertToken(user.id, "oura", {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: tokens.expires_in
        ? new Date(Date.now() + tokens.expires_in * 1000)
        : undefined,
      scopes: [SCOPES],
    });

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || ""}/settings?connected=oura`,
    );
  } catch (error) {
    console.error("Oura OAuth error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || ""}/settings?error=oura_auth_failed`,
    );
  }
}

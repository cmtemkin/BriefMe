import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { oauthTokens } from "@/lib/db/schema";

type Provider = "google_calendar" | "outlook" | "oura" | "terra";

interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  scopes?: string[];
}

export async function getToken(
  userId: string,
  provider: Provider,
): Promise<TokenData | null> {
  const [token] = await db
    .select()
    .from(oauthTokens)
    .where(
      and(eq(oauthTokens.userId, userId), eq(oauthTokens.provider, provider)),
    )
    .limit(1);

  if (!token) return null;

  return {
    accessToken: token.accessToken,
    refreshToken: token.refreshToken ?? undefined,
    expiresAt: token.expiresAt ?? undefined,
    scopes: token.scopes ?? undefined,
  };
}

export async function upsertToken(
  userId: string,
  provider: Provider,
  tokenData: TokenData,
): Promise<void> {
  await db
    .insert(oauthTokens)
    .values({
      userId,
      provider,
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken ?? null,
      expiresAt: tokenData.expiresAt ?? null,
      scopes: tokenData.scopes ?? null,
    })
    .onConflictDoUpdate({
      target: [oauthTokens.userId, oauthTokens.provider],
      set: {
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken ?? null,
        expiresAt: tokenData.expiresAt ?? null,
        scopes: tokenData.scopes ?? null,
        updatedAt: new Date(),
      },
    });
}

export async function deleteToken(
  userId: string,
  provider: Provider,
): Promise<void> {
  await db
    .delete(oauthTokens)
    .where(
      and(eq(oauthTokens.userId, userId), eq(oauthTokens.provider, provider)),
    );
}

export function isTokenExpired(expiresAt?: Date): boolean {
  if (!expiresAt) return false;
  // Consider expired 5 minutes before actual expiry
  return new Date() > new Date(expiresAt.getTime() - 5 * 60 * 1000);
}

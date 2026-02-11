import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function middleware(req: NextRequest) {
  // When Clerk is not configured, allow all routes (dev/demo mode)
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return NextResponse.next();
  }

  // Dynamically import Clerk only when key is present
  const { clerkMiddleware, createRouteMatcher } =
    await import("@clerk/nextjs/server");

  const isProtectedRoute = createRouteMatcher([
    "/dashboard(.*)",
    "/settings(.*)",
    "/onboarding(.*)",
    "/api/widgets(.*)",
    "/api/user(.*)",
  ]);

  const isPublicRoute = createRouteMatcher([
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/auth(.*)",
    "/api/webhooks(.*)",
    "/api/cron(.*)",
    "/api/stripe(.*)",
    "/changelog(.*)",
    "/guide(.*)",
    "/today(.*)",
    "/weather(.*)",
    "/vs(.*)",
    "/templates(.*)",
  ]);

  const handler = clerkMiddleware(async (auth, request) => {
    if (isProtectedRoute(request) && !isPublicRoute(request)) {
      await auth.protect();
    }
  });

  return handler(req, {} as never);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};

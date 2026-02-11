import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SignUpPage() {
  const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!hasClerkKey) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <h1 className="text-2xl font-bold">Sign Up</h1>
          <p className="text-muted-foreground text-sm">
            Authentication is not configured yet. Set up Clerk by adding your{" "}
            <code className="bg-muted rounded px-1 text-xs">
              NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
            </code>{" "}
            to <code className="bg-muted rounded px-1 text-xs">.env.local</code>{" "}
            to enable sign-up.
          </p>
          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link href="/onboarding">Try the onboarding demo</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">View the dashboard demo</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/">Back to home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <SignUp />;
}

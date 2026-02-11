import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  CloudSun,
  Calendar,
  Newspaper,
  Heart,
  Gamepad2,
  BookOpen,
  ArrowRight,
  Mail,
  Bell,
  Smartphone,
} from "lucide-react";

const FEATURES = [
  {
    icon: CloudSun,
    name: "Weather",
    description: "Local forecast based on your address",
  },
  {
    icon: Calendar,
    name: "Calendar",
    description: "Google & Outlook merged in one view",
  },
  {
    icon: Newspaper,
    name: "News",
    description: "Curated headlines from top sources",
  },
  { icon: Heart, name: "Health", description: "Oura Ring & Apple Health data" },
  {
    icon: Gamepad2,
    name: "Games",
    description: "NYT Wordle, Connections, and more",
  },
  { icon: BookOpen, name: "History", description: "What happened on this day" },
];

const STEPS = [
  {
    step: "1",
    title: "Sign up in one click",
    description: "Google One-Tap, Apple, or passkey — no passwords",
  },
  {
    step: "2",
    title: "Pick your modules",
    description: "Choose what matters to your morning in under 90 seconds",
  },
  {
    step: "3",
    title: "Wake up to your briefing",
    description: "Dashboard, email, or push — delivered when you wake up",
  },
];

export default function HomePage() {
  return (
    <div className="bg-background min-h-screen">
      {/* Navigation */}
      <nav className="mx-auto flex max-w-5xl items-center justify-between p-4">
        <span className="text-xl font-bold">BriefMe</span>
        <div className="flex items-center gap-4">
          <Link
            href="/changelog"
            className="text-muted-foreground hover:text-foreground hidden text-sm sm:inline"
          >
            Changelog
          </Link>
          <Link
            href="/guide"
            className="text-muted-foreground hover:text-foreground hidden text-sm sm:inline"
          >
            Guide
          </Link>
          <Button asChild size="sm">
            <Link href="/sign-up">Get Started</Link>
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 py-20 text-center">
        <h1 className="text-4xl leading-tight font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Your morning,
          <br />
          <span className="text-primary">personally curated</span>
        </h1>
        <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-lg">
          Replace 6-8 morning apps with one beautiful dashboard. Weather,
          calendar, news, health, games, and fun facts — delivered your way.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href="/sign-up">
              Start your first briefing
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/dashboard">See a demo</Link>
          </Button>
        </div>

        <div className="text-muted-foreground mt-6 flex items-center justify-center gap-6 text-xs">
          <span className="flex items-center gap-1">
            <Smartphone className="h-3 w-3" /> PWA ready
          </span>
          <span className="flex items-center gap-1">
            <Mail className="h-3 w-3" /> Email digest
          </span>
          <span className="flex items-center gap-1">
            <Bell className="h-3 w-3" /> Push notifications
          </span>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="mb-8 text-center text-2xl font-bold">
          Everything you need, nothing you don&apos;t
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.name}
              className="hover:bg-accent/50 rounded-xl border p-6 transition-colors"
            >
              <feature.icon className="text-primary mb-3 h-8 w-8" />
              <h3 className="font-semibold">{feature.name}</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="mb-8 text-center text-2xl font-bold">
          Set up in under 90 seconds
        </h2>
        <div className="grid gap-8 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.step} className="text-center">
              <div className="bg-primary text-primary-foreground mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold">
                {s.step}
              </div>
              <h3 className="font-semibold">{s.title}</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 py-20 text-center">
        <h2 className="text-3xl font-bold">Ready to simplify your morning?</h2>
        <p className="text-muted-foreground mt-2">
          Free forever for 3 modules. Upgrade anytime.
        </p>
        <Button asChild size="lg" className="mt-6">
          <Link href="/sign-up">
            Get started — it&apos;s free
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="text-muted-foreground mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 text-xs sm:flex-row">
          <span>BriefMe — Your Morning, Personally Curated</span>
          <div className="flex gap-4">
            <Link href="/changelog" className="hover:text-foreground">
              Changelog
            </Link>
            <Link href="/guide" className="hover:text-foreground">
              User Guide
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

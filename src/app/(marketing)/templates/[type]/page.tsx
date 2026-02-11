import type { Metadata } from "next";
import Link from "next/link";
import {
  CloudSun,
  Calendar,
  Newspaper,
  Heart,
  Gamepad2,
  BookOpen,
} from "lucide-react";

interface TemplateData {
  name: string;
  emoji: string;
  description: string;
  modules: {
    id: string;
    name: string;
    enabled: boolean;
    note?: string;
  }[];
  wakeTime: string;
  idealFor: string[];
}

const TEMPLATES: Record<string, TemplateData> = {
  developer: {
    name: "Developer",
    emoji: "👨‍💻",
    description:
      "Stay on top of your schedule and start coding with a clear head. Weather, calendar, and tech news — no distractions.",
    modules: [
      {
        id: "weather",
        name: "Weather",
        enabled: true,
        note: "Quick glance at conditions",
      },
      {
        id: "calendar",
        name: "Calendar",
        enabled: true,
        note: "Syncs Google + Outlook for standups",
      },
      {
        id: "news",
        name: "News",
        enabled: true,
        note: "Tech headlines from The Guardian",
      },
      { id: "health", name: "Health", enabled: false },
      {
        id: "games",
        name: "Games",
        enabled: true,
        note: "Quick brain warmup with Wordle",
      },
      { id: "history", name: "History", enabled: false },
    ],
    wakeTime: "07:00",
    idealFor: ["Software engineers", "Tech leads", "DevOps engineers"],
  },
  investor: {
    name: "Investor",
    emoji: "📈",
    description:
      "Market-moving headlines, your schedule, and weather before the opening bell. Stay ahead of the market every morning.",
    modules: [
      { id: "weather", name: "Weather", enabled: true },
      {
        id: "calendar",
        name: "Calendar",
        enabled: true,
        note: "Track earnings calls and meetings",
      },
      {
        id: "news",
        name: "News",
        enabled: true,
        note: "Business and finance headlines",
      },
      {
        id: "health",
        name: "Health",
        enabled: true,
        note: "Track sleep for peak performance",
      },
      { id: "games", name: "Games", enabled: false },
      {
        id: "history",
        name: "History",
        enabled: true,
        note: "Historical market context",
      },
    ],
    wakeTime: "05:30",
    idealFor: ["Day traders", "Financial analysts", "Portfolio managers"],
  },
  parent: {
    name: "Busy Parent",
    emoji: "👨‍👩‍👧",
    description:
      "Know the weather for school drop-off, see everyone's schedule, and get a quick news catch-up — all in 30 seconds.",
    modules: [
      {
        id: "weather",
        name: "Weather",
        enabled: true,
        note: "Plan outfits and activities",
      },
      {
        id: "calendar",
        name: "Calendar",
        enabled: true,
        note: "Family calendar at a glance",
      },
      { id: "news", name: "News", enabled: true, note: "Top headlines only" },
      { id: "health", name: "Health", enabled: false },
      {
        id: "games",
        name: "Games",
        enabled: true,
        note: "Fun daily puzzle with the kids",
      },
      {
        id: "history",
        name: "History",
        enabled: true,
        note: "Fun facts for the breakfast table",
      },
    ],
    wakeTime: "06:00",
    idealFor: ["Working parents", "Stay-at-home parents", "Caregivers"],
  },
  fitness: {
    name: "Fitness Enthusiast",
    emoji: "💪",
    description:
      "Recovery scores, weather for outdoor workouts, and your schedule — optimize your training every morning.",
    modules: [
      {
        id: "weather",
        name: "Weather",
        enabled: true,
        note: "Plan outdoor workouts",
      },
      {
        id: "calendar",
        name: "Calendar",
        enabled: true,
        note: "Workout schedule",
      },
      { id: "news", name: "News", enabled: false },
      {
        id: "health",
        name: "Health",
        enabled: true,
        note: "Oura sleep + readiness scores",
      },
      { id: "games", name: "Games", enabled: false },
      { id: "history", name: "History", enabled: false },
    ],
    wakeTime: "05:00",
    idealFor: ["Athletes", "Personal trainers", "Wellness coaches"],
  },
  executive: {
    name: "Executive",
    emoji: "👔",
    description:
      "Everything you need before your first meeting. Weather, packed schedule, top headlines, and health — in one view.",
    modules: [
      { id: "weather", name: "Weather", enabled: true },
      {
        id: "calendar",
        name: "Calendar",
        enabled: true,
        note: "Google + Outlook merged view",
      },
      {
        id: "news",
        name: "News",
        enabled: true,
        note: "Business and world news",
      },
      {
        id: "health",
        name: "Health",
        enabled: true,
        note: "Sleep quality for peak performance",
      },
      { id: "games", name: "Games", enabled: false },
      {
        id: "history",
        name: "History",
        enabled: true,
        note: "Conversation starters",
      },
    ],
    wakeTime: "06:00",
    idealFor: ["C-suite executives", "VPs", "Directors"],
  },
};

const MODULE_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  weather: CloudSun,
  calendar: Calendar,
  news: Newspaper,
  health: Heart,
  games: Gamepad2,
  history: BookOpen,
};

export const revalidate = 86400; // 24h

type Props = { params: Promise<{ type: string }> };

export async function generateStaticParams() {
  return Object.keys(TEMPLATES).map((type) => ({ type }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;
  const template = TEMPLATES[type];
  if (!template) {
    return { title: "Briefing Templates - BriefMe" };
  }
  return {
    title: `${template.name} Morning Briefing Template - BriefMe`,
    description: template.description,
  };
}

export default async function TemplatePage({ params }: Props) {
  const { type } = await params;
  const template = TEMPLATES[type];

  if (!template) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Template Not Found</h1>
        <Link
          href="/"
          className="text-primary mt-4 inline-block text-sm underline"
        >
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex items-center gap-3">
        <span className="text-4xl">{template.emoji}</span>
        <div>
          <h1 className="text-3xl font-bold">
            {template.name} Morning Briefing
          </h1>
          <p className="text-muted-foreground mt-1">
            Preset template — customize anytime
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed">{template.description}</p>

      {/* Module config */}
      <div className="mt-8 space-y-3">
        <h2 className="text-xl font-bold">Included Modules</h2>
        {template.modules.map((mod) => {
          const Icon = MODULE_ICONS[mod.id];
          return (
            <div
              key={mod.id}
              className={`flex items-center gap-3 rounded-lg border p-3 ${
                mod.enabled ? "" : "opacity-40"
              }`}
            >
              {Icon && <Icon className="h-5 w-5 shrink-0" />}
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {mod.name}
                  {!mod.enabled && (
                    <span className="text-muted-foreground ml-2 text-xs">
                      (off)
                    </span>
                  )}
                </p>
                {mod.note && mod.enabled && (
                  <p className="text-muted-foreground text-xs">{mod.note}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Schedule */}
      <div className="mt-8">
        <h2 className="text-xl font-bold">Suggested Schedule</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Delivery at{" "}
          <span className="font-medium">
            {parseInt(template.wakeTime.split(":")[0]) > 12
              ? `${parseInt(template.wakeTime.split(":")[0]) - 12}:${template.wakeTime.split(":")[1]} PM`
              : `${template.wakeTime} AM`}
          </span>
        </p>
      </div>

      {/* Ideal for */}
      <div className="mt-8">
        <h2 className="text-xl font-bold">Ideal For</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {template.idealFor.map((persona) => (
            <span
              key={persona}
              className="bg-muted rounded-full px-3 py-1 text-sm"
            >
              {persona}
            </span>
          ))}
        </div>
      </div>

      {/* Other templates */}
      <section className="mt-12">
        <h2 className="mb-3 text-lg font-bold">Other Templates</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(TEMPLATES)
            .filter(([slug]) => slug !== type)
            .map(([slug, tmpl]) => (
              <Link
                key={slug}
                href={`/templates/${slug}`}
                className="bg-muted rounded-full px-3 py-1 text-sm hover:opacity-80"
              >
                {tmpl.emoji} {tmpl.name}
              </Link>
            ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-accent/30 mt-12 rounded-xl border p-6 text-center">
        <h3 className="font-bold">Start with the {template.name} template</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Sign up and select this preset during onboarding.
        </p>
        <Link
          href="/sign-up"
          className="bg-primary text-primary-foreground mt-3 inline-block rounded-lg px-4 py-2 text-sm font-medium"
        >
          Get started free
        </Link>
      </section>
    </div>
  );
}

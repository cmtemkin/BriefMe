import type { Metadata } from "next";
import Link from "next/link";

interface TopicData {
  title: string;
  description: string;
  category: string;
}

const TOPICS: Record<string, TopicData> = {
  science: {
    title: "Science Breakthroughs",
    description:
      "Notable scientific discoveries and breakthroughs that happened on this day throughout history.",
    category: "science",
  },
  politics: {
    title: "Political Milestones",
    description:
      "Important political events, treaties, and governance milestones from this day in history.",
    category: "politics",
  },
  sports: {
    title: "Sports Moments",
    description:
      "Iconic sports achievements, records, and memorable moments from this day in history.",
    category: "sports",
  },
  technology: {
    title: "Tech Milestones",
    description:
      "Technology inventions, product launches, and digital milestones from this day in history.",
    category: "technology",
  },
  culture: {
    title: "Cultural Moments",
    description:
      "Notable cultural events, art, music, and entertainment milestones from this day in history.",
    category: "culture",
  },
};

export const revalidate = 3600; // 1h ISR

type Props = { params: Promise<{ topic: string }> };

export async function generateStaticParams() {
  return Object.keys(TOPICS).map((topic) => ({ topic }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topic } = await params;
  const topicData = TOPICS[topic];
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  if (!topicData) {
    return { title: `Today in History - BriefMe` };
  }
  return {
    title: `${topicData.title} — ${dateStr} - BriefMe`,
    description: topicData.description,
  };
}

async function fetchOnThisDay() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  try {
    const res = await fetch(
      `https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/all/${month}/${day}`,
      {
        headers: { "User-Agent": "BriefMe/1.0" },
        next: { revalidate: 3600 },
      },
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function TopicPage({ params }: Props) {
  const { topic } = await params;
  const topicData = TOPICS[topic];

  if (!topicData) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Topic Not Found</h1>
        <Link
          href="/today/history"
          className="text-primary mt-4 inline-block text-sm underline"
        >
          View all history
        </Link>
      </div>
    );
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  const data = await fetchOnThisDay();
  const events = data?.events?.slice(0, 15) || [];
  const births = data?.births?.slice(0, 8) || [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">
        {topicData.title} — {dateStr}
      </h1>
      <p className="text-muted-foreground mt-2">{topicData.description}</p>

      {events.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-bold">Events</h2>
          <div className="mt-4 space-y-4">
            {events.map((event: { year: number; text: string }, i: number) => (
              <div key={i} className="flex gap-4 border-b pb-3">
                <span className="bg-muted shrink-0 rounded px-2 py-1 text-sm font-bold tabular-nums">
                  {event.year}
                </span>
                <p className="text-sm">{event.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {births.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-bold">Born on This Day</h2>
          <div className="mt-4 space-y-3">
            {births.map((birth: { year: number; text: string }, i: number) => (
              <div key={i} className="flex gap-4">
                <span className="bg-muted shrink-0 rounded px-2 py-1 text-sm font-bold tabular-nums">
                  {birth.year}
                </span>
                <p className="text-sm">{birth.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Other topics */}
      <section className="mt-12">
        <h2 className="mb-3 text-lg font-bold">Explore Other Topics</h2>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/today/history"
            className="bg-muted rounded-full px-3 py-1 text-sm hover:opacity-80"
          >
            All History
          </Link>
          {Object.entries(TOPICS)
            .filter(([slug]) => slug !== topic)
            .map(([slug, t]) => (
              <Link
                key={slug}
                href={`/today/${slug}`}
                className="bg-muted rounded-full px-3 py-1 text-sm hover:opacity-80"
              >
                {t.title}
              </Link>
            ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-accent/30 mt-12 rounded-xl border p-6 text-center">
        <h3 className="font-bold">Get history in your morning briefing</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          BriefMe delivers history, weather, news, and more — every morning.
        </p>
        <Link
          href="/sign-up"
          className="bg-primary text-primary-foreground mt-3 inline-block rounded-lg px-4 py-2 text-sm font-medium"
        >
          Start your free briefing
        </Link>
      </section>
    </div>
  );
}

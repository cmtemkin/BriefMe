import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Today in History",
  description:
    "Discover what happened on this day in history — notable events, births, and milestones.",
};

export const revalidate = 3600; // ISR: revalidate every hour

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

export default async function TodayInHistoryPage() {
  const data = await fetchOnThisDay();
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  const events = data?.events?.slice(0, 10) || [];
  const births = data?.births?.slice(0, 5) || [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">On This Day — {dateStr}</h1>
      <p className="text-muted-foreground mt-2">
        Notable events and birthdays from {dateStr} throughout history.
      </p>

      {events.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-bold">Historical Events</h2>
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

      <section className="bg-accent/30 mt-12 rounded-xl border p-6 text-center">
        <h3 className="font-bold">Get this delivered every morning</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Sign up for BriefMe and wake up to history, weather, news, and more.
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

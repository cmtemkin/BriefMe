import type { Metadata } from "next";
import Link from "next/link";
import { Check, X } from "lucide-react";

interface CompetitorData {
  name: string;
  tagline: string;
  description: string;
  features: {
    label: string;
    briefme: boolean | string;
    competitor: boolean | string;
  }[];
}

const COMPETITORS: Record<string, CompetitorData> = {
  "morning-brew": {
    name: "Morning Brew",
    tagline: "Newsletter vs. Intelligent Dashboard",
    description:
      "Morning Brew is a popular daily email newsletter. BriefMe goes beyond news with a personalized, interactive dashboard.",
    features: [
      { label: "Personalized news feed", briefme: true, competitor: false },
      { label: "Weather integration", briefme: true, competitor: false },
      { label: "Calendar sync", briefme: true, competitor: false },
      {
        label: "Health data (Oura, Apple Health)",
        briefme: true,
        competitor: false,
      },
      { label: "Daily games links", briefme: true, competitor: false },
      { label: "This Day in History", briefme: true, competitor: false },
      { label: "Email delivery", briefme: true, competitor: true },
      { label: "Push notifications", briefme: true, competitor: false },
      { label: "Web dashboard", briefme: true, competitor: false },
      { label: "Free tier", briefme: "3 modules", competitor: true },
    ],
  },
  theskimm: {
    name: "theSkimm",
    tagline: "One-Size-Fits-All vs. Fully Configurable",
    description:
      "theSkimm delivers a standard daily email. BriefMe lets you choose your modules, schedule, and delivery method.",
    features: [
      { label: "Customizable modules", briefme: true, competitor: false },
      { label: "Weather forecast", briefme: true, competitor: false },
      { label: "Calendar integration", briefme: true, competitor: true },
      { label: "Health tracking", briefme: true, competitor: false },
      { label: "Interactive dashboard", briefme: true, competitor: false },
      { label: "Push notifications", briefme: true, competitor: false },
      { label: "Email digest", briefme: true, competitor: true },
      { label: "Dark mode", briefme: true, competitor: false },
      { label: "PWA (works offline)", briefme: true, competitor: false },
      { label: "Free tier", briefme: "3 modules", competitor: true },
    ],
  },
  notion: {
    name: "Notion",
    tagline: "Workspace vs. Morning Intelligence",
    description:
      "Notion is a powerful workspace tool. BriefMe is purpose-built for your morning routine — aggregating data automatically.",
    features: [
      { label: "Auto-aggregated data", briefme: true, competitor: false },
      { label: "Zero setup daily briefing", briefme: true, competitor: false },
      { label: "Real-time weather", briefme: true, competitor: false },
      {
        label: "Calendar merge (Google + Outlook)",
        briefme: true,
        competitor: false,
      },
      { label: "Health scores", briefme: true, competitor: false },
      { label: "Email digest delivery", briefme: true, competitor: false },
      { label: "Push notifications", briefme: true, competitor: false },
      { label: "Customizable workspace", briefme: false, competitor: true },
      { label: "Note-taking", briefme: false, competitor: true },
      { label: "Free tier", briefme: "3 modules", competitor: true },
    ],
  },
  "apple-news": {
    name: "Apple News",
    tagline: "News App vs. Morning Dashboard",
    description:
      "Apple News focuses on articles and magazines. BriefMe combines news with weather, calendar, health, and more — all in one view.",
    features: [
      {
        label: "Multi-source morning briefing",
        briefme: true,
        competitor: false,
      },
      { label: "Weather integration", briefme: true, competitor: true },
      { label: "Calendar sync", briefme: true, competitor: false },
      { label: "Health data", briefme: true, competitor: false },
      { label: "Email delivery", briefme: true, competitor: false },
      { label: "Push notifications", briefme: true, competitor: true },
      { label: "Cross-platform web app", briefme: true, competitor: false },
      { label: "Magazine-style articles", briefme: false, competitor: true },
      { label: "Daily games", briefme: true, competitor: false },
      { label: "Free tier", briefme: "3 modules", competitor: true },
    ],
  },
};

export const revalidate = 86400; // 24h ISR

type Props = { params: Promise<{ competitor: string }> };

export async function generateStaticParams() {
  return Object.keys(COMPETITORS).map((competitor) => ({ competitor }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { competitor } = await params;
  const data = COMPETITORS[competitor];
  if (!data) {
    return { title: "BriefMe vs Competitors" };
  }
  return {
    title: `BriefMe vs ${data.name} - Morning Briefing Comparison`,
    description: `Compare BriefMe with ${data.name}. ${data.description}`,
  };
}

function FeatureIcon({ value }: { value: boolean | string }) {
  if (typeof value === "string") {
    return <span className="text-sm font-medium">{value}</span>;
  }
  return value ? (
    <Check className="h-5 w-5 text-green-600" />
  ) : (
    <X className="text-muted-foreground h-5 w-5" />
  );
}

export default async function CompetitorPage({ params }: Props) {
  const { competitor } = await params;
  const data = COMPETITORS[competitor];

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Comparison Not Found</h1>
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
      <h1 className="text-3xl font-bold">BriefMe vs {data.name}</h1>
      <p className="text-muted-foreground mt-2 text-lg">{data.tagline}</p>
      <p className="mt-4 text-sm">{data.description}</p>

      {/* Comparison Table */}
      <div className="mt-8 overflow-hidden rounded-lg border">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium">
                Feature
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium">
                BriefMe
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium">
                {data.name}
              </th>
            </tr>
          </thead>
          <tbody>
            {data.features.map((feature, i) => (
              <tr key={i} className="border-t">
                <td className="px-4 py-3 text-sm">{feature.label}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center">
                    <FeatureIcon value={feature.briefme} />
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center">
                    <FeatureIcon value={feature.competitor} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Other comparisons */}
      <section className="mt-12">
        <h2 className="mb-3 text-lg font-bold">Other Comparisons</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(COMPETITORS)
            .filter(([slug]) => slug !== competitor)
            .map(([slug, comp]) => (
              <Link
                key={slug}
                href={`/vs/${slug}`}
                className="bg-muted rounded-full px-3 py-1 text-sm hover:opacity-80"
              >
                vs {comp.name}
              </Link>
            ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-accent/30 mt-12 rounded-xl border p-6 text-center">
        <h3 className="font-bold">Ready to upgrade your mornings?</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Try BriefMe free — no credit card required.
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

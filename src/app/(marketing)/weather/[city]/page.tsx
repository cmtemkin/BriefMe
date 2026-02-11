import type { Metadata } from "next";
import Link from "next/link";

const CITIES: Record<
  string,
  { name: string; state: string; lat: string; lon: string }
> = {
  "new-york": {
    name: "New York",
    state: "NY",
    lat: "40.7128",
    lon: "-74.0060",
  },
  "los-angeles": {
    name: "Los Angeles",
    state: "CA",
    lat: "34.0522",
    lon: "-118.2437",
  },
  chicago: { name: "Chicago", state: "IL", lat: "41.8781", lon: "-87.6298" },
  houston: { name: "Houston", state: "TX", lat: "29.7604", lon: "-95.3698" },
  phoenix: { name: "Phoenix", state: "AZ", lat: "33.4484", lon: "-112.0740" },
  philadelphia: {
    name: "Philadelphia",
    state: "PA",
    lat: "39.9526",
    lon: "-75.1652",
  },
  "san-antonio": {
    name: "San Antonio",
    state: "TX",
    lat: "29.4241",
    lon: "-98.4936",
  },
  "san-diego": {
    name: "San Diego",
    state: "CA",
    lat: "32.7157",
    lon: "-117.1611",
  },
  dallas: { name: "Dallas", state: "TX", lat: "32.7767", lon: "-96.7970" },
  austin: { name: "Austin", state: "TX", lat: "30.2672", lon: "-97.7431" },
  boston: { name: "Boston", state: "MA", lat: "42.3601", lon: "-71.0589" },
  seattle: { name: "Seattle", state: "WA", lat: "47.6062", lon: "-122.3321" },
  denver: { name: "Denver", state: "CO", lat: "39.7392", lon: "-104.9903" },
  miami: { name: "Miami", state: "FL", lat: "25.7617", lon: "-80.1918" },
  atlanta: { name: "Atlanta", state: "GA", lat: "33.7490", lon: "-84.3880" },
  "san-francisco": {
    name: "San Francisco",
    state: "CA",
    lat: "37.7749",
    lon: "-122.4194",
  },
  portland: { name: "Portland", state: "OR", lat: "45.5152", lon: "-122.6784" },
  nashville: {
    name: "Nashville",
    state: "TN",
    lat: "36.1627",
    lon: "-86.7816",
  },
  charlotte: {
    name: "Charlotte",
    state: "NC",
    lat: "35.2271",
    lon: "-80.8431",
  },
  "washington-dc": {
    name: "Washington",
    state: "DC",
    lat: "38.9072",
    lon: "-77.0369",
  },
};

export const revalidate = 1800; // 30 min ISR

type Props = { params: Promise<{ city: string }> };

export async function generateStaticParams() {
  return Object.keys(CITIES).map((city) => ({ city }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const cityData = CITIES[city];
  if (!cityData) {
    return { title: "City Weather - BriefMe" };
  }
  return {
    title: `${cityData.name}, ${cityData.state} Weather - BriefMe`,
    description: `Get today's weather for ${cityData.name}, ${cityData.state} delivered with your morning briefing. Current conditions, hourly forecast, and daily summary.`,
  };
}

async function fetchWeather(lat: string, lon: string) {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto&forecast_days=3`,
      { next: { revalidate: 1800 } },
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function weatherCodeToDescription(code: number): string {
  const descriptions: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm",
  };
  return descriptions[code] || "Unknown";
}

export default async function CityWeatherPage({ params }: Props) {
  const { city } = await params;
  const cityData = CITIES[city];

  if (!cityData) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">City Not Found</h1>
        <p className="text-muted-foreground mt-2">
          We don&apos;t have weather data for this city yet.
        </p>
        <Link
          href="/"
          className="text-primary mt-4 inline-block text-sm underline"
        >
          Back to home
        </Link>
      </div>
    );
  }

  const weather = await fetchWeather(cityData.lat, cityData.lon);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">
        {cityData.name}, {cityData.state} Weather
      </h1>
      <p className="text-muted-foreground mt-2">
        Current conditions and forecast for {cityData.name}
      </p>

      {weather?.current ? (
        <div className="mt-8 space-y-6">
          {/* Current */}
          <div className="rounded-xl border bg-gradient-to-br from-blue-50 to-sky-50 p-6 dark:from-blue-950/30 dark:to-sky-950/30">
            <h2 className="text-sm font-medium tracking-wide uppercase opacity-60">
              Right Now
            </h2>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-5xl font-bold">
                {Math.round(weather.current.temperature_2m)}°F
              </span>
              <span className="text-muted-foreground text-lg">
                Feels like {Math.round(weather.current.apparent_temperature)}°F
              </span>
            </div>
            <p className="mt-1 text-lg">
              {weatherCodeToDescription(weather.current.weather_code)}
            </p>
            <p className="text-muted-foreground text-sm">
              Wind: {Math.round(weather.current.wind_speed_10m)} mph
            </p>
          </div>

          {/* 3-day forecast */}
          {weather.daily && (
            <div>
              <h2 className="mb-3 text-xl font-bold">3-Day Forecast</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {weather.daily.time
                  .slice(0, 3)
                  .map((date: string, i: number) => (
                    <div key={date} className="rounded-lg border p-4">
                      <p className="text-sm font-medium">
                        {i === 0
                          ? "Today"
                          : new Date(date + "T12:00:00").toLocaleDateString(
                              "en-US",
                              {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                      </p>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {weatherCodeToDescription(
                          weather.daily.weather_code[i],
                        )}
                      </p>
                      <p className="mt-2 text-lg font-bold">
                        {Math.round(weather.daily.temperature_2m_max[i])}°
                        <span className="text-muted-foreground text-base font-normal">
                          {" / "}
                          {Math.round(weather.daily.temperature_2m_min[i])}°
                        </span>
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-8 rounded-lg border p-6 text-center">
          <p className="text-muted-foreground">
            Weather data is temporarily unavailable. Please check back soon.
          </p>
        </div>
      )}

      {/* Other cities */}
      <section className="mt-12">
        <h2 className="mb-3 text-lg font-bold">Other Cities</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(CITIES)
            .filter(([slug]) => slug !== city)
            .slice(0, 12)
            .map(([slug, data]) => (
              <Link
                key={slug}
                href={`/weather/${slug}`}
                className="bg-muted rounded-full px-3 py-1 text-sm hover:opacity-80"
              >
                {data.name}
              </Link>
            ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-accent/30 mt-12 rounded-xl border p-6 text-center">
        <h3 className="font-bold">Get weather in your morning briefing</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          BriefMe delivers weather, calendar, news, and more — every morning.
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

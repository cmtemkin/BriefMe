import type {
  Widget,
  WidgetConfig,
  WidgetData,
  NotificationPayload,
} from "./types";
import { getCached, setCache } from "@/lib/redis/cache";
import { fetchWithRetry } from "@/lib/fetch-retry";

interface WeatherResponse {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    weather_code: number;
    wind_speed_10m: number;
    relative_humidity_2m: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
  };
  daily: {
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    sunrise: string[];
    sunset: string[];
    uv_index_max: number[];
  };
}

const WEATHER_CODES: Record<number, { label: string; emoji: string }> = {
  0: { label: "Clear sky", emoji: "☀️" },
  1: { label: "Mainly clear", emoji: "🌤️" },
  2: { label: "Partly cloudy", emoji: "⛅" },
  3: { label: "Overcast", emoji: "☁️" },
  45: { label: "Foggy", emoji: "🌫️" },
  48: { label: "Rime fog", emoji: "🌫️" },
  51: { label: "Light drizzle", emoji: "🌦️" },
  53: { label: "Moderate drizzle", emoji: "🌦️" },
  55: { label: "Dense drizzle", emoji: "🌧️" },
  61: { label: "Slight rain", emoji: "🌧️" },
  63: { label: "Moderate rain", emoji: "🌧️" },
  65: { label: "Heavy rain", emoji: "🌧️" },
  71: { label: "Slight snow", emoji: "🌨️" },
  73: { label: "Moderate snow", emoji: "❄️" },
  75: { label: "Heavy snow", emoji: "❄️" },
  80: { label: "Slight showers", emoji: "🌦️" },
  81: { label: "Moderate showers", emoji: "🌧️" },
  82: { label: "Violent showers", emoji: "⛈️" },
  95: { label: "Thunderstorm", emoji: "⛈️" },
  96: { label: "Thunderstorm with hail", emoji: "⛈️" },
  99: { label: "Thunderstorm with heavy hail", emoji: "⛈️" },
};

function getCondition(code: number) {
  return WEATHER_CODES[code] ?? { label: "Unknown", emoji: "🌡️" };
}

async function fetchWeatherData(
  lat: string,
  lon: string,
  units: "fahrenheit" | "celsius",
): Promise<WeatherResponse> {
  const tempUnit = units === "fahrenheit" ? "fahrenheit" : "celsius";
  const windUnit = units === "fahrenheit" ? "mph" : "kmh";

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", lat);
  url.searchParams.set("longitude", lon);
  url.searchParams.set(
    "current",
    "temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m",
  );
  url.searchParams.set("hourly", "temperature_2m,weather_code");
  url.searchParams.set(
    "daily",
    "temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max",
  );
  url.searchParams.set("temperature_unit", tempUnit);
  url.searchParams.set("wind_speed_unit", windUnit);
  url.searchParams.set("forecast_days", "1");
  url.searchParams.set("timezone", "auto");

  const res = await fetchWithRetry(url.toString());
  if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
  return res.json();
}

export const weatherWidget: Widget = {
  metadata: {
    id: "weather",
    name: "Weather",
    description: "Current conditions, feels-like temp, and hourly forecast",
    icon: "CloudSun",
    tier: "free",
    category: "info",
    defaultEnabled: true,
    defaultPosition: 0,
    configSchema: {
      location: {
        type: "object",
        properties: {
          lat: { type: "string" },
          lon: { type: "string" },
          name: { type: "string" },
        },
      },
      units: { type: "string", enum: ["fahrenheit", "celsius"] },
    },
  },

  async fetchData(config: WidgetConfig): Promise<WidgetData> {
    const lat = (config.lat as string) || "42.2918";
    const lon = (config.lon as string) || "-71.2328";
    const units = (config.units as "fahrenheit" | "celsius") || "fahrenheit";

    const cacheKey = `${lat}:${lon}`;
    const cached = await getCached<WidgetData>("weather", cacheKey);
    if (cached) return cached;

    try {
      const weather = await fetchWeatherData(lat, lon, units);
      const condition = getCondition(weather.current.weather_code);

      const now = new Date();
      const currentHour = now.getHours();
      const hourlyForecast = weather.hourly.time
        .map((time, i) => ({
          time,
          hour: new Date(time).getHours(),
          temp: Math.round(weather.hourly.temperature_2m[i]),
          condition: getCondition(weather.hourly.weather_code[i]),
        }))
        .filter((h) => h.hour >= currentHour)
        .slice(0, 6);

      const data: WidgetData = {
        widgetId: "weather",
        fetchedAt: new Date(),
        data: {
          temperature: Math.round(weather.current.temperature_2m),
          feelsLike: Math.round(weather.current.apparent_temperature),
          condition: condition.label,
          conditionEmoji: condition.emoji,
          windSpeed: Math.round(weather.current.wind_speed_10m),
          humidity: weather.current.relative_humidity_2m,
          high: Math.round(weather.daily.temperature_2m_max[0]),
          low: Math.round(weather.daily.temperature_2m_min[0]),
          sunrise: weather.daily.sunrise[0],
          sunset: weather.daily.sunset[0],
          uvIndex: weather.daily.uv_index_max[0],
          hourlyForecast,
          units,
          locationName: (config.locationName as string) || "Your Location",
        },
      };

      await setCache("weather", cacheKey, data);
      return data;
    } catch (error) {
      return {
        widgetId: "weather",
        fetchedAt: new Date(),
        data: {},
        error:
          error instanceof Error ? error.message : "Failed to fetch weather",
      };
    }
  },

  renderCard() {
    return null; // Implemented in component file
  },

  renderEmail() {
    return null; // Implemented in email component file
  },

  renderNotification(data: WidgetData): NotificationPayload {
    const d = data.data;
    return {
      title: `${d.conditionEmoji} ${d.temperature}° — ${d.condition}`,
      body: `Feels like ${d.feelsLike}°. High ${d.high}°, Low ${d.low}°.`,
      url: "/dashboard",
    };
  },
};

/**
 * Renders widget data into an HTML email digest.
 * Uses inline styles for maximum email client compatibility.
 * (MJML build step can be added later for more complex layouts.)
 */

import type { WidgetData } from "@/lib/widgets/types";

interface DigestRenderOptions {
  firstName: string;
  widgets: WidgetData[];
  appUrl: string;
}

function renderWeatherSection(data: WidgetData): string {
  const d = data.data;
  if (!d.temperature) return "";
  return `
    <tr><td style="padding: 16px 24px; background: #EFF6FF; border-radius: 12px;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td>
          <p style="margin: 0; font-size: 14px; color: #6B7280;">${d.locationName || "Weather"}</p>
          <p style="margin: 4px 0 0; font-size: 32px; font-weight: bold; color: #1F2937;">${d.temperature}°F ${d.conditionEmoji || ""}</p>
          <p style="margin: 2px 0 0; font-size: 13px; color: #6B7280;">Feels like ${d.feelsLike}° · H:${d.high}° L:${d.low}°</p>
        </td>
      </tr></table>
    </td></tr>
    <tr><td style="height: 12px;"></td></tr>`;
}

function renderCalendarSection(data: WidgetData): string {
  const events =
    (data.data.events as Array<{
      title: string;
      startTime: string;
      endTime: string;
      location?: string;
      source: string;
      isAllDay: boolean;
    }>) || [];
  if (events.length === 0) return "";

  const eventRows = events
    .map((e) => {
      const time = e.isAllDay
        ? "All day"
        : new Date(e.startTime).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          });
      const color = e.source === "google" ? "#3B82F6" : "#8B5CF6";
      return `<tr>
        <td style="padding: 6px 0; border-bottom: 1px solid #F3F4F6;">
          <span style="display: inline-block; width: 8px; height: 8px; background: ${color}; border-radius: 50; margin-right: 8px;"></span>
          <strong style="font-size: 14px; color: #1F2937;">${e.title}</strong>
          <br/><span style="font-size: 12px; color: #6B7280;">${time}${e.location ? ` · ${e.location}` : ""}</span>
        </td>
      </tr>`;
    })
    .join("");

  return `
    <tr><td style="padding: 16px 24px; background: #F5F3FF; border-radius: 12px;">
      <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #1F2937;">📅 ${events.length} event${events.length > 1 ? "s" : ""} today</p>
      <table width="100%" cellpadding="0" cellspacing="0">${eventRows}</table>
    </td></tr>
    <tr><td style="height: 12px;"></td></tr>`;
}

function renderNewsSection(data: WidgetData): string {
  const headlines =
    (data.data.headlines as Array<{
      title: string;
      url: string;
      section: string;
    }>) || [];
  if (headlines.length === 0) return "";

  const rows = headlines
    .slice(0, 5)
    .map(
      (h, i) =>
        `<tr><td style="padding: 6px 0; border-bottom: 1px solid #F3F4F6;">
          <span style="font-size: 13px; color: #9CA3AF;">${i + 1}.</span>
          <a href="${h.url}" style="font-size: 14px; color: #1F2937; text-decoration: none;">${h.title}</a>
          <br/><span style="font-size: 11px; color: #9CA3AF; text-transform: uppercase;">${h.section}</span>
        </td></tr>`,
    )
    .join("");

  return `
    <tr><td style="padding: 16px 24px; background: #FFF7ED; border-radius: 12px;">
      <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #1F2937;">📰 Headlines</p>
      <table width="100%" cellpadding="0" cellspacing="0">${rows}</table>
    </td></tr>
    <tr><td style="height: 12px;"></td></tr>`;
}

function renderHealthSection(data: WidgetData): string {
  const d = data.data;
  if (!d.connected) return "";

  return `
    <tr><td style="padding: 16px 24px; background: #ECFDF5; border-radius: 12px;">
      <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #1F2937;">💚 Health</p>
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        ${d.sleepScore ? `<td style="text-align: center; padding: 4px 8px;"><p style="margin: 0; font-size: 24px; font-weight: bold; color: #10B981;">${d.sleepScore}</p><p style="margin: 0; font-size: 11px; color: #6B7280;">Sleep</p></td>` : ""}
        ${d.readinessScore ? `<td style="text-align: center; padding: 4px 8px;"><p style="margin: 0; font-size: 24px; font-weight: bold; color: #10B981;">${d.readinessScore}</p><p style="margin: 0; font-size: 11px; color: #6B7280;">Readiness</p></td>` : ""}
        ${d.steps ? `<td style="text-align: center; padding: 4px 8px;"><p style="margin: 0; font-size: 24px; font-weight: bold; color: #10B981;">${Number(d.steps).toLocaleString()}</p><p style="margin: 0; font-size: 11px; color: #6B7280;">Steps</p></td>` : ""}
      </tr></table>
    </td></tr>
    <tr><td style="height: 12px;"></td></tr>`;
}

function renderHistorySection(data: WidgetData): string {
  const events =
    (data.data.events as Array<{ text: string; year: number }>) || [];
  if (events.length === 0) return "";

  const first = events[0];
  return `
    <tr><td style="padding: 16px 24px; background: #FFF1F2; border-radius: 12px;">
      <p style="margin: 0 0 4px; font-size: 14px; font-weight: 600; color: #1F2937;">📖 On This Day</p>
      <p style="margin: 0; font-size: 14px; color: #374151;"><strong>${first.year}</strong> — ${first.text}</p>
      ${events.length > 1 ? `<p style="margin: 4px 0 0; font-size: 12px; color: #9CA3AF;">+ ${events.length - 1} more events</p>` : ""}
    </td></tr>
    <tr><td style="height: 12px;"></td></tr>`;
}

export function renderDigestHtml(options: DigestRenderOptions): string {
  const { firstName, widgets, appUrl } = options;
  const widgetMap = Object.fromEntries(widgets.map((w) => [w.widgetId, w]));

  const sections = [
    widgetMap.weather ? renderWeatherSection(widgetMap.weather) : "",
    widgetMap.calendar ? renderCalendarSection(widgetMap.calendar) : "",
    widgetMap.news ? renderNewsSection(widgetMap.news) : "",
    widgetMap.health ? renderHealthSection(widgetMap.health) : "",
    widgetMap.history ? renderHistorySection(widgetMap.history) : "",
  ]
    .filter(Boolean)
    .join("");

  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin: 0; padding: 0; background: #F9FAFB; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 24px;">
    <tr><td style="padding: 24px 0; text-align: center;">
      <h1 style="margin: 0; font-size: 20px; color: #1F2937;">Good morning, ${firstName}</h1>
      <p style="margin: 4px 0 0; font-size: 14px; color: #6B7280;">${dateStr}</p>
    </td></tr>
    ${sections}
    <tr><td style="padding: 24px; text-align: center;">
      <a href="${appUrl}/dashboard" style="display: inline-block; padding: 12px 24px; background: #1B3A5C; color: white; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">View full briefing</a>
    </td></tr>
    <tr><td style="padding: 16px 0; text-align: center; border-top: 1px solid #E5E7EB;">
      <p style="margin: 0; font-size: 11px; color: #9CA3AF;">
        BriefMe — Your Morning, Personally Curated<br/>
        <a href="${appUrl}/settings" style="color: #6B7280;">Manage preferences</a>
      </p>
    </td></tr>
  </table>
</body></html>`;
}

export function renderDigestText(options: DigestRenderOptions): string {
  const { firstName, widgets, appUrl } = options;
  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  let text = `Good morning, ${firstName}!\n${dateStr}\n\n`;

  for (const w of widgets) {
    if (w.widgetId === "weather" && w.data.temperature) {
      text += `🌤 Weather: ${w.data.temperature}°F, ${w.data.condition}\n`;
    }
    if (w.widgetId === "calendar") {
      const events = (w.data.events as Array<{ title: string }>) || [];
      text += `📅 ${events.length} event${events.length !== 1 ? "s" : ""} today\n`;
    }
    if (w.widgetId === "news") {
      const headlines = (w.data.headlines as Array<{ title: string }>) || [];
      headlines.slice(0, 3).forEach((h, i) => {
        text += `  ${i + 1}. ${h.title}\n`;
      });
    }
  }

  text += `\nView full briefing: ${appUrl}/dashboard\n`;
  text += `Manage preferences: ${appUrl}/settings\n`;

  return text;
}

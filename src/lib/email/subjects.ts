/**
 * Generates personalized email subject lines.
 * Pattern: [Personal data point] + [Curiosity hook]
 * Always <=50 characters for mobile.
 */

interface SubjectData {
  firstName: string;
  temperature?: number;
  condition?: string;
  eventCount?: number;
  sleepScore?: number;
}

const PATTERNS = [
  (d: SubjectData) =>
    d.temperature !== undefined
      ? `${d.firstName}, it's ${d.temperature}° — ${d.condition}`
      : null,
  (d: SubjectData) =>
    d.eventCount !== undefined && d.eventCount > 0
      ? `${d.firstName}, ${d.eventCount} event${d.eventCount > 1 ? "s" : ""} today`
      : null,
  (d: SubjectData) =>
    d.sleepScore !== undefined
      ? `${d.firstName}, sleep score: ${d.sleepScore}`
      : null,
  (d: SubjectData) => `${d.firstName}, your morning briefing is ready`,
  (d: SubjectData) => `Good morning, ${d.firstName}!`,
];

export function generateSubjectLine(data: SubjectData): string {
  // Rotate pattern based on day of week
  const dayOfWeek = new Date().getDay();

  for (let i = 0; i < PATTERNS.length; i++) {
    const idx = (dayOfWeek + i) % PATTERNS.length;
    const result = PATTERNS[idx](data);
    if (result && result.length <= 50) {
      return result;
    }
  }

  // Fallback
  return `Good morning, ${data.firstName}!`;
}

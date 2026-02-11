/**
 * Generates and updates USER-GUIDE.md with current feature documentation
 * and references to auto-captured screenshots.
 * Runs automatically via GitHub Actions on merge to main.
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const ROOT = join(__dirname, "..");
const GUIDE_PATH = join(ROOT, "USER-GUIDE.md");
const SCREENSHOTS_DIR = join(ROOT, "docs", "screenshots");
const SCREENSHOTS_START = "<!-- SCREENSHOTS_START -->";
const SCREENSHOTS_END = "<!-- SCREENSHOTS_END -->";

function getScreenshots(): string[] {
  if (!existsSync(SCREENSHOTS_DIR)) return [];
  return readdirSync(SCREENSHOTS_DIR)
    .filter((f) => f.endsWith(".png"))
    .sort();
}

function buildScreenshotSection(screenshots: string[]): string {
  if (screenshots.length === 0) {
    return "No screenshots captured yet. They will appear here after the first build.\n";
  }

  let section = "";
  const grouped: Record<string, string[]> = {};

  for (const file of screenshots) {
    const match = file.match(/^(.+)-(mobile|desktop)\.png$/);
    if (match) {
      const [, page, viewport] = match;
      if (!grouped[page]) grouped[page] = [];
      grouped[page].push(viewport);
    }
  }

  for (const [page, viewports] of Object.entries(grouped)) {
    const title = page
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    section += `#### ${title}\n\n`;

    for (const viewport of viewports) {
      const filename = `${page}-${viewport}.png`;
      section += `**${viewport.charAt(0).toUpperCase() + viewport.slice(1)}:**\n\n`;
      section += `![${title} - ${viewport}](docs/screenshots/${filename})\n\n`;
    }
  }

  return section;
}

function main() {
  const guide = readFileSync(GUIDE_PATH, "utf-8");

  const startIdx = guide.indexOf(SCREENSHOTS_START);
  const endIdx = guide.indexOf(SCREENSHOTS_END);

  if (startIdx === -1 || endIdx === -1) {
    console.log("Screenshot markers not found in USER-GUIDE.md, skipping.");
    return;
  }

  const screenshots = getScreenshots();
  const screenshotSection = buildScreenshotSection(screenshots);

  const updated =
    guide.substring(0, startIdx + SCREENSHOTS_START.length) +
    "\n\n" +
    screenshotSection +
    "\n" +
    guide.substring(endIdx);

  writeFileSync(GUIDE_PATH, updated);
  console.log(
    `User guide updated with ${screenshots.length} screenshots referenced.`,
  );
}

main();

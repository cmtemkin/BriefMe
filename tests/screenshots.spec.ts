import { test } from "@playwright/test";

const pages = [
  { name: "home", path: "/" },
  { name: "dashboard", path: "/dashboard" },
  { name: "onboarding", path: "/onboarding" },
  { name: "settings", path: "/settings" },
  { name: "changelog", path: "/changelog" },
  { name: "guide", path: "/guide" },
];

const viewports = [
  { name: "mobile", width: 375, height: 812 },
  { name: "desktop", width: 1280, height: 800 },
];

for (const page of pages) {
  for (const viewport of viewports) {
    test(`screenshot: ${page.name} (${viewport.name})`, async ({ page: p }) => {
      await p.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await p.goto(page.path, { waitUntil: "networkidle" });
      await p.screenshot({
        path: `docs/screenshots/${page.name}-${viewport.name}.png`,
        fullPage: true,
      });
    });
  }
}

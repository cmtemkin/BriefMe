import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BriefMe — Your Morning, Personally Curated",
    short_name: "BriefMe",
    description:
      "A configurable morning intelligence dashboard that aggregates weather, calendar, news, health, games, and fun facts into one beautiful digest.",
    start_url: "/",
    display: "standalone",
    background_color: "#1A1A2E",
    theme_color: "#1B3A5C",
    orientation: "portrait-primary",
    categories: ["productivity", "news", "lifestyle"],
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

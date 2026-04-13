import type { MetadataRoute } from "next";

const SITE_URL = "https://meowdiet.com";
const LANDING_PATHS = [
  "/cat-food-amount",
  "/cat-calorie-calculator",
  "/고양이-사료-급여량",
  "/고양이-3kg-사료-급여량",
  "/고양이-5kg-사료-급여량",
  "/중성화-고양이-급여량",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    ...LANDING_PATHS.map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}

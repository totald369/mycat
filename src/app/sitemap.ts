import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { SEO_LANDING_PATHS } from "@/lib/seoLandingPages";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    ...SEO_LANDING_PATHS.map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),
  ];
}

import type { MetadataRoute } from "next";
import { INFO_GUIDE_PATHS } from "@/lib/infoGuidePages";
import { listFeedDetailIds } from "@/lib/feedDetail";
import { SITE_URL } from "@/lib/seo";
import { SEO_LANDING_PATHS } from "@/lib/seoLandingPages";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const feedDetailPaths = listFeedDetailIds().map((id) => `/foods/${id}`);

  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/feed-find`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.92,
    },
    ...INFO_GUIDE_PATHS.map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...SEO_LANDING_PATHS.map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),
    ...feedDetailPaths.map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}

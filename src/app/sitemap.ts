import type { MetadataRoute } from "next";
import { INFO_GUIDE_PATHS } from "@/lib/infoGuidePages";
import { listFeedDetailSlugs } from "@/lib/feedDetail";
import { SITE_URL, siteContentModifiedDate } from "@/lib/seo";
import { SEO_LANDING_PATHS } from "@/lib/seoLandingPages";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = siteContentModifiedDate();
  const feedDetailPaths = listFeedDetailSlugs().map((slug) => `/foods/${slug}`);

  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/foods`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/feed-find`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.92,
    },
    ...INFO_GUIDE_PATHS.map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...SEO_LANDING_PATHS.map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),
    ...feedDetailPaths.map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}

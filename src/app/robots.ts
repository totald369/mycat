import type { MetadataRoute } from "next";
import { ROBOTS_DISALLOW, SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [...ROBOTS_DISALLOW],
      },
      {
        userAgent: "Yeti",
        allow: "/",
        disallow: [...ROBOTS_DISALLOW],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [...ROBOTS_DISALLOW],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/사료-찾기",
        destination: "/feed-find",
        permanent: true,
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 31,
    qualities: [58, 62, 64, 68, 72],
    deviceSizes: [360, 390, 428, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [
      16, 32, 48, 64, 96, 128, 176, 200, 219, 242, 256, 300, 384,
    ],
  },
  experimental: {
    optimizePackageImports: ["lottie-react", "html-to-image"],
    /** Vercel 서버리스에서 prisma/cat_food.csv 누락 방지 */
    outputFileTracingIncludes: {
      "/api/feeds": ["./prisma/cat_food.csv"],
      "/feed-find": ["./prisma/cat_food.csv"],
      "/foods/[slug]": ["./prisma/cat_food.csv"],
      "/foods": ["./prisma/cat_food.csv"],
    },
  },
};

export default nextConfig;

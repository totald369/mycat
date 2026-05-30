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
    deviceSizes: [360, 390, 428, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [
      16, 32, 48, 64, 96, 128, 176, 200, 219, 242, 256, 300, 384,
    ],
  },
  experimental: {
    optimizePackageImports: ["lottie-react", "html-to-image"],
  },
};

export default nextConfig;

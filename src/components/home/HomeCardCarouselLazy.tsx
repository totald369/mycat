"use client";

import dynamic from "next/dynamic";

const HomeCardCarousel = dynamic(
  () =>
    import("@/components/design/HomeCardCarousel").then((m) => ({
      default: m.HomeCardCarousel,
    })),
  {
    ssr: false,
    loading: () => (
      <div
        className="mx-auto h-[230px] w-full max-w-[min(327px,100%)] overflow-hidden"
        aria-hidden
      />
    ),
  },
);

export function HomeCardCarouselLazy() {
  return <HomeCardCarousel />;
}

"use client";

import { InfiniteMarquee } from "@/components/ui/InfiniteMarquee";
import { HOME_FEATURE_CARDS } from "@/data/homeFeatureCards";

export function HomeCardCarousel() {
  return (
    <InfiniteMarquee
      items={HOME_FEATURE_CARDS}
      cardWidth={220}
      gap={16}
      durationSec={15}
      className="px-6"
      renderItem={(c) => (
        <article
          className={`flex h-[245px] w-full flex-col justify-between gap-3 overflow-hidden rounded-[24px] px-6 py-5 ${c.className}`}
        >
          <div
            className="mx-auto flex size-16 shrink-0 items-center justify-center"
            aria-hidden
          >
            <img
              src={c.icon}
              alt=""
              width={64}
              height={64}
              className="h-16 w-16 object-contain"
              draggable={false}
            />
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-2 text-center">
            <h2 className="shrink-0 font-display text-xl leading-5 text-[#2f342a]">
              {c.title}
            </h2>
            <p className="line-clamp-4 min-h-0 text-base leading-[1.2] text-black/70">
              {c.body}
            </p>
          </div>
        </article>
      )}
    />
  );
}

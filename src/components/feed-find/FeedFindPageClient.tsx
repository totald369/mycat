"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { FeedFindHeader } from "@/components/feed-find/FeedFindHeader";
import { FeedFindPageView } from "@/components/feed-find/FeedFindPageView";
import { wizardHeaderOffsetClass } from "@/components/design/wizardLayoutClasses";
import type { CatalogItem } from "@/components/wireframe/CatalogSearchModal";
import { getFoodDetailPathSegment } from "@/lib/feedSafeValues";

type Props = {
  intro?: ReactNode;
  initialCatalog?: CatalogItem[];
};

/** Figma 306:12129 — 공통 헤더 + 사료 찾기 리스트 */
export function FeedFindPageClient({ intro, initialCatalog }: Props) {
  const router = useRouter();

  const goToFeedDetail = (item: CatalogItem) => {
    const path = getFoodDetailPathSegment(item);
    if (!path) return;
    router.push(`/foods/${encodeURIComponent(path)}`);
  };

  return (
    <main className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-[min(100%,375px)] flex-col overflow-hidden bg-white">
      <FeedFindHeader />
      <div
        className={`flex min-h-0 flex-1 flex-col items-center gap-6 overflow-y-auto px-6 pb-[max(2rem,env(safe-area-inset-bottom))] ${wizardHeaderOffsetClass}`}
      >
        {intro}
        <FeedFindPageView
          onOpenDetail={goToFeedDetail}
          initialCatalog={initialCatalog}
        />
      </div>
    </main>
  );
}

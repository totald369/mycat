"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { FeedFindPageView } from "@/components/feed-find/FeedFindPageView";
import { WizardHeader } from "@/components/design/WizardHeader";
import { wizardHeaderOffsetClass } from "@/components/design/wizardLayoutClasses";
import type { CatalogItem } from "@/components/wireframe/CatalogSearchModal";

type Props = {
  intro?: ReactNode;
  initialCatalog?: CatalogItem[];
};

/** 피그마 사료 찾기(321:91) — 공통 헤더 + 탐색형 사료 목록 */
export function FeedFindPageClient({ intro, initialCatalog }: Props) {
  const router = useRouter();

  const goToFeedDetail = (item: CatalogItem) => {
    router.push(`/foods/${encodeURIComponent(item.id)}`);
  };

  return (
    <main className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-[min(100%,375px)] flex-col overflow-hidden bg-white">
      <WizardHeader />
      <div
        className={`flex min-h-0 flex-1 flex-col ${wizardHeaderOffsetClass}`}
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

"use client";

import { useRouter } from "next/navigation";

import { WizardHeader } from "@/components/design/WizardHeader";
import { wizardHeaderOffsetClass } from "@/components/design/wizardLayoutClasses";
import type { CatalogItem } from "@/components/wireframe/CatalogSearchModal";
import { FeedSearchView } from "@/components/wireframe/FeedSearchView";

/** 피그마 사료 찾기(321:91) — 공통 헤더 + SearchList_basic */
export function FeedFindPageClient() {
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
        <FeedSearchView layout="page" onSelect={goToFeedDetail} />
      </div>
    </main>
  );
}

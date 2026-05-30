import Link from "next/link";
import type { ReactNode } from "react";

import type { FeedDetailItem } from "@/lib/catFoodCsv";
import {
  feedCategoryLabel,
  feedConditionLabel,
  feedTypeLabel,
  formatServingGrams,
  lifeStageLabel,
} from "@/lib/feedDetailLabels";
import { IconBack } from "@/components/wireframe/icons";

type Props = {
  feed: FeedDetailItem;
};

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex shrink-0 rounded-lg border border-solid border-[#eee] bg-white px-3 py-1.5 text-sm font-semibold leading-normal tracking-[0.1px] text-[#333]">
      {children}
    </span>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-[#f5f1ed] p-4">
      <span className="text-sm font-normal text-[#555]">{label}</span>
      <span className="text-base font-semibold leading-normal text-[#171717]">
        {value}
      </span>
    </div>
  );
}

export function FeedDetailView({ feed }: Props) {
  const typeLabel = feedTypeLabel(feed.rawType, feed.feedKind);
  const lifeLabel = lifeStageLabel(feed.lifeStage);
  const categoryLabel = feedCategoryLabel(feed.category);
  const conditionLabel = feedConditionLabel(feed.feedCondition);
  const servingLabel = formatServingGrams(feed.servingGrams, feed.feedKind);

  return (
    <main className="relative z-10 mx-auto min-h-[100dvh] w-full max-w-[min(100%,375px)] bg-white">
      <div className="flex shrink-0 items-center px-4 pt-[max(8px,env(safe-area-inset-top))]">
        <Link
          href="/feed-find"
          aria-label="사료 찾기로 돌아가기"
          className="relative flex size-12 shrink-0 items-center justify-center text-[#171717]"
        >
          <IconBack />
        </Link>
        <p className="flex-1 text-center text-base font-semibold text-[#171717]">
          사료 상세 정보
        </p>
        <span className="size-12 shrink-0" aria-hidden />
      </div>

      <div className="px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-2">
        <header className="space-y-1">
          <p className="text-sm font-normal text-[#555]">{feed.brand}</p>
          <h1 className="text-xl font-bold leading-tight text-[#171717]">
            {feed.name}
          </h1>
        </header>

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge>{typeLabel}</Badge>
          <Badge>{lifeLabel}</Badge>
          <Badge>{categoryLabel}</Badge>
          <Badge>{conditionLabel}</Badge>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <InfoCard
            label="100g당 칼로리"
            value={`${feed.kcalPer100g} kcal`}
          />
          <InfoCard label="기준 급여량" value={servingLabel} />
          <InfoCard label="사료 유형" value={typeLabel} />
          <InfoCard label="급여 대상" value={lifeLabel} />
        </div>

        <section className="mt-8 rounded-xl bg-[#f8f5f2] p-4">
          <p className="text-sm leading-relaxed text-[#555]">
            이 사료는 100g당 칼로리 기준으로 급여량 계산에 사용됩니다. 실제
            급여량은 고양이의 체중, 활동량, 체형에 따라 달라질 수 있어요.
          </p>
        </section>

        <section className="mt-6 space-y-2">
          <h2 className="text-base font-semibold text-[#171717]">성분 정보</h2>
          <p className="text-sm leading-relaxed text-[#555]">
            상세 성분 정보는 준비 중이에요. 우선 칼로리와 급여 기준량을
            기준으로 계산할 수 있어요.
          </p>
        </section>
      </div>
    </main>
  );
}

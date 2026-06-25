import Link from "next/link";
import type { ReactNode } from "react";

import { SeoFaqSection } from "@/components/seo/SeoFaqSection";
import { SeoInternalLinksSection } from "@/components/seo/SeoInternalLinksSection";
import type { FeedDetailItem } from "@/lib/catFoodCsv";
import type { RelatedFeedLink } from "@/lib/feedDetail";
import { getFeedDetailPath } from "@/lib/feedDetail";
import {
  feedCategoryLabel,
  feedConditionLabel,
  feedTypeLabel,
  formatFeedServing,
  lifeStageLabel,
} from "@/lib/feedDetailLabels";
import { formatKcalPer100gLabel, safeString } from "@/lib/feedSafeValues";
import type { NutritionInterpretation } from "@/lib/feedNutritionInterpretation";
import type { FaqItem } from "@/lib/seo";
import type { FeedSeoBoostContentData } from "@/lib/feedSeoBoostTypes";
import { IconAutoText, IconBack, IconSparkles } from "@/components/wireframe/icons";

type Props = {
  feed: FeedDetailItem;
  /** 메타·JSON-LD 전용 — 화면에는 렌더하지 않음 */
  seoDescription?: string;
  recommendedTargets?: string[];
  nutritionInterpretations?: NutritionInterpretation[];
  relatedFeedLinks?: RelatedFeedLink[];
  faqs?: FaqItem[];
  seoBoostContent?: FeedSeoBoostContentData | null;
};

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex shrink-0 rounded-lg border border-solid border-[#eee] bg-white px-3 py-1.5 text-sm font-semibold leading-normal tracking-[0.1px] text-[#333]">
      {children}
    </span>
  );
}

function TargetBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex shrink-0 rounded-full bg-[#fff3eb] px-3 py-1 text-sm font-medium text-[#c44a00]">
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

function RelatedFeedList({
  title,
  links,
}: {
  title: string;
  links: RelatedFeedLink[];
}) {
  if (links.length === 0) return null;
  const headingId = title.replace(/\s+/g, "-").toLowerCase();

  return (
    <section className="mt-6 space-y-3" aria-labelledby={headingId}>
      <h2 id={headingId} className="text-base font-semibold text-[#171717]">
        {title}
      </h2>
      <ul className="grid gap-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              prefetch={false}
              className="flex items-center justify-between gap-3 rounded-xl border border-[#eee] bg-white px-4 py-3 active:bg-[#f5f1ed]"
            >
              <span className="min-w-0 text-sm font-medium text-[#171717]">
                {link.label}
              </span>
              {link.reasonLabel ? (
                <span className="shrink-0 text-xs text-[#999]">
                  {link.reasonLabel}
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function FeedGuideSection({
  content,
}: {
  content: FeedSeoBoostContentData;
}) {
  const isOpenAi = content.source === "openai";

  return (
    <section className="mt-6 space-y-5" aria-labelledby="feed-guide-heading">
      <div className="flex flex-wrap items-center gap-2">
        {isOpenAi ? (
          <IconSparkles className="size-4 shrink-0 text-[#f8620c]" />
        ) : (
          <IconAutoText className="size-4 shrink-0 text-[#999]" />
        )}
        <h2
          id="feed-guide-heading"
          className="text-base font-semibold text-[#171717]"
        >
          사료 안내
        </h2>
        {isOpenAi ? (
          <span className="rounded-full bg-[#fff3eb] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#c44a00]">
            AI
          </span>
        ) : null}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-[#171717]">
            이 사료는 이런 고양이에게 추천해요
          </h3>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-[#444]">
            {content.recommendedFor.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-[#171717]">
            급여 전 참고할 점
          </h3>
          <p className="text-sm leading-relaxed text-[#444]">
            {content.feedingNotes}
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-[#171717]">
            비슷한 사료와 비교 포인트
          </h3>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-[#444]">
            {content.comparisonPoints.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function FeedDetailView({
  feed,
  recommendedTargets = [],
  nutritionInterpretations = [],
  relatedFeedLinks = [],
  faqs = [],
  seoBoostContent = null,
}: Props) {
  const brand = safeString(feed.brand).trim() || "—";
  const name = safeString(feed.name).trim() || "이름 없음";
  const typeLabel = feedTypeLabel(feed.rawType, feed.feedKind);
  const lifeLabel = lifeStageLabel(feed.lifeStage);
  const categoryLabel = feedCategoryLabel(feed.category);
  const conditionLabel = feedConditionLabel(feed.feedCondition);
  const servingDisplay = formatFeedServing(feed);
  const kcalLabel = formatKcalPer100gLabel(feed.kcalPer100g);
  const pagePath = getFeedDetailPath(feed);

  const badgeLabels = [typeLabel, lifeLabel, categoryLabel, conditionLabel].filter(
    (label) => label && label !== "—",
  );

  const hasNutritionAnalysis = Boolean(safeString(feed.nutritionAnalysis).trim());
  const hasIngredients = Boolean(safeString(feed.ingredients).trim());
  const hasNutritionContent = hasNutritionAnalysis || hasIngredients;

  const showRecommendedTargets =
    !seoBoostContent && recommendedTargets.length > 0;

  return (
    <main className="relative z-10 mx-auto min-h-[100dvh] w-full max-w-[min(100%,375px)] bg-white">
      <div className="flex shrink-0 items-center px-4 pt-[max(8px,env(safe-area-inset-top))]">
        <Link
          href="/foods"
          aria-label="사료 목록으로 돌아가기"
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
        <header className="space-y-2">
          <p className="text-sm font-normal text-[#555]">{brand}</p>
          <h1 className="text-xl font-bold leading-tight text-[#171717]">
            {name}
          </h1>
        </header>

        {badgeLabels.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {badgeLabels.map((label) => (
              <Badge key={label}>{label}</Badge>
            ))}
          </div>
        ) : null}

        <section className="mt-5 space-y-3" aria-labelledby="feed-kcal-heading">
          <h2
            id="feed-kcal-heading"
            className="text-base font-semibold text-[#171717]"
          >
            칼로리·급여 기준
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label="100g당 칼로리" value={kcalLabel} />
            <InfoCard label={servingDisplay.label} value={servingDisplay.value} />
          </div>
        </section>

        <section className="mt-5 rounded-xl bg-[#f8f5f2] p-4">
          <p className="text-sm leading-relaxed text-[#555]">
            표기된 급여량은 참고값이며, 체중·활동량에 따라 달라질 수 있어요.
          </p>
          <Link
            href="/step1"
            prefetch={false}
            className="mt-4 flex h-12 items-center justify-center rounded-xl bg-[#f8620c] text-sm font-semibold text-white"
          >
            이 사료로 급여량 계산하기
          </Link>
        </section>

        {showRecommendedTargets ? (
          <section className="mt-6 space-y-2" aria-labelledby="feed-targets-heading">
            <h2
              id="feed-targets-heading"
              className="text-base font-semibold text-[#171717]"
            >
              추천 대상
            </h2>
            <div className="flex flex-wrap gap-2">
              {recommendedTargets.map((target) => (
                <TargetBadge key={target}>{target}</TargetBadge>
              ))}
            </div>
          </section>
        ) : null}

        {seoBoostContent ? (
          <FeedGuideSection content={seoBoostContent} />
        ) : null}

        <section className="mt-6 space-y-3" aria-labelledby="feed-nutrition-heading">
          <h2
            id="feed-nutrition-heading"
            className="text-base font-semibold text-[#171717]"
          >
            성분 정보
          </h2>
          {hasNutritionAnalysis ? (
            <div className="rounded-xl bg-[#f8f5f2] p-4">
              <p className="text-xs font-semibold text-[#666]">등록성분량</p>
              <p className="mt-1 text-sm leading-relaxed text-[#171717]">
                {safeString(feed.nutritionAnalysis).trim()}
              </p>
            </div>
          ) : null}
          {hasIngredients ? (
            <div className="rounded-xl border border-[#eee] bg-white p-4">
              <p className="text-xs font-semibold text-[#666]">원재료</p>
              <p className="mt-1 text-sm leading-relaxed text-[#555]">
                {safeString(feed.ingredients).trim()}
              </p>
            </div>
          ) : null}
          {!hasNutritionContent ? (
            <p className="text-sm leading-relaxed text-[#555]">
              상세 성분 정보는 준비 중이에요.
            </p>
          ) : null}

          {nutritionInterpretations.length > 0 ? (
            <div className="space-y-3 pt-1">
              <h3 className="text-sm font-semibold text-[#171717]">성분 해석</h3>
              <ul className="space-y-3">
                {nutritionInterpretations.map((item) => (
                  <li
                    key={item.metric.label}
                    className="rounded-xl border border-[#eee] bg-white p-4"
                  >
                    <p className="text-sm font-semibold text-[#171717]">
                      {item.metric.label} {item.metric.value}
                      {item.metric.unit} →
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-[#555]">
                      {item.interpretation}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        <RelatedFeedList title="관련 사료" links={relatedFeedLinks} />

        {faqs.length > 0 ? (
          <SeoFaqSection faqs={faqs} className="mt-8" title="자주 묻는 질문" />
        ) : null}

        <SeoInternalLinksSection
          currentPath={pagePath}
          title="관련 가이드"
          links={[
            { href: "/step1", label: "급여량 계산하기" },
            { href: "/feed-find", label: "사료 찾기" },
            { href: "/feeding-guide", label: "급여 가이드" },
            { href: "/calorie-guide", label: "칼로리 가이드" },
            { href: "/고양이-건식-습식-급여량", label: "건식·습식 급여량" },
            { href: "/고양이-사료-바꿀때-급여량", label: "사료 바꿀 때 급여량" },
          ]}
          className="mt-8"
        />
      </div>
    </main>
  );
}

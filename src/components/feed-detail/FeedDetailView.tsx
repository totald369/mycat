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
  formatServingGrams,
  lifeStageLabel,
} from "@/lib/feedDetailLabels";
import { formatKcalPer100gLabel, safeString } from "@/lib/feedSafeValues";
import type { NutritionInterpretation } from "@/lib/feedNutritionInterpretation";
import type { FaqItem } from "@/lib/seo";
import { IconBack } from "@/components/wireframe/icons";

type Props = {
  feed: FeedDetailItem;
  seoDescription?: string;
  recommendedTargets?: string[];
  nutritionInterpretations?: NutritionInterpretation[];
  relatedByBrand?: RelatedFeedLink[];
  relatedByPurpose?: RelatedFeedLink[];
  relatedByKcal?: RelatedFeedLink[];
  relatedByLifeStage?: RelatedFeedLink[];
  relatedFeedLinks?: RelatedFeedLink[];
  faqs?: FaqItem[];
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
              className="block rounded-xl border border-[#eee] bg-white px-4 py-3 text-sm font-medium text-[#171717] active:bg-[#f5f1ed]"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function FeedDetailView({
  feed,
  seoDescription,
  recommendedTargets = [],
  nutritionInterpretations = [],
  relatedByBrand = [],
  relatedByPurpose = [],
  relatedByKcal = [],
  relatedByLifeStage = [],
  relatedFeedLinks = [],
  faqs = [],
}: Props) {
  const brand = safeString(feed.brand).trim() || "—";
  const name = safeString(feed.name).trim() || "이름 없음";
  const typeLabel = feedTypeLabel(feed.rawType, feed.feedKind);
  const lifeLabel = lifeStageLabel(feed.lifeStage);
  const categoryLabel = feedCategoryLabel(feed.category);
  const conditionLabel = feedConditionLabel(feed.feedCondition);
  const servingLabel = formatServingGrams(feed.servingGrams);
  const kcalLabel = formatKcalPer100gLabel(feed.kcalPer100g);
  const pagePath = getFeedDetailPath(feed);

  const badgeLabels = [typeLabel, lifeLabel, categoryLabel, conditionLabel].filter(
    (label) => label && label !== "—",
  );

  const hasNutritionAnalysis = Boolean(safeString(feed.nutritionAnalysis).trim());
  const hasIngredients = Boolean(safeString(feed.ingredients).trim());
  const hasNutritionContent = hasNutritionAnalysis || hasIngredients;

  const internalFeedLinks =
    relatedFeedLinks.length > 0
      ? relatedFeedLinks
      : [...relatedByPurpose, ...relatedByBrand, ...relatedByLifeStage, ...relatedByKcal].filter(
          (link, i, arr) => arr.findIndex((l) => l.href === link.href) === i,
        );

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
            {brand} {name} 칼로리 정보
          </h1>
        </header>

        {seoDescription ? (
          <p className="mt-4 text-sm leading-relaxed text-[#444]">{seoDescription}</p>
        ) : null}

        {badgeLabels.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {badgeLabels.map((label) => (
              <Badge key={label}>{label}</Badge>
            ))}
          </div>
        ) : null}

        {recommendedTargets.length > 0 ? (
          <section className="mt-5 space-y-2" aria-labelledby="feed-targets-heading">
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

        <section className="mt-6 space-y-3" aria-labelledby="feed-kcal-heading">
          <h2
            id="feed-kcal-heading"
            className="text-base font-semibold text-[#171717]"
          >
            칼로리·급여 기준
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label="100g당 칼로리" value={kcalLabel} />
            <InfoCard label="기준 급여량" value={servingLabel} />
            <InfoCard label="사료 유형" value={typeLabel} />
            <InfoCard label="급여 대상" value={lifeLabel} />
          </div>
        </section>

        <section className="mt-8 rounded-xl bg-[#f8f5f2] p-4">
          <p className="text-sm leading-relaxed text-[#555]">
            이 사료는 100g당 칼로리 기준으로 급여량 계산에 사용됩니다. 실제
            급여량은 고양이의 체중, 활동량, 체형에 따라 달라질 수 있어요.
          </p>
          <Link
            href="/step1"
            prefetch={false}
            className="mt-4 flex h-12 items-center justify-center rounded-xl bg-[#f8620c] text-sm font-semibold text-white"
          >
            이 사료로 급여량 계산하기
          </Link>
        </section>

        <section className="mt-6 space-y-3">
          <h2 className="text-base font-semibold text-[#171717]">성분 정보</h2>
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
        </section>

        {nutritionInterpretations.length > 0 ? (
          <section className="mt-6 space-y-3" aria-labelledby="nutrition-interpret">
            <h2
              id="nutrition-interpret"
              className="text-base font-semibold text-[#171717]"
            >
              성분 해석
            </h2>
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
          </section>
        ) : null}

        {internalFeedLinks.length > 0 ? (
          <RelatedFeedList title="관련 사료" links={internalFeedLinks} />
        ) : null}

        <RelatedFeedList title="같은 브랜드 사료" links={relatedByBrand} />
        <RelatedFeedList title="같은 목적·기능 사료" links={relatedByPurpose} />
        <RelatedFeedList title="비슷한 칼로리 사료" links={relatedByKcal} />
        <RelatedFeedList title="같은 연령대 사료" links={relatedByLifeStage} />

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

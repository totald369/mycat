import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { SeoFaqSection } from "@/components/seo/SeoFaqSection";
import { SeoInternalLinksSection } from "@/components/seo/SeoInternalLinksSection";
import type { FeedDetailItem } from "@/lib/catFoodCsv";
import type { RelatedFeedLink } from "@/lib/feedDetail";
import { getFeedDetailPath } from "@/lib/feedDetail";
import {
  feedCategoryLabel,
  feedTypeLabel,
  lifeStageLabel,
} from "@/lib/feedDetailLabels";
import { safeNumber, safeString } from "@/lib/feedSafeValues";
import type { NutritionInterpretation } from "@/lib/feedNutritionInterpretation";
import type { FaqItem } from "@/lib/seo";
import type { FeedSeoBoostContentData } from "@/lib/feedSeoBoostTypes";
import { IconBack } from "@/components/wireframe/icons";

const GUIDE_ICONS = {
  recommend: "/icons/feed-detail/recommend.svg",
  feedingNotes: "/icons/feed-detail/feeding-notes.svg",
  comparison: "/icons/feed-detail/comparison.svg",
} as const;

type Props = {
  feed: FeedDetailItem;
  /** 메타·JSON-LD 전용 — 화면에는 렌더하지 않음 */
  seoDescription?: string;
  recommendedTargets?: string[];
  nutritionInterpretations?: NutritionInterpretation[];
  relatedByBrand?: RelatedFeedLink[];
  relatedByPurpose?: RelatedFeedLink[];
  relatedByKcal?: RelatedFeedLink[];
  relatedByLifeStage?: RelatedFeedLink[];
  faqs?: FaqItem[];
  seoBoostContent?: FeedSeoBoostContentData | null;
};

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-[35px] shrink-0 items-center rounded-lg border border-[#eee] bg-white px-[13px] py-[7px] text-sm font-semibold tracking-[0.1px] text-[#333]">
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

function SectionHeading({
  children,
  variant = "primary",
  id,
}: {
  children: ReactNode;
  variant?: "primary" | "secondary";
  id?: string;
}) {
  return (
    <h2
      id={id}
      className={
        variant === "primary"
          ? "text-lg font-bold leading-6 text-[#171717]"
          : "text-base font-semibold leading-6 text-[#171717]"
      }
    >
      {children}
    </h2>
  );
}

function MetricCard({
  label,
  children,
  variant = "numeric",
}: {
  label: string;
  children: ReactNode;
  variant?: "numeric" | "text";
}) {
  return (
    <div
      className={
        variant === "numeric"
          ? "flex h-[100px] w-full flex-col justify-between rounded-xl bg-[#f9f9f9] px-4 pb-6 pt-4"
          : "flex h-[100px] w-full flex-col justify-between rounded-xl bg-[#f9f9f9] p-4"
      }
    >
      <p className="w-full text-sm leading-5 text-[#111]">{label}</p>
      <div className="w-full">{children}</div>
    </div>
  );
}

function KcalValue({ kcalPer100g }: { kcalPer100g: unknown }) {
  const n = safeNumber(kcalPer100g);
  const display =
    n == null ? "—" : Number.isInteger(n) ? String(n) : String(Math.round(n * 10) / 10);

  return (
    <div className="flex w-full items-center justify-end gap-0.5">
      <span className="text-2xl font-bold leading-6 text-[#171717]">{display}</span>
      <span className="pt-2 text-base font-light leading-none text-[#171717]">kcal</span>
    </div>
  );
}

function ServingGuideValue({
  feed,
}: {
  feed: FeedDetailItem;
}) {
  const isWet = feed.feedKind === "습식" || feed.rawType === "wet";
  const servingG = safeNumber(feed.servingGrams);
  const guideG = safeNumber(feed.servingGuideGrams);
  const weightKg = safeNumber(feed.servingGuideWeightKg) ?? 4;

  if (isWet && servingG != null) {
    const display = Number.isInteger(servingG)
      ? String(servingG)
      : String(Math.round(servingG * 10) / 10);
    return (
      <div className="flex w-full items-center justify-end gap-0.5">
        <span className="text-2xl font-bold leading-6 text-[#171717]">{display}</span>
        <span className="pt-2 text-base font-light leading-none text-[#171717]">g</span>
      </div>
    );
  }

  if (guideG != null) {
    const display = Number.isInteger(guideG)
      ? String(guideG)
      : String(Math.round(guideG * 10) / 10);
    const weightDisplay = Number.isInteger(weightKg)
      ? String(weightKg)
      : String(Math.round(weightKg * 10) / 10);
    return (
      <div className="flex w-full items-end gap-px">
        <span className="shrink-0 pb-0.5 text-base font-light leading-none text-[#888]">
          {weightDisplay}kg당
        </span>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-0.5">
          <span className="text-2xl font-bold leading-6 text-[#171717]">{display}</span>
          <span className="pt-2 text-base font-light leading-none text-[#171717]">g</span>
        </div>
      </div>
    );
  }

  return (
    <p className="w-full text-right text-lg font-bold leading-6 text-[#171717]">준비 중</p>
  );
}

function GuideIconSection({
  iconSrc,
  title,
  children,
}: {
  iconSrc: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 pt-2">
      <div className="flex flex-wrap items-center gap-1">
        <Image
          src={iconSrc}
          alt=""
          width={32}
          height={32}
          className="size-8 shrink-0"
          unoptimized
        />
        <SectionHeading>{title}</SectionHeading>
      </div>
      {children}
    </section>
  );
}

function RelatedFeedList({
  title,
  links,
  variant = "primary",
}: {
  title: string;
  links: RelatedFeedLink[];
  variant?: "primary" | "secondary";
}) {
  if (links.length === 0) return null;
  const headingId = title.replace(/\s+/g, "-").toLowerCase();

  return (
    <section className="flex flex-col gap-3 pt-2" aria-labelledby={headingId}>
      <SectionHeading id={headingId} variant={variant}>
        {title}
      </SectionHeading>
      <ul className="flex flex-col gap-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              prefetch={false}
              className="block rounded-xl border border-[#eee] bg-white px-[17px] py-[13px] text-sm font-medium leading-5 text-[#171717] active:bg-[#f9f9f9]"
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
  recommendedTargets = [],
  nutritionInterpretations = [],
  relatedByBrand = [],
  relatedByPurpose = [],
  relatedByKcal = [],
  relatedByLifeStage = [],
  faqs = [],
  seoBoostContent = null,
}: Props) {
  const brand = safeString(feed.brand).trim() || "—";
  const name = safeString(feed.name).trim() || "이름 없음";
  const typeLabel = feedTypeLabel(feed.rawType, feed.feedKind);
  const lifeLabel = lifeStageLabel(feed.lifeStage);
  const categoryLabel = feedCategoryLabel(feed.category);
  const pagePath = getFeedDetailPath(feed);
  const isWet = feed.feedKind === "습식" || feed.rawType === "wet";

  const badgeLabels = [typeLabel, lifeLabel, categoryLabel].filter(
    (label) => label && label !== "—",
  );

  const hasNutritionAnalysis = Boolean(safeString(feed.nutritionAnalysis).trim());
  const hasIngredients = Boolean(safeString(feed.ingredients).trim());
  const hasNutritionContent = hasNutritionAnalysis || hasIngredients;

  const servingCardLabel = isWet ? "1팩·1캔 기준" : "기준 급여량";

  return (
    <main className="relative z-10 mx-auto min-h-[100dvh] w-full max-w-[min(100%,375px)] bg-white">
      <div className="flex h-14 shrink-0 items-center px-4 pt-[max(8px,env(safe-area-inset-top))]">
        <Link
          href="/foods"
          aria-label="사료 목록으로 돌아가기"
          className="relative flex size-12 shrink-0 items-center justify-center text-[#171717]"
        >
          <IconBack />
        </Link>
        <p className="flex-1 text-center text-base font-semibold leading-6 text-[#171717]">
          사료 상세 정보
        </p>
        <span className="size-12 shrink-0" aria-hidden />
      </div>

      <div className="flex flex-col gap-6 px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-2">
        <header className="flex flex-col gap-2">
          <p className="text-sm leading-5 text-[#555]">{brand}</p>
          <h1 className="text-2xl font-bold leading-[25px] text-[#171717]">{name}</h1>
          {badgeLabels.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {badgeLabels.map((label) => (
                <Badge key={label}>{label}</Badge>
              ))}
            </div>
          ) : null}
        </header>

        {!seoBoostContent && recommendedTargets.length > 0 ? (
          <section className="flex flex-col gap-2" aria-labelledby="feed-targets-heading">
            <SectionHeading id="feed-targets-heading">추천 대상</SectionHeading>
            <div className="flex flex-wrap gap-2">
              {recommendedTargets.map((target) => (
                <TargetBadge key={target}>{target}</TargetBadge>
              ))}
            </div>
          </section>
        ) : null}

        <section className="flex flex-col gap-3 pt-2" aria-labelledby="feed-kcal-heading">
          <SectionHeading id="feed-kcal-heading">칼로리·급여 기준</SectionHeading>
          <div className="grid grid-cols-2 gap-2">
            <MetricCard label="100g당 칼로리">
              <KcalValue kcalPer100g={feed.kcalPer100g} />
            </MetricCard>
            <MetricCard label={servingCardLabel}>
              <ServingGuideValue feed={feed} />
            </MetricCard>
            <MetricCard label="사료 유형" variant="text">
              <p className="w-full text-right text-lg font-bold leading-6 text-[#171717]">
                {typeLabel}
              </p>
            </MetricCard>
            <MetricCard label="급여 대상" variant="text">
              <p className="w-full text-right text-lg font-bold leading-6 text-[#171717]">
                {lifeLabel}
              </p>
            </MetricCard>
          </div>
        </section>

        <div className="flex flex-col gap-1">
          <p className="text-center text-xs leading-[22.75px] text-[#555]">
            100g당 칼로리 기준으로 급여량이 계산됩니다
          </p>
          <Link
            href="/step1"
            prefetch={false}
            className="flex h-12 items-center justify-center rounded-xl bg-[#f8620c] text-sm font-semibold leading-5 text-white"
          >
            이 사료로 급여량 계산하기
          </Link>
        </div>

        <section className="flex flex-col gap-3 pt-2" aria-labelledby="feed-nutrition-heading">
          <SectionHeading id="feed-nutrition-heading">성분 정보</SectionHeading>
          {hasNutritionAnalysis ? (
            <div className="flex flex-col gap-1 rounded-xl bg-[#f9f9f9] p-4">
              <p className="text-xs font-semibold leading-4 text-[#666]">등록성분량</p>
              <p className="text-sm font-bold leading-[22.75px] text-[#171717]">
                {safeString(feed.nutritionAnalysis).trim()}
              </p>
            </div>
          ) : null}
          {hasIngredients ? (
            <div className="rounded-xl border border-[#eee] bg-white p-[17px]">
              <p className="text-xs font-semibold leading-4 text-[#666]">원재료</p>
              <p className="mt-1 text-sm leading-[22.75px] text-[#555]">
                {safeString(feed.ingredients).trim()}
              </p>
            </div>
          ) : null}
          {!hasNutritionContent ? (
            <p className="text-sm leading-[22.75px] text-[#555]">
              상세 성분 정보는 준비 중이에요.
            </p>
          ) : null}
        </section>

        {seoBoostContent ? (
          <>
            <GuideIconSection
              iconSrc={GUIDE_ICONS.recommend}
              title="이런 고양이에게 추천해요"
            >
              <ul className="list-disc space-y-1 pl-5 text-sm leading-[22.75px] text-[#444]">
                {seoBoostContent.recommendedFor.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </GuideIconSection>

            <GuideIconSection
              iconSrc={GUIDE_ICONS.feedingNotes}
              title="급여 전 참고할 점"
            >
              <p className="text-sm leading-[22.75px] text-[#444]">
                {seoBoostContent.feedingNotes}
              </p>
            </GuideIconSection>

            <GuideIconSection
              iconSrc={GUIDE_ICONS.comparison}
              title="비슷한 사료와 비교 포인트"
            >
              <ul className="list-disc space-y-1 pl-5 text-sm leading-[22.75px] text-[#444]">
                {seoBoostContent.comparisonPoints.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </GuideIconSection>
          </>
        ) : null}

        {nutritionInterpretations.length > 0 ? (
          <section className="flex flex-col gap-3 pt-2" aria-labelledby="nutrition-interpret">
            <SectionHeading id="nutrition-interpret">성분 해석</SectionHeading>
            <ul className="flex flex-col gap-3">
              {nutritionInterpretations.map((item) => (
                <li
                  key={item.metric.label}
                  className="rounded-xl border border-[#eee] bg-white p-[17px]"
                >
                  <p className="text-sm font-semibold leading-5 text-[#171717]">
                    {item.metric.label} {item.metric.value}
                    {item.metric.unit} →
                  </p>
                  <p className="mt-1 text-sm leading-[22.75px] text-[#555]">
                    {item.interpretation}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <RelatedFeedList
          title="같은 브랜드 사료"
          links={relatedByBrand}
          variant="secondary"
        />
        <RelatedFeedList
          title="같은 목적·기능 사료"
          links={relatedByPurpose}
          variant="secondary"
        />
        <RelatedFeedList
          title="비슷한 칼로리 사료"
          links={relatedByKcal}
          variant="secondary"
        />
        <RelatedFeedList
          title="같은 연령대 사료"
          links={relatedByLifeStage}
          variant="secondary"
        />

        {faqs.length > 0 ? (
          <SeoFaqSection faqs={faqs} className="pt-4" title="자주 묻는 질문" />
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
          className="pt-2"
        />
      </div>
    </main>
  );
}

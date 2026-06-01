"use client";

import type { CatalogItem } from "@/components/wireframe/CatalogSearchModal";
import {
  categoryShortLabel,
  conditionShortLabel,
  feedTypeLabel,
  lifeStageShortLabel,
} from "@/lib/feedDetailLabels";

type Props = {
  item: CatalogItem;
  onOpenDetail: (item: CatalogItem) => void;
};

function CardBadge({ children }: { children: string }) {
  return (
    <span className="inline-flex shrink-0 rounded-md border border-[#eee] bg-[#f8f5f2] px-2 py-0.5 text-xs font-medium text-[#555]">
      {children}
    </span>
  );
}

export function FeedFindCard({ item, onOpenDetail }: Props) {
  const brand = item.brand?.trim() || "—";
  const name = item.name?.trim() || item.label;
  const typeLabel = feedTypeLabel(item.rawType ?? "", item.feedKind);
  const kcal =
    item.kcalPer100g != null && Number.isFinite(item.kcalPer100g)
      ? Math.round(item.kcalPer100g)
      : null;

  const badges = [
    typeLabel,
    lifeStageShortLabel(item.lifeStage),
    conditionShortLabel(item.feedCondition),
    categoryShortLabel(item.category),
  ].filter((b): b is string => !!b && b !== "—");

  const openDetail = () => onOpenDetail(item);

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={openDetail}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openDetail();
        }
      }}
      className="cursor-pointer rounded-xl border border-[#eee] bg-white p-4 text-left active:bg-[#fafafa]"
    >
      <p className="text-xs font-normal text-[#888]">{brand}</p>
      <h2 className="mt-0.5 text-base font-semibold leading-snug text-[#171717]">
        {name}
      </h2>

      {badges.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {badges.map((badge) => (
            <CardBadge key={badge}>{badge}</CardBadge>
          ))}
        </div>
      ) : null}

      {kcal != null ? (
        <p className="mt-2.5 text-sm font-medium text-[#333]">
          100g당 {kcal}kcal
        </p>
      ) : null}

      <div className="mt-3">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openDetail();
          }}
          className="flex h-10 w-full items-center justify-center rounded-lg border border-[#dedee0] bg-white text-sm font-medium text-[#171717] active:bg-[#f5f1ed]"
        >
          상세 보기
        </button>
      </div>
    </article>
  );
}

/** 인기 사료 칩 */
export function FeedFindPopularChip({
  item,
  onOpenDetail,
}: {
  item: CatalogItem;
  onOpenDetail: (item: CatalogItem) => void;
}) {
  const brand = item.brand?.trim();
  const name = item.name?.trim() || item.label;
  const kcal =
    item.kcalPer100g != null && Number.isFinite(item.kcalPer100g)
      ? Math.round(item.kcalPer100g)
      : null;

  return (
    <button
      type="button"
      onClick={() => onOpenDetail(item)}
      className="shrink-0 rounded-xl border border-[#eee] bg-[#f8f5f2] px-3 py-2 text-left active:bg-[#f0ebe6]"
    >
      <span className="block text-xs font-medium text-[#171717]">
        {brand ? `${brand} ${name}` : name}
      </span>
      {kcal != null ? (
        <span className="mt-0.5 block text-xs text-[#888]">{kcal}kcal/100g</span>
      ) : null}
    </button>
  );
}

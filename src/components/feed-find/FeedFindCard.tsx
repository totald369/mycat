"use client";

import Image from "next/image";

import type { CatalogItem } from "@/components/wireframe/CatalogSearchModal";
import { safeNumber, safeString } from "@/lib/feedSafeValues";
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

const FEED_FIND_BADGE_ICONS = {
  dry: "/icons/feed-find/badge-dry.svg",
  wet: "/icons/feed-find/badge-wet.svg",
  life: "/icons/feed-find/badge-cat.svg",
  prescription: "/icons/feed-find/badge-prescription.svg",
  weight: "/icons/feed-find/badge-scale.svg",
} as const;

type BadgeTone = keyof typeof FEED_FIND_BADGE_ICONS | "neutral";

const BADGE_TONE_CLASS: Record<
  BadgeTone,
  { wrap: string; text: string; icon?: string; iconSize?: number }
> = {
  dry: {
    wrap: "bg-[#ffe9e5]",
    text: "text-[#81324d]",
    icon: FEED_FIND_BADGE_ICONS.dry,
    iconSize: 15,
  },
  wet: {
    wrap: "bg-[#e6e9fe]",
    text: "text-[#2a37ab]",
    icon: FEED_FIND_BADGE_ICONS.wet,
    iconSize: 16,
  },
  life: {
    wrap: "bg-[#f1f1f0]",
    text: "text-[#181616]",
    icon: FEED_FIND_BADGE_ICONS.life,
    iconSize: 16,
  },
  prescription: {
    wrap: "bg-[#ebfae8]",
    text: "text-[#389112]",
    icon: FEED_FIND_BADGE_ICONS.prescription,
    iconSize: 16,
  },
  weight: {
    wrap: "bg-[#faf4b6]",
    text: "text-[#181616]",
    icon: FEED_FIND_BADGE_ICONS.weight,
    iconSize: 16,
  },
  neutral: {
    wrap: "bg-[#f1f1f0]",
    text: "text-[#181616]",
  },
};

function FeedFindBadge({
  label,
  tone,
}: {
  label: string;
  tone: BadgeTone;
}) {
  const style = BADGE_TONE_CLASS[tone];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-0.5 rounded-md py-1 pl-1 pr-2 ${style.wrap}`}
    >
      {style.icon ? (
        <Image
          src={style.icon}
          alt=""
          width={style.iconSize ?? 16}
          height={style.iconSize ?? 16}
          className="shrink-0"
          style={{ width: style.iconSize ?? 16, height: style.iconSize ?? 16 }}
          unoptimized
        />
      ) : null}
      <span className={`text-sm font-medium leading-4 ${style.text}`}>{label}</span>
    </span>
  );
}

function buildCardBadges(item: CatalogItem) {
  const badges: { key: string; label: string; tone: BadgeTone }[] = [];

  const typeLabel = feedTypeLabel(item.rawType, item.feedKind);
  if (typeLabel === "건식") {
    badges.push({ key: "type", label: "건식", tone: "dry" });
  } else if (typeLabel === "습식") {
    badges.push({ key: "type", label: "습식", tone: "wet" });
  }

  const life = lifeStageShortLabel(item.lifeStage);
  if (life) {
    badges.push({ key: "life", label: life, tone: "life" });
  }

  const category = categoryShortLabel(item.category);
  if (category) {
    badges.push({ key: "category", label: category, tone: "prescription" });
  }

  const condition = conditionShortLabel(item.feedCondition);
  if (condition === "체중관리") {
    badges.push({ key: "weight", label: "체중관리", tone: "weight" });
  } else if (condition === "헤어볼") {
    badges.push({ key: "hairball", label: "헤어볼", tone: "neutral" });
  }

  return badges;
}

export function FeedFindCard({ item, onOpenDetail }: Props) {
  const brand = safeString(item.brand).trim() || "—";
  const name =
    safeString(item.name).trim() || safeString(item.label).trim() || "이름 없음";
  const kcalNum = safeNumber(item.kcalPer100g);
  const badges = buildCardBadges(item);

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
      className="w-full max-w-[343px] cursor-pointer rounded-2xl bg-white px-6 py-8 text-left shadow-[0px_8px_16px_rgba(17,17,17,0.06)] active:bg-[#fafafa]"
    >
      {badges.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {badges.map((badge) => (
            <FeedFindBadge key={badge.key} label={badge.label} tone={badge.tone} />
          ))}
        </div>
      ) : null}

      <div className={`flex flex-col gap-1 ${badges.length > 0 ? "mt-3" : ""}`}>
        <h2 className="text-lg font-semibold leading-[1.2] text-[#171717]">{name}</h2>
        <div className="flex items-center gap-2">
          {kcalNum != null ? (
            <p className="text-sm font-medium text-[#333]">
              100g당{" "}
              <span className="font-bold text-[#f8620c]">
                {Number.isInteger(kcalNum)
                  ? String(kcalNum)
                  : String(Math.round(kcalNum * 10) / 10)}
              </span>
              kcal
            </p>
          ) : null}
          {kcalNum != null ? (
            <span className="size-0.5 shrink-0 rounded-full bg-[#171717]" aria-hidden />
          ) : null}
          <p className="text-sm leading-none text-[#666]">{brand}</p>
        </div>
      </div>
    </article>
  );
}

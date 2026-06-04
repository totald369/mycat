"use client";

import Image from "next/image";
import { startTransition, useCallback, useEffect, useMemo, useState } from "react";

import {
  FeedFindCard,
  FeedFindPopularChip,
} from "@/components/feed-find/FeedFindCard";
import {
  FeedFindListSkeleton,
  FeedFindPopularSkeleton,
} from "@/components/feed-find/FeedFindSkeletons";
import { designResource } from "@/components/design/designResourcePaths";
import type { CatalogItem } from "@/components/wireframe/CatalogSearchModal";
import { IconSearch } from "@/components/wireframe/icons";
import { FEED_REQUEST_HREF } from "@/constants/feedRequest";
import { IMAGE_ALT } from "@/constants/imageAlt";
import {
  FEED_FIND_CHIPS,
  filterCatalogByChip,
  type FeedFindChip,
} from "@/lib/feedFindFilters";
import {
  compactForSearch,
  FEED_PAGE_PLACEHOLDER,
  filterCatalogByQuery,
} from "@/lib/feedSearchUtils";

const FEED_FETCH_URL = "/api/feeds";
const FEED_LOAD_ERROR = "급여(사료) 목록을 불러오지 못했습니다.";
const POPULAR_COUNT = 8;

function FeedRequestWoodAnchor({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="relative flex h-14 w-full max-w-[280px] shrink-0 items-center justify-center overflow-hidden rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f8620c]/50"
      aria-label="사료 추가 요청하기"
    >
      <span className="absolute inset-0 bg-[#6f4425]" aria-hidden />
      <Image
        src={designResource.selectedChoiceTexture}
        alt={IMAGE_ALT.selectedTexture}
        fill
        className="pointer-events-none object-cover opacity-20"
        sizes="280px"
        quality={72}
        draggable={false}
      />
      <span className="relative z-10 px-6 text-base font-bold leading-5 text-white">
        사료 추가 요청하기
      </span>
    </a>
  );
}

function FeedSearchField({
  draft,
  onDraftChange,
  onSearch,
}: {
  draft: string;
  onDraftChange: (value: string) => void;
  onSearch: () => void;
}) {
  return (
    <div className="flex h-12 min-w-0 flex-1 items-center gap-2 overflow-hidden rounded-xl border border-transparent bg-[#f5f1ed] px-4 focus-within:border-[#f8620c]">
      <input
        type="search"
        value={draft}
        onChange={(e) => onDraftChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSearch();
          }
        }}
        placeholder={FEED_PAGE_PLACEHOLDER}
        autoComplete="off"
        className="min-h-0 min-w-0 flex-1 bg-transparent text-base leading-normal text-[#111] outline-none placeholder:text-[#afb4a6]"
      />
      <button
        type="button"
        aria-label="검색"
        className="relative size-6 shrink-0 text-[#555]"
        onClick={onSearch}
      >
        <IconSearch className="size-6" />
      </button>
    </div>
  );
}

function FeedFindChipFilters({
  chipFilter,
  onChipFilterChange,
}: {
  chipFilter: FeedFindChip;
  onChipFilterChange: (chip: FeedFindChip) => void;
}) {
  return (
    <div className="mt-3 flex shrink-0 gap-1.5 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {FEED_FIND_CHIPS.map((chip) => {
        const selected = chipFilter === chip;
        return (
          <button
            key={chip}
            type="button"
            onClick={() =>
              startTransition(() => onChipFilterChange(chip))
            }
            className={
              selected
                ? "shrink-0 rounded-lg bg-[#171717] px-3 py-2 text-sm font-semibold text-white"
                : "shrink-0 rounded-lg border border-solid border-[#eee] bg-white px-3 py-2 text-sm font-semibold text-[#333]"
            }
          >
            {chip}
          </button>
        );
      })}
    </div>
  );
}

type Props = {
  onOpenDetail: (item: CatalogItem) => void;
  initialCatalog?: CatalogItem[];
};

/** 사료 찾기 독립 페이지 — 탐색·상세·계산 연결 (팝업과 분리) */
export function FeedFindPageView({ onOpenDetail, initialCatalog }: Props) {
  const hasServerCatalog =
    initialCatalog !== undefined && initialCatalog.length > 0;
  const [draft, setDraft] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [catalog, setCatalog] = useState<CatalogItem[]>(initialCatalog ?? []);
  const [loading, setLoading] = useState(!hasServerCatalog);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [chipFilter, setChipFilter] = useState<FeedFindChip>("전체");

  useEffect(() => {
    if (hasServerCatalog) return;

    setLoading(true);
    setLoadError(null);
    fetch(FEED_FETCH_URL)
      .then(async (res) => {
        const data = (await res.json()) as {
          items?: CatalogItem[];
          error?: string;
        };
        if (!res.ok) {
          throw new Error(data.error ?? FEED_LOAD_ERROR);
        }
        setCatalog(data.items ?? []);
      })
      .catch((e: Error) => {
        setCatalog([]);
        setLoadError(e.message);
      })
      .finally(() => setLoading(false));
  }, [hasServerCatalog]);

  const runSearch = useCallback(() => {
    startTransition(() => setActiveQuery(draft.trim()));
  }, [draft]);

  const hasSearchQuery = compactForSearch(activeQuery).length > 0;

  const filtered = useMemo(() => {
    const byText = filterCatalogByQuery(catalog, activeQuery);
    return filterCatalogByChip(byText, chipFilter);
  }, [catalog, activeQuery, chipFilter]);

  const popularItems = useMemo(
    () => catalog.slice(0, POPULAR_COUNT),
    [catalog],
  );

  const showPopular =
    !loading && !loadError && catalog.length > 0 && !hasSearchQuery;
  const showEmpty =
    !loading && !loadError && catalog.length > 0 && filtered.length === 0;
  const showList = !loading && !loadError && filtered.length > 0;
  const showLoadingSkeleton = loading && !loadError;

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white font-sans">
      <div className="flex shrink-0 px-4 pt-2">
        <FeedSearchField
          draft={draft}
          onDraftChange={setDraft}
          onSearch={runSearch}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {loadError ? (
          <p className="mt-4 px-4 text-sm text-red-600" role="alert">
            {loadError}
          </p>
        ) : null}

        {!loadError ? (
          <>
            <FeedFindChipFilters
              chipFilter={chipFilter}
              onChipFilterChange={setChipFilter}
            />

            {showLoadingSkeleton && !hasSearchQuery ? (
              <FeedFindPopularSkeleton />
            ) : null}

            {showPopular ? (
              <section
                className="mt-4 px-4"
                aria-labelledby="feed-find-popular-heading"
              >
                <h2
                  id="feed-find-popular-heading"
                  className="text-sm font-semibold text-[#171717]"
                >
                  많이 찾는 사료
                </h2>
                <div className="mt-2 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {popularItems.map((item) => (
                    <FeedFindPopularChip
                      key={item.id}
                      item={item}
                      onOpenDetail={onOpenDetail}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {showLoadingSkeleton ? (
              <FeedFindListSkeleton />
            ) : null}

            {showEmpty ? (
              <div className="flex flex-col items-center gap-5 px-6 py-10">
                <Image
                  src="/design-resource/icon/Ic_88_empty.svg"
                  alt={IMAGE_ALT.emptySearch}
                  width={88}
                  height={88}
                  unoptimized
                  draggable={false}
                />
                <div className="space-y-1 text-center">
                  <p className="text-base font-bold text-[#171717]">
                    찾는 사료가 아직 없어요.
                  </p>
                  <p className="text-sm leading-relaxed text-[#666]">
                    사료 추가 요청을 남겨주시면 빠르게 반영해볼게요.
                  </p>
                </div>
                {FEED_REQUEST_HREF ? (
                  <FeedRequestWoodAnchor href={FEED_REQUEST_HREF} />
                ) : null}
              </div>
            ) : null}

            {showList ? (
              <ul className="mt-4 flex flex-col gap-3 px-4 pb-28">
                {filtered.map((item) => (
                  <li key={item.id}>
                    <FeedFindCard item={item} onOpenDetail={onOpenDetail} />
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        ) : null}

        {!loading && !loadError && catalog.length === 0 ? (
          <p className="mt-4 px-4 text-sm text-neutral-500">
            등록된 사료가 없습니다.
          </p>
        ) : null}
      </div>
    </div>
  );
}

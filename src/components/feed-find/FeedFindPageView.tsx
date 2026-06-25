"use client";

import Image from "next/image";
import { startTransition, useCallback, useEffect, useMemo, useState } from "react";

import { FeedFindCard } from "@/components/feed-find/FeedFindCard";
import { FeedFindListSkeleton } from "@/components/feed-find/FeedFindSkeletons";
import { designResource } from "@/components/design/designResourcePaths";
import type { CatalogItem } from "@/components/wireframe/CatalogSearchModal";
import {
  buildFeedRequestHref,
  FEED_REQUEST_HREF,
} from "@/constants/feedRequest";
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
  findSimilarCatalogResults,
} from "@/lib/feedSearchUtils";

const FEED_FETCH_URL = "/api/feeds";
const FEED_LOAD_ERROR = "급여(사료) 목록을 불러오지 못했습니다.";

function FeedRequestWoodAnchor({ href }: { href: string }) {
  const label = "사료 추가 요청하기";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="relative flex h-14 w-full max-w-[320px] shrink-0 items-center justify-center overflow-hidden rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f8620c]/50"
      aria-label={label}
    >
      <span className="absolute inset-0 bg-[#6f4425]" aria-hidden />
      <Image
        src={designResource.selectedChoiceTexture}
        alt={IMAGE_ALT.selectedTexture}
        fill
        className="pointer-events-none object-cover opacity-20"
        sizes="320px"
        quality={72}
        draggable={false}
      />
      <span className="relative z-10 text-center text-base font-bold leading-5 text-white">
        {label}
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
    <div className="flex h-14 w-full items-center gap-2 overflow-hidden rounded-xl bg-[#f5f1ed] px-4 focus-within:ring-2 focus-within:ring-[#f8620c]/35">
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
        className="min-h-0 min-w-0 flex-1 bg-transparent text-base leading-[1.4] text-[#111] outline-none placeholder:text-[#6b7280]"
      />
      <button
        type="button"
        aria-label="검색"
        className="relative size-6 shrink-0"
        onClick={onSearch}
      >
        <Image
          src={designResource.iconSearch}
          alt=""
          width={24}
          height={24}
          className="size-6"
          unoptimized
        />
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
    <div className="flex w-full gap-1 overflow-x-auto pt-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex shrink-0 gap-1">
        {FEED_FIND_CHIPS.map((chip) => {
          const selected = chipFilter === chip;
          return (
            <button
              key={chip}
              type="button"
              onClick={() => startTransition(() => onChipFilterChange(chip))}
              className={
                selected
                  ? "shrink-0 rounded-lg bg-[#171717] px-3 py-[9px] text-sm font-semibold leading-5 text-white"
                  : "shrink-0 rounded-lg border border-[#eee] bg-white px-[13px] py-[9px] text-sm font-semibold leading-5 text-[#333]"
              }
            >
              {chip}
            </button>
          );
        })}
      </div>
    </div>
  );
}

type Props = {
  onOpenDetail: (item: CatalogItem) => void;
  initialCatalog?: CatalogItem[];
};

/** 사료 찾기 독립 페이지 — Figma 306:12129 */
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
        setCatalog(Array.isArray(data.items) ? data.items : []);
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

  const clearSearchAndFilters = useCallback(() => {
    startTransition(() => {
      setDraft("");
      setActiveQuery("");
      setChipFilter("전체");
    });
  }, []);

  const hasSearchQuery = compactForSearch(activeQuery).length > 0;

  const { exactResults, similarResults } = useMemo(() => {
    const byText = filterCatalogByQuery(catalog, activeQuery);
    const exact = filterCatalogByChip(byText, chipFilter);

    if (exact.length > 0 || !hasSearchQuery) {
      return { exactResults: exact, similarResults: [] as CatalogItem[] };
    }

    const similar = filterCatalogByChip(
      findSimilarCatalogResults(catalog, activeQuery),
      chipFilter,
    );
    return { exactResults: exact, similarResults: similar };
  }, [catalog, activeQuery, chipFilter, hasSearchQuery]);

  const chipOnlyResults = useMemo(() => {
    if (hasSearchQuery) return [];
    return filterCatalogByChip(catalog, chipFilter);
  }, [catalog, chipFilter, hasSearchQuery]);

  const displayResults = hasSearchQuery
    ? exactResults.length > 0
      ? exactResults
      : similarResults
    : chipOnlyResults;

  const showSimilarHint =
    hasSearchQuery && exactResults.length === 0 && similarResults.length > 0;

  const showEmpty =
    !loading &&
    !loadError &&
    catalog.length > 0 &&
    displayResults.length === 0 &&
    (hasSearchQuery || chipFilter !== "전체");
  const showList = !loading && !loadError && displayResults.length > 0;
  const showLoadingSkeleton = loading && !loadError;

  const requestHref = buildFeedRequestHref(activeQuery || draft);

  return (
    <div className="flex min-h-0 w-full max-w-[min(343px,100%)] flex-1 flex-col gap-3">
      <FeedSearchField
        draft={draft}
        onDraftChange={setDraft}
        onSearch={runSearch}
      />

      <div className="flex min-h-0 flex-1 flex-col">
        {loadError ? (
          <p className="text-sm text-red-600" role="alert">
            {loadError}
          </p>
        ) : null}

        {!loadError ? (
          <>
            <FeedFindChipFilters
              chipFilter={chipFilter}
              onChipFilterChange={setChipFilter}
            />

            {showLoadingSkeleton ? <FeedFindListSkeleton /> : null}

            {showEmpty ? (
              <div className="flex flex-col items-center gap-5 px-2 py-10">
                <Image
                  src="/design-resource/icon/Ic_88_empty.svg"
                  alt={IMAGE_ALT.emptySearch}
                  width={88}
                  height={88}
                  unoptimized
                  draggable={false}
                />
                <div className="space-y-2 text-center">
                  <p className="text-base font-bold text-[#171717]">
                    찾는 사료가 아직 없어요.
                  </p>
                  <p className="text-sm leading-relaxed text-[#666]">
                    입력하신 키워드와 비슷한 사료를 확인하거나, 사료 추가
                    요청을 남겨주시면 데이터에 반영해볼게요.
                  </p>
                </div>
                <div className="flex w-full max-w-[320px] flex-col items-stretch gap-3">
                  {FEED_REQUEST_HREF ? (
                    <FeedRequestWoodAnchor href={requestHref} />
                  ) : null}
                  <button
                    type="button"
                    onClick={clearSearchAndFilters}
                    className="h-12 rounded-xl border border-[#eee] bg-white text-base font-semibold text-[#333]"
                  >
                    전체 사료 보기
                  </button>
                </div>
              </div>
            ) : null}

            {showList ? (
              <>
                {showSimilarHint ? (
                  <p className="pt-3 text-sm leading-relaxed text-[#666]">
                    정확히 일치하는 사료는 없지만, 입력하신 조건과 비슷한
                    사료예요.
                  </p>
                ) : null}
                <ul className="flex flex-col items-center gap-3 pb-8 pt-3">
                  {displayResults.map((item) => (
                    <li key={item.id} className="w-full">
                      <FeedFindCard item={item} onOpenDetail={onOpenDetail} />
                    </li>
                  ))}
                </ul>
                {showSimilarHint && FEED_REQUEST_HREF ? (
                  <div className="flex justify-center pb-8">
                    <FeedRequestWoodAnchor href={requestHref} />
                  </div>
                ) : null}
              </>
            ) : null}
          </>
        ) : null}

        {!loading && !loadError && catalog.length === 0 ? (
          <p className="pt-3 text-sm text-neutral-500">등록된 사료가 없습니다.</p>
        ) : null}
      </div>
    </div>
  );
}

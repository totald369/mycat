"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { designResource } from "@/components/design/designResourcePaths";
import {
  wizardModalOverlayClass,
  wizardModalPanelClass,
} from "@/components/design/wizardLayoutClasses";
import { FEED_REQUEST_HREF } from "@/constants/feedRequest";
import { IMAGE_ALT } from "@/constants/imageAlt";
import { IconBack, IconSearch } from "@/components/wireframe/icons";
import {
  compactForSearch,
  FEED_MODAL_PLACEHOLDER,
  filterCatalogByQuery,
} from "@/lib/feedSearchUtils";
import type { CatalogItem } from "@/components/wireframe/CatalogSearchModal";

export type FeedSearchLayout = "modal" | "page";

type FeedKindChip = "전체" | "습식" | "건식";

const FEED_CHIPS: FeedKindChip[] = ["전체", "습식", "건식"];

const FEED_FETCH_URL = "/api/feeds";
const FEED_LOAD_ERROR = "급여(사료) 목록을 불러오지 못했습니다.";
const FEED_PLACEHOLDER = FEED_MODAL_PLACEHOLDER;

const FEED_EMPTY_DB_HINT = (
  <>
    CSV 사료 목록이 없습니다.{" "}
    <code className="rounded bg-neutral-100 px-1 text-xs">
      prisma/cat_food.csv
    </code>{" "}
    를 채운 뒤 터미널에서{" "}
    <code className="rounded bg-neutral-100 px-1 text-xs">
      npm run db:seed:csv
    </code>
    를 실행해 주세요.
  </>
);

function matchesFeedChip(row: CatalogItem, chip: FeedKindChip): boolean {
  if (chip === "전체") return true;
  const raw = row.feedKind?.trim() ?? "";
  if (!raw) return false;
  const lower = raw.toLowerCase();
  if (chip === "습식") return lower.includes("습") || lower.includes("wet");
  if (chip === "건식") return lower.includes("건") || lower.includes("dry");
  return true;
}

function feedKindSubtitle(row: CatalogItem): string {
  const k = row.feedKind?.trim();
  if (k) return k;
  return "";
}

/** 피그마 Selected_Button (#6f4425 + 우드 텍스처 20%) */
function FeedRequestWoodAnchor({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="relative flex h-14 w-full max-w-[242px] shrink-0 items-center justify-center overflow-hidden rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f8620c]/50"
      aria-label="사료 추가 요청"
    >
      <span className="absolute inset-0 bg-[#6f4425]" aria-hidden />
      <Image
        src={designResource.selectedChoiceTexture}
        alt={IMAGE_ALT.selectedTexture}
        fill
        className="pointer-events-none object-cover opacity-20"
        sizes="242px"
        quality={72}
        draggable={false}
      />
      <span className="relative z-10 px-8 text-base font-bold leading-5 text-white">
        사료 추가 요청
      </span>
    </a>
  );
}

/** 피그마 SearchList_basic(143:40) 초기·안내 블록 */
function FeedSearchIdleBlock({
  feedRequestHref,
}: {
  feedRequestHref: string | undefined;
}) {
  return (
    <div className="flex flex-col items-center gap-6 px-6">
      <div className="flex flex-col items-center gap-2">
        <Image
          src="/design-resource/icon/Ic_88_empty.svg"
          alt={IMAGE_ALT.emptySearch}
          width={88}
          height={88}
          className="shrink-0"
          unoptimized
          draggable={false}
        />
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-base font-bold leading-[1.5] text-[#171717]">
            검색창에 사료명・브랜드명을 검색해주세요.
          </p>
          <div className="text-base font-normal leading-[1.5] text-[#666]">
            <p className="mb-0">찾는 사료가 없으시면 </p>
            <p className="mb-0">사료 추가 요청을 해주세요.</p>
          </div>
        </div>
      </div>
      {feedRequestHref ? (
        <FeedRequestWoodAnchor href={feedRequestHref} />
      ) : null}
    </div>
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
        type="text"
        value={draft}
        onChange={(e) => onDraftChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSearch();
          }
        }}
        placeholder={FEED_PLACEHOLDER}
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

function FeedSearchBody({
  loadError,
  loading,
  emptyDbHint,
  catalog,
  chipFilter,
  onChipFilterChange,
  searched,
  activeQuery,
  results,
  feedRequestHref,
  onSelect,
  showCatalogListByDefault = false,
}: {
  loadError: string | null;
  loading: boolean;
  emptyDbHint: ReactNode;
  catalog: CatalogItem[];
  chipFilter: FeedKindChip;
  onChipFilterChange: (chip: FeedKindChip) => void;
  searched: boolean;
  activeQuery: string;
  results: CatalogItem[];
  feedRequestHref: string | undefined;
  onSelect?: (item: CatalogItem) => void;
  /** 사료 찾기 페이지: 검색 전 전체 목록 표시 */
  showCatalogListByDefault?: boolean;
}) {
  const hasActiveNeedle = compactForSearch(activeQuery).length > 0;
  const showHintEmptyNeedle =
    !showCatalogListByDefault &&
    searched &&
    !hasActiveNeedle &&
    !loading &&
    !loadError &&
    catalog.length > 0;
  const showFigmaEmpty =
    searched &&
    hasActiveNeedle &&
    !loading &&
    !loadError &&
    catalog.length > 0 &&
    results.length === 0 &&
    !!feedRequestHref;
  const showResultList =
    !loading &&
    !loadError &&
    results.length > 0 &&
    (showCatalogListByDefault
      ? !searched || hasActiveNeedle
      : searched && hasActiveNeedle);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {loadError ? (
          <p className="mt-4 px-4 text-sm text-red-600" role="alert">
            {loadError}
          </p>
        ) : null}
        {loading ? (
          <p className="mt-4 px-4 text-sm text-neutral-500">불러오는 중…</p>
        ) : null}
        {!loading && !loadError && catalog.length === 0 ? (
          <p className="mt-4 px-4 text-sm text-neutral-500">{emptyDbHint}</p>
        ) : null}

        {!loading && !loadError && catalog.length > 0 ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex shrink-0 gap-1 px-4 pb-1">
              {FEED_CHIPS.map((c) => {
                const sel = chipFilter === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => onChipFilterChange(c)}
                    className={
                      sel
                        ? "shrink-0 rounded-lg bg-[#171717] py-2 pl-3 pr-3 text-sm font-semibold leading-normal tracking-[0.1px] text-white"
                        : "shrink-0 rounded-lg border border-solid border-[#eee] bg-white py-2 pl-3 pr-3 text-sm font-semibold leading-normal tracking-[0.1px] text-[#333]"
                    }
                  >
                    {c}
                  </button>
                );
              })}
            </div>

            <div
              className={`flex min-h-0 flex-1 flex-col ${showResultList ? "mt-4" : ""}`}
            >
              {!searched && !showCatalogListByDefault ? (
                <div className="flex min-h-0 flex-1 flex-col items-center justify-center pb-6">
                  <FeedSearchIdleBlock feedRequestHref={feedRequestHref} />
                </div>
              ) : showHintEmptyNeedle ? (
                <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 pb-6">
                  <p className="text-center text-base font-normal leading-[1.5] text-[#666]">
                    검색어를 입력해 주세요.
                  </p>
                </div>
              ) : showFigmaEmpty ? (
                <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 px-4 pb-6">
                  <div className="flex flex-col items-center gap-2">
                    <Image
                      src="/design-resource/icon/Ic_88_empty.svg"
                      alt={IMAGE_ALT.emptySearch}
                      width={88}
                      height={88}
                      className="shrink-0"
                      unoptimized
                      draggable={false}
                    />
                    <p className="text-center text-base font-bold leading-[1.5] text-[#171717]">
                      찾으시는 사료가 없나요?
                    </p>
                    <div className="max-w-[242px] text-center text-base font-normal leading-[1.5] text-[#666]">
                      <p className="mb-0">
                        사료를 요청해주시면 확인 과정을 거쳐
                      </p>
                      <p>2~3일 내에 업데이트됩니다.</p>
                    </div>
                  </div>
                  {feedRequestHref ? (
                    <FeedRequestWoodAnchor href={feedRequestHref} />
                  ) : null}
                </div>
              ) : showResultList ? (
                <div className="flex flex-col gap-1 px-2 pb-28">
                  {results.map((row, idx) => (
                    <Fragment key={row.id}>
                      <button
                        type="button"
                        className="flex min-h-[52px] touch-manipulation select-none flex-col justify-center gap-1.5 rounded-lg px-4 py-3 text-left active:bg-[#fafafa]"
                        onClick={() => onSelect?.(row)}
                      >
                        <span className="line-clamp-2 text-base font-semibold tracking-[0.1px] text-[#171717]">
                          {row.label}
                        </span>
                        {feedKindSubtitle(row) ? (
                          <span className="text-sm font-normal tracking-[0.1px] text-[#555]">
                            {feedKindSubtitle(row)}
                          </span>
                        ) : null}
                      </button>
                      {idx < results.length - 1 ? (
                        <div className="h-px w-full bg-[#f5f5f5]" />
                      ) : null}
                    </Fragment>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      <div className="relative h-[33px] shrink-0 bg-white pb-[max(8px,env(safe-area-inset-bottom))]">
        <div className="-translate-x-1/2 absolute bottom-2 left-1/2 h-[5px] w-[135px] rounded-[100px] bg-[#222]" />
      </div>
    </div>
  );
}

export type FeedSearchViewProps = {
  layout: FeedSearchLayout;
  initialQuery?: string;
  /** modal 전용 */
  title?: string;
  titleId?: string;
  onClose?: () => void;
  onSelect?: (item: CatalogItem) => void;
};

/** 피그마 SearchList_basic · 사료 찾기(321:91) — modal·page 공통 UI */
export function FeedSearchView({
  layout,
  initialQuery = "",
  title = "급여 종류",
  titleId,
  onClose,
  onSelect,
}: FeedSearchViewProps) {
  const [draft, setDraft] = useState("");
  const [searched, setSearched] = useState(false);
  const [activeQuery, setActiveQuery] = useState("");
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [chipFilter, setChipFilter] = useState<FeedKindChip>("전체");

  const isModal = layout === "modal";
  const showCatalogListByDefault = layout === "page";

  useEffect(() => {
    setDraft(initialQuery);
    setChipFilter("전체");
    const q = initialQuery.trim();
    if (q) {
      setSearched(true);
      setActiveQuery(q);
    } else {
      setSearched(false);
      setActiveQuery("");
    }
  }, [initialQuery]);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (!isModal) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isModal]);

  const runSearch = useCallback(() => {
    setSearched(true);
    setActiveQuery(draft.trim());
  }, [draft]);

  const textMatches = useMemo(() => {
    if (showCatalogListByDefault && (!searched || !compactForSearch(activeQuery))) {
      return catalog;
    }
    if (!searched) return [];
    if (!compactForSearch(activeQuery)) return [];
    return filterCatalogByQuery(catalog, activeQuery);
  }, [showCatalogListByDefault, searched, activeQuery, catalog]);

  const results = useMemo(
    () => textMatches.filter((row) => matchesFeedChip(row, chipFilter)),
    [textMatches, chipFilter],
  );

  const handleSelect = useCallback(
    (item: CatalogItem) => {
      onSelect?.(item);
      if (isModal) onClose?.();
    },
    [isModal, onClose, onSelect],
  );

  const body = (
    <FeedSearchBody
      loadError={loadError}
      loading={loading}
      emptyDbHint={FEED_EMPTY_DB_HINT}
      catalog={catalog}
      chipFilter={chipFilter}
      onChipFilterChange={setChipFilter}
      searched={searched}
      activeQuery={activeQuery}
      results={results}
      feedRequestHref={FEED_REQUEST_HREF}
      onSelect={handleSelect}
      showCatalogListByDefault={showCatalogListByDefault}
    />
  );

  const searchRow = isModal ? (
    <div className="flex shrink-0 items-start justify-center pr-4 pt-[max(8px,env(safe-area-inset-top))]">
      <button
        type="button"
        aria-label="닫기"
        className="relative flex size-12 shrink-0 items-center justify-center text-[#171717]"
        onClick={onClose}
      >
        <IconBack />
      </button>
      <FeedSearchField
        draft={draft}
        onDraftChange={setDraft}
        onSearch={runSearch}
      />
    </div>
  ) : (
    <div className="flex shrink-0 items-start px-4 pt-2">
      <FeedSearchField
        draft={draft}
        onDraftChange={setDraft}
        onSearch={runSearch}
      />
    </div>
  );

  const content = (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      {searchRow}
      {body}
    </div>
  );

  if (isModal) {
    return (
      <div className={wizardModalOverlayClass}>
        <div
          className={`${wizardModalPanelClass} overscroll-y-contain bg-white font-sans`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          {titleId ? (
            <h2 id={titleId} className="sr-only">
              {title}
            </h2>
          ) : null}
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white font-sans">
      {content}
    </div>
  );
}

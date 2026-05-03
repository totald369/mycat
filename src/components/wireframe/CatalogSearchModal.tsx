"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { PawWoodLink } from "@/components/design/PawButton";
import { IconBack, IconClose, IconSearch } from "@/components/wireframe/icons";
import { canonicalizeKoreanSearchSpelling } from "@/lib/koreanSearchNormalize";

/** `feed`: 급여(사료) 검색 — 피그마 SearchList 빈 화면·결과 노드 반영. `default`: 품종 검색 등 기존 화면. */
export type CatalogSearchModalVariant = "default" | "feed";

export type CatalogItem = {
  id: string;
  label: string;
  feedKind?: string;
  kcalPer100g?: number | null;
  servingGrams?: number | null;
  nameEn?: string | null;
  nameKo?: string | null;
  displayLabel?: string | null;
  brand?: string | null;
  name?: string | null;
  category?: string | null;
  feedCondition?: string | null;
};

type FeedKindChip = "전체" | "습식" | "건식";

function compactForSearch(s: string): string {
  return canonicalizeKoreanSearchSpelling(s)
    .normalize("NFC")
    .toLowerCase()
    .replace(/[\s\-_/·.,]+/gu, "");
}

function catalogSearchBlob(row: CatalogItem): string {
  return [
    row.label,
    row.nameEn,
    row.nameKo,
    row.displayLabel,
    row.brand,
    row.name,
    row.category,
    row.feedCondition,
  ]
    .filter((x): x is string => typeof x === "string" && x.trim() !== "")
    .join(" ");
}

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

type Props = {
  open: boolean;
  initialQuery: string;
  onClose: () => void;
  onSelect: (item: CatalogItem) => void;
  title: string;
  titleId: string;
  placeholder: string;
  fetchUrl: string;
  emptyDbHint: ReactNode;
  loadErrorMessage: string;
  feedRequestHref?: string;
  variant?: CatalogSearchModalVariant;
};

const FEED_CHIPS: FeedKindChip[] = ["전체", "습식", "건식"];

/** 급여 검색 빈 화면·메인 안내와 동일한 «사료 추가 요청» 버튼 스타일 */
const FEED_REQUEST_LINK_CLASS =
  "relative flex h-14 w-full max-w-[242px] items-center justify-center overflow-hidden rounded-[12px] bg-[#6f4425] text-base font-bold leading-5 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f8620c]/50";

export function CatalogSearchModal({
  open,
  initialQuery,
  onClose,
  onSelect,
  title,
  titleId,
  placeholder,
  fetchUrl,
  emptyDbHint,
  loadErrorMessage,
  feedRequestHref,
  variant = "default",
}: Props) {
  const [draft, setDraft] = useState("");
  const [searched, setSearched] = useState(false);
  const [activeQuery, setActiveQuery] = useState("");
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [chipFilter, setChipFilter] = useState<FeedKindChip>("전체");

  useEffect(() => {
    if (!open) return;
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
  }, [open, initialQuery]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setLoadError(null);
    fetch(fetchUrl)
      .then(async (res) => {
        const data = (await res.json()) as {
          items?: CatalogItem[];
          error?: string;
        };
        if (!res.ok) {
          throw new Error(data.error ?? loadErrorMessage);
        }
        setCatalog(data.items ?? []);
      })
      .catch((e: Error) => {
        setCatalog([]);
        setLoadError(e.message);
      })
      .finally(() => setLoading(false));
  }, [open, fetchUrl, loadErrorMessage]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const runSearch = useCallback(() => {
    setSearched(true);
    setActiveQuery(draft.trim());
  }, [draft]);

  const textMatches = useMemo(() => {
    if (!searched) return [];
    const needle = compactForSearch(activeQuery);
    if (!needle) return [];
    return catalog.filter((row) =>
      compactForSearch(catalogSearchBlob(row)).includes(needle),
    );
  }, [searched, activeQuery, catalog]);

  const results = useMemo(() => {
    if (variant !== "feed") return textMatches;
    return textMatches.filter((row) => matchesFeedChip(row, chipFilter));
  }, [variant, textMatches, chipFilter]);

  if (!open) return null;

  const isFeed = variant === "feed";

  if (isFeed) {
    const needleActive =
      searched && compactForSearch(activeQuery).length > 0;
    const showHintEmptyNeedle =
      searched &&
      compactForSearch(activeQuery).length === 0 &&
      !loading &&
      !loadError &&
      catalog.length > 0;
    const showFigmaEmpty =
      needleActive &&
      !loading &&
      !loadError &&
      catalog.length > 0 &&
      results.length === 0 &&
      !!feedRequestHref;
    const showResultList =
      needleActive &&
      !loading &&
      !loadError &&
      results.length > 0;

    return (
      <div
        className="fixed inset-0 z-[100] flex min-h-[100dvh] flex-col bg-white font-sans"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <h2 id={titleId} className="sr-only">
          {title}
        </h2>
        <div className="flex min-h-0 flex-1 flex-col">
          {/* 피그마 Frame 971 + 972: 검색줄 */}
          <div className="flex shrink-0 items-start justify-center pr-4 pt-[max(8px,env(safe-area-inset-top))]">
            <button
              type="button"
              aria-label="닫기"
              className="relative flex size-12 shrink-0 items-center justify-center text-[#171717]"
              onClick={onClose}
            >
              <IconBack />
            </button>
            <div className="flex h-12 min-w-0 flex-1 items-center gap-2 overflow-hidden rounded-[12px] border border-transparent bg-[#f5f1ed] px-4 focus-within:border-[#f8620c]">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    runSearch();
                  }
                }}
                placeholder={placeholder}
                autoComplete="off"
                className="min-h-0 min-w-0 flex-1 bg-transparent text-base leading-normal text-[#111] outline-none placeholder:text-[#afb4a6]"
              />
              <button
                type="button"
                aria-label="검색"
                className="relative size-6 shrink-0 text-[#555]"
                onClick={runSearch}
              >
                <IconSearch className="size-6" />
              </button>
            </div>
          </div>

          {/* 피그마 Frame 980: 본문 + 인디케이터 */}
          <div className="flex min-h-0 flex-1 flex-col bg-white">
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
              {loadError ? (
                <p className="mt-4 px-4 text-sm text-red-600" role="alert">
                  {loadError}
                </p>
              ) : null}
              {loading ? (
                <p className="mt-4 px-4 text-sm text-neutral-500">
                  불러오는 중…
                </p>
              ) : null}
              {!loading && !loadError && catalog.length === 0 ? (
                <p className="mt-4 px-4 text-sm text-neutral-500">
                  {emptyDbHint}
                </p>
              ) : null}

              {!loading && !loadError && catalog.length > 0 ? (
                <div className="flex min-h-0 flex-1 flex-col">
                  <div className="mt-[8px] flex shrink-0 gap-1 px-4 pb-1">
                    {FEED_CHIPS.map((c) => {
                      const sel = chipFilter === c;
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setChipFilter(c)}
                          className={
                            sel
                              ? "shrink-0 rounded-lg bg-[#171717] py-2 pl-3 pr-3 text-sm font-semibold tracking-[0.1px] text-white"
                              : "shrink-0 rounded-lg border border-[#eee] bg-white py-2 pl-3 pr-3 text-sm font-semibold tracking-[0.1px] text-[#333]"
                          }
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>

                  {/* 피그마 검색 결과와 동일 간격 · 빈 상태는 남은 높이 가운데 정렬 */}
                  <div
                    className={`flex min-h-0 flex-1 flex-col ${showResultList ? "mt-4" : ""}`}
                  >
                    {!searched ? (
                      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 pb-6">
                        <div className="flex flex-col items-center gap-3">
                          <p className="text-center text-base leading-normal text-[#666]">
                            검색창에 사료명·브랜드를 입력하고 검색해 주세요.
                          </p>
                          <p className="text-center text-base font-bold leading-[1.5] text-[#171717]">
                            찾는 사료가 없나요?
                          </p>
                        </div>
                        {feedRequestHref ? (
                          <a
                            href={feedRequestHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={FEED_REQUEST_LINK_CLASS}
                            aria-label="사료 추가 요청"
                          >
                            사료 추가 요청
                          </a>
                        ) : null}
                      </div>
                    ) : showHintEmptyNeedle ? (
                      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-6">
                        <p className="text-center text-base leading-normal text-[#666]">
                          검색어를 입력해 주세요.
                        </p>
                      </div>
                    ) : showFigmaEmpty ? (
                      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 pb-6">
                        <div className="flex flex-col items-center gap-2">
                          <Image
                            src="/design-resource/icon/Ic_88_empty.svg"
                            alt=""
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
                        <a
                          href={feedRequestHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={FEED_REQUEST_LINK_CLASS}
                          aria-label="사료 추가 요청"
                        >
                          사료 추가 요청
                        </a>
                      </div>
                    ) : showResultList ? (
                      <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-2 pb-28">
                        {results.map((row, idx) => (
                          <Fragment key={row.id}>
                            <button
                              type="button"
                              className="flex flex-col gap-1.5 rounded-lg px-4 py-4 text-left active:bg-[#fafafa]"
                              onClick={() => {
                                onSelect(row);
                                onClose();
                              }}
                            >
                              <span className="text-base font-semibold tracking-[0.1px] text-[#171717]">
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

            {/* 홈 인디케이터 (피그마 1. Indicator) */}
            <div className="relative h-[33px] shrink-0 bg-white pb-[max(8px,env(safe-area-inset-bottom))]">
              <div className="-translate-x-1/2 absolute bottom-3 left-1/2 h-[5px] w-[135px] rounded-[100px] bg-[#222]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ─── default (품종 등) ─── */
  return (
    <div
      className="fixed inset-0 z-[100] flex min-h-[100dvh] w-full flex-col bg-[#fffcf9]"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <header className="relative flex shrink-0 items-center justify-center border-b border-[#dedee0] px-4 pb-3.5 pt-[max(0.875rem,env(safe-area-inset-top))]">
        <button
          type="button"
          aria-label="닫기"
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555]"
          onClick={onClose}
        >
          <IconClose />
        </button>
        <h2 id={titleId} className="text-lg font-normal text-[#111]">
          {title}
        </h2>
      </header>

      <div className="shrink-0 px-4 pt-4">
        <div className="relative">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                runSearch();
              }
            }}
            placeholder={placeholder}
            className="w-full rounded-xl border-0 bg-[#f5f1ed] py-3.5 pl-4 pr-11 text-base text-[#111] placeholder:text-[#afb4a6] focus:outline-none focus:ring-2 focus:ring-[#f8620c]/35"
          />
          <button
            type="button"
            aria-label="검색"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555]"
            onClick={runSearch}
          >
            <IconSearch className="size-6" />
          </button>
        </div>
        {feedRequestHref ? (
          <div className="mt-3 shrink-0">
            <PawWoodLink
              href={feedRequestHref}
              pawHalf="none"
              prefetch={false}
              target="_blank"
              rel="noopener noreferrer"
              className="text-center"
              aria-label="사료 추가 요청 (새 탭에서 열기)"
            >
              사료 추가 요청
            </PawWoodLink>
          </div>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-4">
        {loadError ? (
          <p className="text-sm text-red-600" role="alert">
            {loadError}
          </p>
        ) : null}
        {loading ? (
          <p className="text-sm text-neutral-500">불러오는 중…</p>
        ) : null}
        {!loading && !loadError && catalog.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-500">{emptyDbHint}</p>
        ) : null}
        {searched && !loading ? (
          <>
            <p className="text-sm font-semibold text-[#111]">
              검색결과 ({results.length})
            </p>
            <ul className="mt-3 divide-y divide-[#dedee0] border-t border-[#dedee0]">
              {results.map((row) => (
                <li key={row.id}>
                  <button
                    type="button"
                    className="w-full py-3.5 text-left text-sm font-normal text-[#111] active:bg-[#f5f1ed]"
                    onClick={() => {
                      onSelect(row);
                      onClose();
                    }}
                  >
                    {row.label}
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>
    </div>
  );
}

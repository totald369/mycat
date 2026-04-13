"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { IconClose, IconSearch } from "@/components/wireframe/icons";
import { canonicalizeKoreanSearchSpelling } from "@/lib/koreanSearchNormalize";

export type CatalogItem = {
  id: string;
  label: string;
  feedKind?: string;
  kcalPer100g?: number | null;
  /** 습식 1캔(1팩) g */
  servingGrams?: number | null;
  /** 품종 API 등 — 영·한 별도 필드 (라벨에 없어도 검색에 사용) */
  nameEn?: string | null;
  nameKo?: string | null;
  /** 사료 표시용 원문(영문 브랜드·제품명 등) */
  displayLabel?: string | null;
  brand?: string | null;
  name?: string | null;
  category?: string | null;
  feedCondition?: string | null;
};

/** 공백·하이픈·슬래시 등 제거 후 소문자 (영문 연속 입력·기호 혼용 대응) */
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
};

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
}: Props) {
  const [draft, setDraft] = useState("");
  const [searched, setSearched] = useState(false);
  const [activeQuery, setActiveQuery] = useState("");
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDraft(initialQuery);
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

  const results = useMemo(() => {
    if (!searched) return [];
    const needle = compactForSearch(activeQuery);
    if (!needle) return [];
    return catalog.filter((row) =>
      compactForSearch(catalogSearchBlob(row)).includes(needle),
    );
  }, [searched, activeQuery, catalog]);

  if (!open) return null;

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
        <h2
          id={titleId}
          className="font-display text-lg font-normal text-[#111]"
        >
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
            <ul className="mt-3 space-y-0 divide-y divide-[#dedee0] border-t border-[#dedee0]">
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

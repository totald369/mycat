"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { SEO_BOOST_PILOT_MAX } from "@/lib/feedSeoBoostTypes";

type CatalogItem = {
  apiId: string;
  label: string;
  brand: string | null;
  displayLabel: string;
};

type ContentStatus = {
  generatedAt: string;
  openaiModel: string | null;
} | null;

const SECRET_KEY = "mycat-admin-secret";

function adminHeaders(secret: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    "x-admin-secret": secret,
  };
}

export default function AdminSeoBoostPage() {
  const [secret, setSecret] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [contentStatus, setContentStatus] = useState<
    Record<string, ContentStatus>
  >({});
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const loadPilot = useCallback(async (adminSecret: string) => {
    const res = await fetch("/api/admin/seo-boost/pilot", {
      headers: adminHeaders(adminSecret),
    });
    if (!res.ok) throw new Error("인증 실패 또는 서버 오류");
    const data = (await res.json()) as {
      pilotFeedApiIds: string[];
      contents: Record<string, ContentStatus>;
    };
    setSelected(data.pilotFeedApiIds);
    setContentStatus(data.contents);
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem(SECRET_KEY);
    if (saved) {
      setSecret(saved);
      setUnlocked(true);
    }
  }, []);

  useEffect(() => {
    if (!unlocked || !secret) return;
    void (async () => {
      try {
        const feedsRes = await fetch("/api/feeds");
        const feedsJson = (await feedsRes.json()) as { items: CatalogItem[] };
        setCatalog(feedsJson.items ?? []);
        await loadPilot(secret);
      } catch (e) {
        setMessage(e instanceof Error ? e.message : String(e));
      }
    })();
  }, [unlocked, secret, loadPilot]);

  const filteredCatalog = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return catalog.slice(0, 80);
    return catalog
      .filter((item) => {
        const hay = `${item.apiId} ${item.label} ${item.brand ?? ""} ${item.displayLabel}`.toLowerCase();
        return hay.includes(q);
      })
      .slice(0, 80);
  }, [catalog, query]);

  const catalogById = useMemo(() => {
    const map = new Map<string, CatalogItem>();
    for (const item of catalog) map.set(item.apiId, item);
    return map;
  }, [catalog]);

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/seo-boost/pilot", {
        headers: adminHeaders(secret),
      });
      if (!res.ok) {
        setMessage("관리자 비밀번호가 올바르지 않습니다.");
        return;
      }
      sessionStorage.setItem(SECRET_KEY, secret);
      setUnlocked(true);
      setMessage(null);
    } catch {
      setMessage("연결에 실패했습니다.");
    }
  }

  function toggleFeed(apiId: string) {
    setSelected((prev) => {
      if (prev.includes(apiId)) return prev.filter((id) => id !== apiId);
      if (prev.length >= SEO_BOOST_PILOT_MAX) {
        setMessage(`최대 ${SEO_BOOST_PILOT_MAX}개까지 선택할 수 있습니다.`);
        return prev;
      }
      return [...prev, apiId];
    });
  }

  async function savePilot() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/seo-boost/pilot", {
        method: "PUT",
        headers: adminHeaders(secret),
        body: JSON.stringify({ feedApiIds: selected }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "저장 실패");
      await loadPilot(secret);
      setMessage(`파일럿 대상 ${data.feedApiIds.length}건 저장됨`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function runGenerate(force: boolean) {
    setBusy(true);
    setMessage("OpenAI 생성 중… (수 분 소요될 수 있음)");
    try {
      const res = await fetch("/api/admin/seo-boost/generate", {
        method: "POST",
        headers: adminHeaders(secret),
        body: JSON.stringify({ force }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "생성 실패");
      await loadPilot(secret);
      const ok = (data.ok as string[]).length;
      const failed = (data.failed as { feedApiId: string; error: string }[])
        .length;
      setMessage(`생성 완료: 성공 ${ok}건, 실패 ${failed}건`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  if (!unlocked) {
    return (
      <main className="mx-auto min-h-[100dvh] max-w-lg bg-white px-6 py-10">
        <h1 className="text-xl font-bold text-[#171717]">SEO 부스트 파일럿</h1>
        <p className="mt-2 text-sm text-[#555]">
          GSC 조회수 상위 사료(최대 {SEO_BOOST_PILOT_MAX}개)를 지정하고 OpenAI
          콘텐츠를 일괄 생성합니다.
        </p>
        <form onSubmit={handleUnlock} className="mt-6 space-y-3">
          <label className="block text-sm font-medium text-[#333]">
            관리자 비밀번호
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#ddd] px-3 py-2 text-sm"
              autoComplete="current-password"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-xl bg-[#f8620c] py-3 text-sm font-semibold text-white"
          >
            로그인
          </button>
        </form>
        {message ? <p className="mt-4 text-sm text-red-600">{message}</p> : null}
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-[100dvh] max-w-2xl bg-white px-6 py-8 pb-16">
      <h1 className="text-xl font-bold text-[#171717]">SEO 부스트 파일럿</h1>
      <p className="mt-2 text-sm leading-relaxed text-[#555]">
        선택한 사료에만 「추천 대상」「급여 전 참고」「비교 포인트」 섹션이
        추가됩니다. 생성 결과는 DB와 <code>prisma/feedSeoBoost.json</code>에
        저장되며, 상세 페이지는 빌드 시 캐시만 읽습니다.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => void savePilot()}
          className="rounded-xl border border-[#ddd] px-4 py-2 text-sm font-semibold disabled:opacity-50"
        >
          대상 저장 ({selected.length}/{SEO_BOOST_PILOT_MAX})
        </button>
        <button
          type="button"
          disabled={busy || selected.length === 0}
          onClick={() => void runGenerate(false)}
          className="rounded-xl bg-[#f8620c] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          미생성분만 일괄 생성
        </button>
        <button
          type="button"
          disabled={busy || selected.length === 0}
          onClick={() => void runGenerate(true)}
          className="rounded-xl border border-[#f8620c] px-4 py-2 text-sm font-semibold text-[#f8620c] disabled:opacity-50"
        >
          전체 재생성
        </button>
      </div>

      {message ? (
        <p className="mt-4 rounded-lg bg-[#f8f5f2] p-3 text-sm text-[#333]">
          {message}
        </p>
      ) : null}

      <section className="mt-8">
        <h2 className="text-base font-semibold text-[#171717]">
          선택된 파일럿 ({selected.length})
        </h2>
        {selected.length === 0 ? (
          <p className="mt-2 text-sm text-[#666]">아직 선택된 사료가 없습니다.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {selected.map((apiId) => {
              const item = catalogById.get(apiId);
              const status = contentStatus[apiId];
              return (
                <li
                  key={apiId}
                  className="flex items-start justify-between gap-2 rounded-xl border border-[#eee] px-3 py-2 text-sm"
                >
                  <div>
                    <span className="font-mono text-xs text-[#888]">{apiId}</span>
                    <p className="font-medium text-[#171717]">
                      {item?.label ?? apiId}
                    </p>
                  </div>
                  <span
                    className={
                      status
                        ? "shrink-0 text-xs text-green-700"
                        : "shrink-0 text-xs text-[#999]"
                    }
                  >
                    {status ? "생성됨" : "미생성"}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-base font-semibold text-[#171717]">사료 검색</h2>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="브랜드·이름·apiId 검색"
          className="mt-2 w-full rounded-lg border border-[#ddd] px-3 py-2 text-sm"
        />
        <ul className="mt-3 max-h-96 space-y-1 overflow-y-auto">
          {filteredCatalog.map((item) => {
            const checked = selected.includes(item.apiId);
            return (
              <li key={item.apiId}>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 hover:bg-[#f8f5f2]">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleFeed(item.apiId)}
                  />
                  <span className="font-mono text-xs text-[#888]">
                    {item.apiId}
                  </span>
                  <span className="text-sm text-[#171717]">{item.label}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}

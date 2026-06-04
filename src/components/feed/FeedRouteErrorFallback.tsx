"use client";

import Link from "next/link";
import { useEffect } from "react";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

/** Food Search·Food Detail 라우트 — raw JS 오류 대신 안내 화면 */
export function FeedRouteErrorFallback({ error, reset }: Props) {
  useEffect(() => {
    console.error("[feed-route]", error);
  }, [error]);

  return (
    <main className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-[min(100%,375px)] flex-col bg-white pb-[max(2rem,env(safe-area-inset-bottom))]">
      <div className="px-6 pt-[max(2rem,env(safe-area-inset-top))]">
        <h1 className="text-xl font-bold text-[#171717]">
          잠시 문제가 발생했어요
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[#555]">
          사료 정보를 불러오는 중 오류가 발생했습니다. 다시 시도하거나 사료
          찾기로 돌아가 주세요.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={reset}
            className="flex h-14 items-center justify-center rounded-xl bg-[#f8620c] text-base font-semibold text-white"
          >
            다시 시도
          </button>
          <Link
            href="/feed-find"
            prefetch={false}
            className="flex h-14 items-center justify-center rounded-xl border border-[#dedee0] bg-white text-base font-semibold text-[#171717]"
          >
            사료 찾기로 돌아가기
          </Link>
          <Link
            href="/step1"
            prefetch={false}
            className="flex h-14 items-center justify-center rounded-xl border border-[#dedee0] bg-white text-base font-semibold text-[#171717]"
          >
            급여량 계산하러 가기
          </Link>
        </div>
      </div>
    </main>
  );
}

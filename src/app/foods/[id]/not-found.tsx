import Link from "next/link";

import { IconBack } from "@/components/wireframe/icons";

export default function FoodDetailNotFound() {
  return (
    <main className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-[min(100%,375px)] flex-col bg-white pb-[max(2rem,env(safe-area-inset-bottom))]">
      <div className="flex shrink-0 items-center px-4 pt-[max(8px,env(safe-area-inset-top))]">
        <Link
          href="/feed-find"
          aria-label="사료 찾기로 돌아가기"
          className="relative flex size-12 shrink-0 items-center justify-center text-[#171717]"
        >
          <IconBack />
        </Link>
        <p className="flex-1 text-center text-base font-semibold text-[#171717]">
          사료 상세 정보
        </p>
        <span className="size-12 shrink-0" aria-hidden />
      </div>
      <div className="px-6 pt-2">
      <h1 className="text-xl font-bold text-[#171717]">
        사료 정보를 찾을 수 없어요
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-[#555]">
        링크가 만료되었거나 등록되지 않은 사료일 수 있어요. 사료 찾기에서
        다시 검색해 주세요.
      </p>
      <Link
        href="/feed-find"
        prefetch={false}
        className="mt-8 flex h-14 items-center justify-center rounded-xl bg-[#f8620c] text-base font-semibold text-white"
      >
        사료 찾기로 이동
      </Link>
      </div>
    </main>
  );
}

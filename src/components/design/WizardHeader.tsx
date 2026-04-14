import type { ReactNode } from "react";

import { AppLogo } from "@/components/design/AppLogo";

type WizardHeaderProps = {
  /** 결과 화면 등: 우측 액션(예: 이미지 저장). 있으면 피그마 헤더(56px, blur, 좌우 정렬) */
  trailing?: ReactNode;
};

/** 홈(`page.tsx`)과 동일: 상단 고정 느낌의 로고 줄 — 부모는 `relative` + 콘텐츠는 `pt-20` 권장 */
export function WizardHeader({ trailing }: WizardHeaderProps) {
  if (trailing) {
    return (
      <header className="absolute left-0 top-0 z-10 flex h-[56px] min-h-[56px] max-h-[56px] w-full items-center justify-between bg-transparent pl-4 pr-1 min-[360px]:pl-6 min-[360px]:pr-2">
        <AppLogo />
        {trailing}
      </header>
    );
  }

  return (
    <header className="absolute left-0 top-0 z-10 flex w-full bg-transparent px-4 py-4 min-[360px]:px-6">
      <AppLogo />
    </header>
  );
}

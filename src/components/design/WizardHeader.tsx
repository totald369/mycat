import { AppLogo } from "@/components/design/AppLogo";

/** 홈(`page.tsx`)과 동일: 상단 고정 느낌의 로고 줄 — 부모는 `relative` + 콘텐츠는 `pt-20` 권장 */
export function WizardHeader() {
  return (
    <header className="absolute left-0 top-0 z-10 flex w-full bg-transparent px-6 py-4">
      <AppLogo />
    </header>
  );
}

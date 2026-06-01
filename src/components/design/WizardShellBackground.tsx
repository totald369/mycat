"use client";

import { usePathname } from "next/navigation";

import { WizardPageBackground } from "@/components/design/WizardPageBackground";

const WIZARD_BG_PATHS = new Set([
  "/",
  "/step1",
  "/step2",
  "/step3",
  "/result",
]);

/** 위저드·홈 공통 배경 — 페이지 전환 시 fixed 중복 마운트로 이전 화면이 겹치는 현상 방지 */
export function WizardShellBackground() {
  const pathname = usePathname();

  if (!WIZARD_BG_PATHS.has(pathname)) {
    return null;
  }

  const isHome = pathname === "/";
  const isResult = pathname === "/result";

  return (
    <WizardPageBackground
      priority={isResult}
      quality={isHome ? 58 : isResult ? 68 : 62}
    />
  );
}

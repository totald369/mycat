/**
 * 320px 폭(iPhone SE 등) ~ 375px 피그마 기준 공통 레이아웃.
 * 좁은 화면에서는 가로 패딩·카드 패딩을 줄여 비율을 맞춤.
 */

/** 최대 375px, 뷰포트보다 넓어지지 않음 */
export const wizardAppWidthClass = "w-full max-w-[min(100%,375px)]";

/** 전면 팝업 오버레이 — 페이지 셸(375px) 중앙 정렬 */
export const wizardModalOverlayClass =
  "fixed inset-0 z-[100] flex min-h-[100dvh] justify-center font-sans";

/** 계산 중 등 상위 레이어 팝업 */
export const wizardModalOverlayElevatedClass =
  "fixed inset-0 z-[200] flex min-h-[100dvh] justify-center font-sans";

/** 오버레이 내부 패널 — 앱 페이지와 동일 너비 */
export const wizardModalPanelClass =
  `flex min-h-[100dvh] w-full flex-col ${wizardAppWidthClass}`;

/** 최대 375px, 뷰포트보다 넓어지지 않음 */
export const wizardShellClass =
  `relative z-10 mx-auto min-h-screen ${wizardAppWidthClass} overflow-x-hidden bg-transparent`;

export const wizardShellClassResult =
  `relative z-10 mx-auto min-h-screen ${wizardAppWidthClass} overflow-x-hidden overflow-y-visible bg-transparent`;

/** 홈: 세로 스크롤 가능(하단 SEO 안내·FAQ), 가로만 클립 */
export const wizardShellHomeClass =
  `relative z-10 mx-auto min-h-[100dvh] ${wizardAppWidthClass} overflow-x-hidden overflow-y-auto bg-transparent`;

/** 피그마 Header(245:91) 아래 본문 — safe-area + 56px 바 + 8px 간격 */
export const wizardHeaderOffsetClass =
  "pt-[calc(env(safe-area-inset-top,0px)+56px+8px)]";

/** 본문 컬럼 — 하단 고정 바 짧은 화면(step1·result) */
export const wizardPageColumnClass =
  `relative flex min-h-screen w-full flex-col items-center gap-6 px-4 pb-36 ${wizardHeaderOffsetClass} min-[360px]:px-6`;

/** 본문 컬럼 — 하단 바 여유 큰 화면(step2·step3) */
export const wizardPageColumnClassBarTall =
  `relative flex min-h-screen w-full flex-col items-center gap-6 px-4 pb-40 ${wizardHeaderOffsetClass} min-[360px]:px-6`;

/** 피그마 327 기준 콘텐츠 폭 — 부모 패딩 안에서 100% 이하 */
export const wizardContentWidthClass =
  "flex w-full max-w-[min(327px,100%)] flex-col gap-4";

/** 327 폭 블록(필드 그룹 등), flex gap 없음 */
export const wizardBlockWidthClass = "w-full max-w-[min(327px,100%)]";

/** step1/step3 흰 카드 (343) */
export const wizardFormCardClass =
  "w-full max-w-[min(343px,100%)] rounded-[24px] bg-white p-5 shadow-[0px_8px_32px_0px_rgba(17,17,17,0.06)] min-[360px]:p-8";

/** 카드 내부 폼 컬럼 */
export const wizardFormInnerClass =
  "mx-auto flex w-full max-w-[min(295px,100%)] flex-col gap-6 min-[360px]:gap-8";

/** 진행률 바 행 */
export const wizardProgressRowClass =
  "flex w-full max-w-[min(327px,100%)] items-center gap-2";

/** 결과 스플래시·캡처 컬럼 */
export const wizardResultContentClass =
  "flex w-full max-w-[min(327px,100%)] flex-col items-center gap-6 bg-transparent";

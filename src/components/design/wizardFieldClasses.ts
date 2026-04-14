/** 피그마 Entry 필드와 동일한 입력 스타일 */
export const wizardInputClass =
  "w-full rounded-xl border-0 bg-[#f5f1ed] px-4 py-[1.0625rem] text-base text-[#111] placeholder:text-[#afb4a6] focus:outline-none focus:ring-2 focus:ring-[#f8620c]/35 min-[360px]:px-5";

/** Figma 45:402 — row with flex-1 text + trailing icon (not absolute overlay). */
export const wizardInputRowClass =
  "flex min-w-0 w-full items-center gap-2 overflow-hidden rounded-xl bg-[#f5f1ed] px-4 py-[1.0625rem] focus-within:ring-2 focus-within:ring-[#f8620c]/35 min-[360px]:px-5";

/** `<input>` inside `wizardInputRowClass` */
export const wizardInputInRowClass =
  "min-w-0 flex-1 border-0 bg-transparent text-base text-[#111] placeholder:text-[#afb4a6] focus:outline-none truncate";

export const wizardChoiceClass =
  "rounded-xl border border-[#dedee0] bg-white py-3 text-center text-base font-medium text-[#111] transition";

/** 텍스처는 `WizardSelectedChoiceLayers` — 배경색은 레이어에서 처리 */
export const wizardChoiceSelectedClass =
  "relative overflow-hidden rounded-xl border-0 bg-transparent py-3 text-center text-base font-bold text-white ring-0";

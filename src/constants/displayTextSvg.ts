import { DESIGN_RESOURCE_DISPLAY } from "@/components/design/designResourcePaths";

export type DisplaySvgText = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

const svg = (
  name: string,
  width: number,
  height: number,
  alt: string,
): DisplaySvgText => ({
  src: `${DESIGN_RESOURCE_DISPLAY}/${name}.svg`,
  width,
  height,
  alt,
});

export const DISPLAY_TITLE = {
  homeMain: svg("text-title-7", 249, 92, "칼로리를 계산하고 있습니다"),
  homeLine1Left: svg("text-title-1", 63, 40, "우리"),
  homeLine1Right: svg("text-title-2", 63, 40, "냥이에게"),
  homeLine2: svg("text-title-3", 237, 80, "적정 칼로리 맞춰요"),
  step1: svg("text-title-4", 200, 32, "Step 1 기본정보"),
  step2: svg("text-title-5", 200, 32, "Step 2 활동/체형"),
  step3: svg("text-title-6", 200, 32, "Step 3 급여정보"),
  step3Calculating: svg(
    "text-title-7",
    249,
    92,
    "칼로리를 계산하고 있습니다",
  ),
  resultComplete: svg("text-title-8", 150, 40, "계산 완료"),
  resultBalanced: svg("text-title-9", 257, 40, "균형잡힌 식사"),
  resultHigh: svg("text-title-11", 187, 40, "배불러요"),
  resultLow: svg("text-title-10", 208, 40, "배고파요"),
} as const;

export const DISPLAY_BUTTON = {
  start: svg("text-button-1", 81, 32, "시작하기"),
  step1Next: svg("text-button-2", 54, 32, "다음"),
  step2Prev: svg("text-button-3", 54, 32, "이전"),
  step2Next: svg("text-button-4", 54, 32, "다음"),
  step3Prev: svg("text-button-3", 54, 32, "이전"),
  step3Next: svg("text-button-4", 54, 32, "다음"),
  prev: svg("text-button-2", 54, 32, "이전"),
  next: svg("text-button-3", 54, 32, "다음"),
  result: svg("text-button-5", 86, 32, "결과 보기"),
  retry: svg("text-button-5", 86, 32, "다시 계산"),
  share: svg("text-button-6", 86, 32, "공유하기"),
} as const;

export const DISPLAY_CARD = {
  foodAnalysis: svg("text-card-1", 103, 20, "사료 성분 분석"),
  weightGuide: svg("text-card-2", 119, 20, "체중 관리 가이드"),
  activity: svg("text-card-3", 99, 20, "활동량 최적화"),
} as const;

import { homeFigma } from "@/components/design/homeFigmaPaths";

export type HomeFeatureCard = {
  id: string;
  title: string;
  body: string;
  className: string;
  icon: string;
};

export const HOME_FEATURE_CARDS: readonly HomeFeatureCard[] = [
  {
    id: "food-analysis",
    title: "사료 성분 분석",
    body: "다양한 브랜드 사료의 영양 성분을 바탕으로 정밀한 분석을 제공합니다.",
    className: "bg-[#fddec6]",
    icon: homeFigma.icCatfood,
  },
  {
    id: "weight-guide",
    title: "체중 관리 가이드",
    body: "현재 체중과 목표 체중 사이의 이상적인 밸런스를 제안합니다.",
    className: "bg-[#bfece9]",
    icon: homeFigma.icCatscale,
  },
  {
    id: "activity",
    title: "활동량 최적화",
    body: "활동 패턴에 맞춘 활동 에너지 요구량을 자동으로 계산합니다.",
    className: "bg-[#d5d7ff]",
    icon: homeFigma.icCatactive,
  },
];

import type { Metadata } from "next";

export type SeoLandingPageData = {
  path: string;
  title: string;
  description: string;
  h1: string;
  keyword: string;
  sections: Array<{
    heading: string;
    paragraphs: string[];
  }>;
};

function buildSections(keyword: string, focus: string): SeoLandingPageData["sections"] {
  return [
    {
      heading: `${keyword} 계산 원리`,
      paragraphs: [
        `${keyword}을 정확하게 잡으려면 먼저 고양이의 기초 에너지 요구량과 실제 생활 패턴을 함께 봐야 합니다. 같은 몸무게라도 활동량, 나이, 체형, 중성화 여부에 따라 필요한 칼로리가 달라지기 때문에 단순히 제품 봉투의 평균 표만 따르는 방식은 오차가 커질 수 있습니다. 우리냥이 계산기는 이런 변수를 단계적으로 입력해 고양이 보호자가 바로 적용 가능한 일일 급여 가이드를 제공하도록 설계했습니다.`,
        `특히 ${focus} 상황에서는 하루 총 칼로리뿐 아니라 간식 칼로리 비중까지 함께 계산하는 것이 중요합니다. 간식이 잦으면 사료 섭취량을 조금 줄여 균형을 맞춰야 하고, 반대로 간식을 거의 먹지 않는 아이는 사료 중심으로 권장 칼로리를 채워야 합니다. 이처럼 ${keyword}은 단순 숫자 한 줄이 아니라, 생활 전반을 반영해 지속적으로 조정해야 하는 관리 지표입니다.`,
      ],
    },
    {
      heading: "체중, 활동량, 중성화 여부가 급여량에 미치는 영향",
      paragraphs: [
        `고양이 급여량에서 체중은 출발점이지만 정답은 아닙니다. 예를 들어 같은 5kg 고양이라도 실내 생활 위주로 대부분 쉬는 아이와, 집 안에서 자주 뛰고 사냥놀이를 오래 하는 아이의 필요 에너지는 분명히 다릅니다. 따라서 ${keyword}을 계산할 때는 체중 입력 후 반드시 활동량을 함께 반영해야 실제 급여 계획에 가까운 결과를 얻을 수 있습니다.`,
        `중성화 여부 또한 보호자가 가장 자주 놓치는 요소입니다. 중성화 이후에는 호르몬 변화로 에너지 소비 패턴이 달라지고, 식욕은 증가하는 경향이 있어 기존 급여량을 그대로 유지하면 체중이 서서히 오르기 쉽습니다. 그래서 중성화 고양이의 ${keyword}은 정기적으로 재확인해야 하며, 체형 점검과 함께 월 단위로 미세 조정하는 습관이 필요합니다.`,
      ],
    },
    {
      heading: `${focus} 기준으로 실전 적용하는 방법`,
      paragraphs: [
        `${focus}에 맞춰 급여 계획을 세울 때는 하루 총량을 한 번에 정하고 끝내기보다, 2주 정도 관찰 주기를 두고 반응을 확인하는 방식이 안전합니다. 먼저 계산 결과를 기준으로 급여를 시작한 뒤 변 상태, 식욕, 활동성, 체형 변화를 기록해 보세요. 기록이 있으면 ${keyword} 조정의 근거가 명확해져 보호자가 과도하게 줄이거나 늘리는 실수를 피할 수 있습니다.`,
        `또한 사료를 바꾸는 시기에는 성분과 칼로리 밀도가 달라져 동일한 그램 수라도 섭취 칼로리가 크게 달라질 수 있습니다. 새 사료로 전환할 때는 기존 급여량을 그대로 복사하지 말고, 제품 기준 칼로리와 계산기 결과를 대조해 시작량을 다시 설정해야 합니다. 이 과정을 거치면 ${keyword}을 현실적으로 유지하면서도 과체중과 영양 불균형 위험을 함께 낮출 수 있습니다.`,
      ],
    },
    {
      heading: "보호자가 자주 하는 급여량 계산 실수",
      paragraphs: [
        `첫 번째 실수는 간식을 급여량 계산에서 제외하는 것입니다. 트릿, 습식 토핑, 영양제 젤리처럼 작은 간식도 누적되면 하루 칼로리에서 큰 비중을 차지할 수 있습니다. ${keyword}을 계산할 때 간식을 포함하지 않으면 결과적으로 사료가 과잉 공급되어 체중 증가가 반복될 가능성이 높습니다.`,
        `두 번째 실수는 체형 변화가 보이는데도 기존 급여량을 오래 고정하는 것입니다. 계절, 활동 패턴, 건강 상태에 따라 필요 칼로리는 계속 바뀌기 때문에 최소 월 1회는 계산값을 다시 확인하고, 체형 점수를 기준으로 미세하게 조정해야 합니다. ${keyword}은 한 번 계산하고 끝나는 수치가 아니라, 반려묘 생애 전반에 걸쳐 업데이트해야 하는 관리 루틴입니다.`,
      ],
    },
    {
      heading: "건강한 급여 관리를 위한 점검 루틴",
      paragraphs: [
        `급여 관리를 쉽게 유지하려면 매일 같은 시간대에 급여하고, 주 1회는 체중 또는 체형 사진을 기록하는 방식을 추천합니다. 수치와 기록이 함께 쌓이면 ${keyword} 조정이 훨씬 쉬워집니다. 보호자가 감으로 판단하는 대신 데이터로 비교할 수 있어, 급여 계획 변경 시 불안감도 줄어듭니다.`,
        `우리냥이 계산기를 활용하면 기본 정보와 급여 정보를 입력해 현재 섭취 칼로리와 권장 칼로리 차이를 빠르게 파악할 수 있습니다. 차이가 작은 구간에서는 유지 전략을, 차이가 큰 구간에서는 단계적 감량 또는 증량 전략을 적용해 보세요. 이런 방식은 ${keyword}을 안정적으로 맞추는 데 가장 현실적인 접근입니다.`,
      ],
    },
    {
      heading: "메인 계산기로 바로 확인하기",
      paragraphs: [
        `아래 계산기 링크에서 체중, 활동량, 중성화 여부, 사료 종류를 입력하면 지금 상태에 맞는 ${keyword}을 바로 확인할 수 있습니다. 결과 페이지에서는 권장 칼로리와 실제 급여 칼로리의 차이를 함께 보여주므로, 보호자가 어떤 부분을 먼저 조정해야 할지 빠르게 판단할 수 있습니다.`,
        `정답은 한 번에 완성되지 않습니다. 계산값을 기준으로 시작하고, 반려묘의 실제 반응을 보고 주기적으로 업데이트하는 것이 가장 정확한 방법입니다. 지금 바로 계산을 시작해 우리 아이에게 맞는 ${keyword} 루틴을 만들어 보세요.`,
      ],
    },
  ];
}

export const SEO_LANDING_PAGES: SeoLandingPageData[] = [
  {
    path: "/cat-food-amount",
    title: "Cat Food Amount Guide | 고양이 사료 급여량 계산 가이드",
    description:
      "고양이 사료 급여량을 체중, 활동량, 중성화 여부에 맞춰 계산하는 방법과 실전 관리 팁을 확인하세요.",
    h1: "고양이 사료 급여량 계산 가이드",
    keyword: "고양이 사료 급여량",
    sections: buildSections("고양이 사료 급여량", "일반 성묘"),
  },
  {
    path: "/cat-calorie-calculator",
    title: "Cat Calorie Calculator | 고양이 칼로리 계산 완전 가이드",
    description:
      "고양이 칼로리 계산 방법, 하루 사료 양 조절 기준, 실전 점검 루틴까지 한 번에 확인하세요.",
    h1: "고양이 칼로리 계산 완전 가이드",
    keyword: "고양이 칼로리 계산",
    sections: buildSections("고양이 칼로리 계산", "실내 생활 고양이"),
  },
  {
    path: "/고양이-사료-급여량",
    title: "고양이 사료 급여량 | 하루 급여 기준과 계산 방법",
    description:
      "고양이 하루 사료 양과 적정 급여량을 계산하는 방법, 영향 요인, 점검 루틴을 자세히 안내합니다.",
    h1: "고양이 사료 급여량, 어떻게 계산해야 할까요?",
    keyword: "고양이 적정 급여량",
    sections: buildSections("고양이 적정 급여량", "평균 체형의 성묘"),
  },
  {
    path: "/고양이-3kg-사료-급여량",
    title: "고양이 3kg 사료 급여량 | 체중별 급여 가이드",
    description:
      "3kg 고양이의 하루 사료 양과 칼로리 계산 기준, 활동량·중성화 여부에 따른 조정법을 확인하세요.",
    h1: "고양이 3kg 사료 급여량 계산 가이드",
    keyword: "고양이 3kg 사료 급여량",
    sections: buildSections("고양이 3kg 사료 급여량", "3kg 전후의 소형 체형 고양이"),
  },
  {
    path: "/고양이-5kg-사료-급여량",
    title: "고양이 5kg 사료 급여량 | 체중별 급여 기준",
    description:
      "5kg 고양이 급여량 계산 방법과 칼로리 조정 기준을 확인하고 과급여를 예방하세요.",
    h1: "고양이 5kg 사료 급여량 계산 가이드",
    keyword: "고양이 5kg 사료 급여량",
    sections: buildSections("고양이 5kg 사료 급여량", "5kg 내외 중대형 체형 고양이"),
  },
  {
    path: "/중성화-고양이-급여량",
    title: "중성화 고양이 급여량 | 칼로리와 사료량 조절법",
    description:
      "중성화 고양이의 적정 급여량과 하루 사료 양을 계산하고 체중 증가를 예방하는 방법을 안내합니다.",
    h1: "중성화 고양이 급여량 계산 가이드",
    keyword: "중성화 고양이 급여량",
    sections: buildSections("중성화 고양이 급여량", "중성화 이후 체중 관리 단계"),
  },
];

export function getSeoLandingPage(path: string): SeoLandingPageData {
  const page = SEO_LANDING_PAGES.find((item) => item.path === path);
  if (!page) {
    throw new Error(`Unknown SEO landing page path: ${path}`);
  }
  return page;
}

export function buildSeoMetadata(path: string): Metadata {
  const page = getSeoLandingPage(path);
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: path },
    openGraph: {
      title: page.title,
      description: page.description,
      url: `https://meowdiet.com${path}`,
      type: "article",
      locale: "ko_KR",
      siteName: "우리냥이",
    },
  };
}

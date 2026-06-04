/** SEO·접근성용 이미지 대체 텍스트 (장식·아이콘) */
export const IMAGE_ALT = {
  pageBackground: "페이지 배경",
  selectedTexture: "선택 항목 배경",
  menu: "메뉴",
  catIllustration: "고양이 일러스트",
  saveResult: "결과 이미지 저장",
  emptySearch: "검색 결과 없음",
  pawButton: "버튼 배경",
} as const;

export function bcsIconAlt(label: string): string {
  return `${label} 체형 고양이 일러스트`;
}

export function resultHeroAlt(headline: string): string {
  return `${headline} 상태 고양이 일러스트`;
}

export function featureIconAlt(title: string): string {
  return `${title} 아이콘`;
}

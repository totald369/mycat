/**
 * Design assets under `public/design-resource/`
 * - `icon/`: SVG icons and button chrome
 * - `display/`: Title / wordmark SVGs (e.g. Kkukkukk replacement from Figma)
 * - `img/`: WebP
 */
export const DESIGN_RESOURCE = "/design-resource";
export const DESIGN_RESOURCE_ICON = `${DESIGN_RESOURCE}/icon`;
/** Wordmark SVGs: `${DESIGN_RESOURCE_DISPLAY}/your-file.svg` */
export const DESIGN_RESOURCE_DISPLAY = `${DESIGN_RESOURCE}/display`;
export const DESIGN_RESOURCE_IMG = `${DESIGN_RESOURCE}/img`;

/** 에셋 URL 모음 (홈·위저드·결과 공통) */
export const designResource = {
  /** 풀스크린 배경 WebP */
  background: `${DESIGN_RESOURCE_IMG}/Background.webp`,
  /** 528×657 @3x 일러스트 (결과 히어로 등) */
  catTitle: `${DESIGN_RESOURCE_IMG}/Img_Cat_full.webp`,
  /** 홈 타이틀 “우리 ○○에게” 삽화 */
  catImg: `${DESIGN_RESOURCE_IMG}/cat_img.webp`,
  logo: `${DESIGN_RESOURCE_ICON}/Logo.svg`,
  pawPrimaryFull: `${DESIGN_RESOURCE_ICON}/PP_BTN_Container_100.svg`,
  pawPrimaryLeading: `${DESIGN_RESOURCE_ICON}/PP_BTN_Container_50_L.svg`,
  pawPrimaryTrailing: `${DESIGN_RESOURCE_ICON}/PP_BTN_Container_50_R.svg`,
  pawSecondaryLeading: `${DESIGN_RESOURCE_ICON}/SP_BTN_Container_50_L.svg`,
  pawSecondaryTrailing: `${DESIGN_RESOURCE_ICON}/SP_BTN_Container_50_R.svg`,
  iconCatFood: `${DESIGN_RESOURCE_ICON}/Ic_catfood.svg`,
  iconCatScale: `${DESIGN_RESOURCE_ICON}/ic_catscale.svg`,
  iconCatActive: `${DESIGN_RESOURCE_ICON}/Ic_catactive.svg`,
  iconCalendar: `${DESIGN_RESOURCE_ICON}/Ic_Calendar.svg`,
  /** 결과 화면 헤더 — 이미지 저장(피그마 Image_down_Touch_area) */
  imageDownTouchArea: `${DESIGN_RESOURCE_ICON}/Image_down_Touch_area.svg`,
  /** 위저드 선택 칩 브라운 레이어 텍스처 */
  selectedChoiceTexture: `${DESIGN_RESOURCE_IMG}/Selected_Button_texture.webp`,
} as const;

/** Step2 BCS 라벨 → 일러스트 SVG (calculator `BCS_TO_BODY`와 동일 키) */
export const BCS_LABEL_TO_ICON: Record<
  "매우 마름" | "마름" | "정상" | "과체중" | "비만",
  string
> = {
  "매우 마름": `${DESIGN_RESOURCE_ICON}/Ic_cat_very_thin.svg`,
  마름: `${DESIGN_RESOURCE_ICON}/Ic_cat_thin.svg`,
  정상: `${DESIGN_RESOURCE_ICON}/Ic_cat_nomal.svg`,
  과체중: `${DESIGN_RESOURCE_ICON}/Ic_cat_over_weight.svg`,
  비만: `${DESIGN_RESOURCE_ICON}/Ic_cat_obessed.svg`,
};

/** 원본 @3x 기준 → CSS 논리 px */
export const DESIGN_RESOURCE_PX = {
  /** Background 원본 한 변(논리) */
  background: 3402 / 3,
  catTitle: { w: 528 / 3, h: 657 / 3 },
  /** cat_img 원본 135×189 → 피그마 논리 45×63 (÷3) */
  catImg: { w: 135, h: 189 },
} as const;

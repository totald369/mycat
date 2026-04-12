/** 홈·위저드 공통 `public/figma/home/` 에셋 */
export const HOME_FIGMA = "/figma/home";

export const homeFigma = {
  /** @3x 3402² → 논리 1134×1134px 표시 */
  backgroundPng: `${HOME_FIGMA}/Background.png`,
  /** 파일 528×657px = 피그마 176×219 @3x */
  catTitlePng: `${HOME_FIGMA}/Img_Cat_full.png`,
  /** 홈 타이틀 “우리 ○○에게” 삽화 — `cat_img.png` 원본 그대로 */
  catImgPng: `${HOME_FIGMA}/cat_img.png`,
  logoSvg: `${HOME_FIGMA}/Logo.svg`,
  pawBtn100: `${HOME_FIGMA}/PP_BTN_Container_100.svg`,
  pawBtn50L_PP: `${HOME_FIGMA}/PP_BTN_Container_50_L.svg`,
  pawBtn50R_PP: `${HOME_FIGMA}/PP_BTN_Container_50_R.svg`,
  pawBtn50L_SP: `${HOME_FIGMA}/SP_BTN_Container_50_L.svg`,
  pawBtn50R_SP: `${HOME_FIGMA}/SP_BTN_Container_50_R.svg`,
  icCatfood: `${HOME_FIGMA}/Ic_catfood.svg`,
  icCatscale: `${HOME_FIGMA}/ic_catscale.svg`,
  icCatactive: `${HOME_FIGMA}/Ic_catactive.svg`,
  /** 선택된 위저드 초이스 버튼 — 브라운 위 오버레이 */
  selectedButtonTexturePng: `${HOME_FIGMA}/Selected_Button_texture.png`,
} as const;

/** UI 라벨 → BCS 일러스트 SVG (calculator `BCS_TO_BODY`와 동일 키) */
export const BCS_LABEL_TO_ICON: Record<
  "매우 마름" | "마름" | "정상" | "과체중" | "비만",
  string
> = {
  "매우 마름": `${HOME_FIGMA}/Ic_cat_very_thin.svg`,
  마름: `${HOME_FIGMA}/Ic_cat_thin.svg`,
  정상: `${HOME_FIGMA}/Ic_cat_nomal.svg`,
  과체중: `${HOME_FIGMA}/Ic_cat_over_weight.svg`,
  비만: `${HOME_FIGMA}/Ic_cat_obessed.svg`,
};

/** PNG @3x → CSS 논리 px */
export const HOME_PX = {
  /** Background.png 논리 한 변 길이 */
  background: 3402 / 3,
  /** Img_Cat_* 논리 프레임 */
  catTitle: { w: 528 / 3, h: 657 / 3 },
  /**
   * cat_img.png (@3x) — 파일 135×189px → 피그마 논리 45×63 (÷3)
   */
  catImg: { w: 135, h: 189 },
} as const;

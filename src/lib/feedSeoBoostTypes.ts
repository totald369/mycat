/** OpenAI 생성 + DB/JSON 캐시에 저장되는 SEO 부스트 콘텐츠 */
export type FeedSeoBoostSource = "openai" | "rule";

export type FeedSeoBoostContentData = {
  recommendedFor: string[];
  feedingNotes: string;
  comparisonPoints: string[];
  /** 빌드 캐시용 — openai: GPT 생성, rule: 규칙 기반 */
  source?: FeedSeoBoostSource;
};

export type FeedSeoBoostCacheFile = {
  version: number;
  exportedAt: string;
  pilotFeedApiIds: string[];
  contents: Record<string, FeedSeoBoostContentData>;
};

export const SEO_BOOST_PROMPT_VERSION = "1";
/** GSC 파일럿 + 브랜드 일괄 등록 등 — 로얄캐닌 전체(63) 포함 여유 */
export const SEO_BOOST_PILOT_MAX = 100;

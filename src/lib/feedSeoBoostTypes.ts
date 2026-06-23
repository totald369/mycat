/** OpenAI 생성 + DB/JSON 캐시에 저장되는 SEO 부스트 콘텐츠 */
export type FeedSeoBoostContentData = {
  recommendedFor: string[];
  feedingNotes: string;
  comparisonPoints: string[];
};

export type FeedSeoBoostCacheFile = {
  version: number;
  exportedAt: string;
  pilotFeedApiIds: string[];
  contents: Record<string, FeedSeoBoostContentData>;
};

export const SEO_BOOST_PROMPT_VERSION = "1";
export const SEO_BOOST_PILOT_MAX = 20;

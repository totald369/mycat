import type { FeedDetailItem } from "@/lib/catFoodCsv";
import {
  feedCategoryLabel,
  feedConditionLabel,
  feedTypeLabel,
  lifeStageLabel,
} from "@/lib/feedDetailLabels";
import { extractMainIngredients } from "@/lib/feedDetailSeo";
import type { FeedSeoBoostContentData } from "@/lib/feedSeoBoostTypes";
import { safeNumber, safeString } from "@/lib/feedSafeValues";

export type SimilarFeedSummary = {
  label: string;
  kcalPer100g: number;
  lifeStage: string | null;
};

const FORBIDDEN_PATTERNS: RegExp[] = [
  /치료/g,
  /완치/g,
  /예방/g,
  /효과가\s*있/g,
  /효과가\s*있다/g,
  /치료한다/g,
  /예방한다/g,
];

export function containsForbiddenPhrasing(text: string): string[] {
  const hits: string[] = [];
  for (const re of FORBIDDEN_PATTERNS) {
    if (re.test(text)) hits.push(re.source);
    re.lastIndex = 0;
  }
  return hits;
}

export function sanitizeForbiddenPhrasing(text: string): string {
  return text
    .replace(/치료/g, "건강 관리")
    .replace(/완치/g, "관리")
    .replace(/예방/g, "관리")
    .replace(/효과가\s*있다/g, "적합할 수 있음")
    .replace(/효과가\s*있/g, "적합할 수 있음");
}

export function buildSeoBoostPrompt(
  feed: FeedDetailItem,
  similarFeeds: SimilarFeedSummary[],
): string {
  const brand = safeString(feed.brand).trim();
  const name = safeString(feed.name).trim();
  const mainIngs = extractMainIngredients(feed.ingredients, 5);
  const similarBlock =
    similarFeeds.length > 0
      ? similarFeeds
          .map(
            (s) =>
              `- ${s.label}: ${s.kcalPer100g} kcal/100g, ${lifeStageLabel(s.lifeStage)}`,
          )
          .join("\n")
      : "- (비교 대상 없음)";

  return `당신은 반려묘 사료 정보를 설명하는 한국어 콘텐츠 작성자입니다.
아래 사료 데이터만 근거로 JSON을 작성하세요. 의학적 단정·치료·예방 표현은 금지합니다.

## 사료 정보
- 브랜드: ${brand}
- 사료명: ${name}
- life_stage: ${feed.lifeStage ?? "미상"} (${lifeStageLabel(feed.lifeStage)})
- kcal_per_100g: ${safeNumber(feed.kcalPer100g) ?? feed.kcalPer100g}
- 유형: ${feedTypeLabel(feed.rawType, feed.feedKind)}
- category: ${feedCategoryLabel(feed.category)}
- condition: ${feedConditionLabel(feed.feedCondition)}
- 주요 원료: ${mainIngs.join(", ") || "미표기"}
- 등록성분: ${safeString(feed.nutritionAnalysis).trim() || "미표기"}

## 비교 참고 사료 (같은 브랜드·유사 목적)
${similarBlock}

## 출력 JSON 스키마 (반드시 준수)
{
  "recommendedFor": ["문장1", "문장2", ...],
  "feedingNotes": "문단",
  "comparisonPoints": ["문장1", ...]
}

## 규칙
1. recommendedFor: 3~5개 bullet. 각 항목은 한 문장, 「~한 고양이」 형태 권장.
2. feedingNotes: **180~280자**(공백 포함, 150자 미만 금지). 급여 전 참고 사항. 수의사 상담 권장 표현 포함.
3. comparisonPoints: 3~5개 bullet. 위 비교 사료 또는 일반 사료 대비 칼로리·단백·목적 차이를 수치로 언급 가능.
4. 금지 단어: 치료, 완치, 예방, 효과가 있다/있
5. 권장 표현: 추천, 적합할 수 있음, 참고 가능, 수의사 상담 권장
6. 과장·허위 정보 금지. 데이터에 없는 성분·효능 창작 금지.`;
}

const FEEDING_NOTES_PAD =
  " 실제 급여량은 체중·활동량·간식에 따라 달라질 수 있으며, 건강 관리가 필요하면 수의사 상담 후 급여를 권장합니다.";

function ensureFeedingNotesLength(text: string): string {
  let notes = text.trim();
  if (notes.length > 320) {
    return `${notes.slice(0, 297).trim()}…`;
  }
  while (notes.length < 150) {
    notes += FEEDING_NOTES_PAD;
    if (notes.length > 320) {
      return `${notes.slice(0, 297).trim()}…`;
    }
  }
  return notes;
}

export function parseSeoBoostJson(raw: string): FeedSeoBoostContentData {
  const parsed = JSON.parse(raw) as Partial<FeedSeoBoostContentData>;
  const recommendedFor = Array.isArray(parsed.recommendedFor)
    ? parsed.recommendedFor.map((s) => String(s).trim()).filter(Boolean)
    : [];
  const comparisonPoints = Array.isArray(parsed.comparisonPoints)
    ? parsed.comparisonPoints.map((s) => String(s).trim()).filter(Boolean)
    : [];
  const feedingNotes = ensureFeedingNotesLength(
    String(parsed.feedingNotes ?? "").trim(),
  );

  if (recommendedFor.length < 3 || recommendedFor.length > 5) {
    throw new Error(`recommendedFor must be 3~5 items, got ${recommendedFor.length}`);
  }
  if (comparisonPoints.length < 3 || comparisonPoints.length > 5) {
    throw new Error(
      `comparisonPoints must be 3~5 items, got ${comparisonPoints.length}`,
    );
  }
  if (feedingNotes.length < 150 || feedingNotes.length > 320) {
    throw new Error(
      `feedingNotes length must be 150~300 chars, got ${feedingNotes.length}`,
    );
  }

  const combined = [...recommendedFor, feedingNotes, ...comparisonPoints].join(
    " ",
  );
  const forbidden = containsForbiddenPhrasing(combined);
  if (forbidden.length > 0) {
    throw new Error(`forbidden phrasing: ${forbidden.join(", ")}`);
  }

  return { recommendedFor, feedingNotes, comparisonPoints };
}

export function normalizeSeoBoostContent(
  data: FeedSeoBoostContentData,
): FeedSeoBoostContentData {
  return {
    recommendedFor: data.recommendedFor.map((s) =>
      sanitizeForbiddenPhrasing(s),
    ),
    feedingNotes: sanitizeForbiddenPhrasing(data.feedingNotes),
    comparisonPoints: data.comparisonPoints.map((s) =>
      sanitizeForbiddenPhrasing(s),
    ),
  };
}

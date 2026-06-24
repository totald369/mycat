import type { FeedDetailItem } from "@/lib/catFoodCsv";
import {
  buildFeedRecommendedTargets,
  extractMainIngredients,
} from "@/lib/feedDetailSeo";
import {
  feedCategoryLabel,
  feedConditionLabel,
  feedTypeLabel,
  lifeStageLabel,
} from "@/lib/feedDetailLabels";
import {
  normalizeSeoBoostContent,
  type SimilarFeedSummary,
} from "@/lib/feedSeoBoostPrompt";
import type { FeedSeoBoostContentData } from "@/lib/feedSeoBoostTypes";
import { safeLower, safeNumber, safeString } from "@/lib/feedSafeValues";

const TARGET_PHRASES: Record<string, string> = {
  실내묘: "실내 생활이 많은 고양이",
  중성화묘: "중성화 이후 체중 관리가 필요한 고양이",
  체중관리: "체중 관리를 함께 고려하는 고양이",
  키튼: "성장기 영양이 필요한 키튼",
  노령묘: "노령기에 맞춘 영양을 찾는 고양이",
  "비뇨기 건강": "비뇨기·요로 건강을 함께 고려하는 고양이",
  "헤어볼 케어": "헤어볼 배출을 함께 고려하는 고양이",
  "신장 케어": "신장 건강을 함께 고려하는 고양이",
  "소화기 케어": "소화기 건강을 함께 고려하는 고양이",
  성묘: "성묘의 일상 급여를 계획하는 보호자",
  전연령: "전연령 급여를 고려하는 가정",
};

function genericRecommended(feed: FeedDetailItem): string[] {
  const out: string[] = [];
  const ls = safeLower(feed.lifeStage);
  const isWet = feed.rawType === "wet" || feed.feedKind === "습식";

  if (ls.includes("indoor") || safeLower(feed.name).includes("인도어")) {
    out.push("실내 생활이 많은 고양이");
  }
  if (ls.includes("kitten") || safeLower(feed.name).includes("키튼")) {
    out.push("성장기 영양이 필요한 키튼");
  }
  if (ls.includes("senior") || safeLower(feed.name).includes("시니어")) {
    out.push("노령기에 맞춘 영양을 찾는 고양이");
  }
  if (isWet) {
    out.push("수분 섭취를 함께 고려하는 고양이");
  } else {
    out.push("건식 사료 위주로 급여하는 고양이");
  }
  out.push("100g당 칼로리 기준으로 급여량을 계산하려는 보호자");
  return out;
}

function buildRecommendedFor(feed: FeedDetailItem): string[] {
  const fromTargets = buildFeedRecommendedTargets(feed)
    .map((t) => TARGET_PHRASES[t])
    .filter((s): s is string => Boolean(s));

  const merged = [...new Set([...fromTargets, ...genericRecommended(feed)])];
  return merged.slice(0, 5);
}

function purposeHint(feed: FeedDetailItem): string {
  const cond = feedConditionLabel(feed.feedCondition);
  const cat = feedCategoryLabel(feed.category);
  if (cond && cond !== "—" && cond !== "해당 없음") {
    return `${cond} 목적 사료로 분류됩니다`;
  }
  if (cat && cat !== "—" && cat !== "일반") {
    return `${cat} 사료로 분류됩니다`;
  }
  const life = lifeStageLabel(feed.lifeStage);
  if (life && life !== "—") {
    return `${life} 급여 대상으로 설계된 제품입니다`;
  }
  return "일상 급여를 위한 사료입니다";
}

function buildFeedingNotes(feed: FeedDetailItem): string {
  const brand = safeString(feed.brand).trim() || "해당 브랜드";
  const name = safeString(feed.name).trim() || "이 사료";
  const kcal = safeNumber(feed.kcalPer100g) ?? feed.kcalPer100g;
  const typeLabel = feedTypeLabel(feed.rawType, feed.feedKind);
  const lifeLabel = lifeStageLabel(feed.lifeStage);
  const mainIngs = extractMainIngredients(feed.ingredients, 3);
  const ingPart =
    mainIngs.length > 0
      ? ` 주요 원료는 ${mainIngs.join(", ")} 등이며,`
      : " 등록성분표와 함께";

  let text =
    `${brand} ${name}는 ${lifeLabel} 대상 ${typeLabel} 사료입니다. 100g당 ${kcal}kcal이며, ${purposeHint(feed)}.${ingPart} 실제 급여량은 체중·활동량·간식 섭취에 따라 달라질 수 있습니다. 활동량이 많은 고양이는 급여량 조절을, 특정 건강 관리가 필요한 경우 수의사 상담 후 급여를 권장합니다.`;

  if (text.length < 150) {
    text +=
      " 우리냥이맘마 급여량 계산기로 하루 권장량을 참고할 수 있습니다.";
  }
  if (text.length > 300) {
    text = `${text.slice(0, 297).trim()}…`;
  }
  return text;
}

function buildComparisonPoints(
  feed: FeedDetailItem,
  similarFeeds: SimilarFeedSummary[],
): string[] {
  const kcal = safeNumber(feed.kcalPer100g) ?? feed.kcalPer100g;
  const brand = safeString(feed.brand).trim();
  const typeLabel = feedTypeLabel(feed.rawType, feed.feedKind);
  const lifeLabel = lifeStageLabel(feed.lifeStage);
  const points: string[] = [];

  for (const sim of similarFeeds.slice(0, 3)) {
    const diff = kcal - sim.kcalPer100g;
    if (Math.abs(diff) >= 15) {
      const dir = diff > 0 ? "높음" : "낮음";
      points.push(
        `${sim.label} 대비 100g당 칼로리가 ${Math.abs(diff)}kcal ${dir}`,
      );
    } else {
      points.push(`${sim.label}와 비슷한 칼로리대(${sim.kcalPer100g} kcal/100g)`);
    }
  }

  if (points.length < 3) {
    points.push(`${brand} ${lifeLabel} 라인 제품으로 같은 브랜드 내 비교 참고 가능`);
  }
  if (points.length < 3) {
    const isWet = feed.rawType === "wet" || feed.feedKind === "습식";
    points.push(
      isWet
        ? "건식 사료 대비 수분 함량이 높아 급여량 계산 시 그램·칼로리를 함께 확인"
        : "습식 사료 대비 보관·급여 편의성이 높은 건식 유형",
    );
  }
  if (points.length < 3) {
    points.push(`${typeLabel} 기준 100g당 ${kcal}kcal로 급여량 산출에 활용 가능`);
  }
  if (feed.feedCondition && feed.feedCondition !== "none") {
    const cond = feedConditionLabel(feed.feedCondition);
    if (cond && cond !== "—" && cond !== "해당 없음") {
      points.push(`일반 사료 대비 ${cond} 목적에 맞춘 제품`);
    }
  }

  return [...new Set(points)].slice(0, 5);
}

/** OpenAI 없이 사료 데이터만으로 SEO 부스트 콘텐츠 생성 */
export function buildRuleBasedSeoBoostContent(
  feed: FeedDetailItem,
  similarFeeds: SimilarFeedSummary[],
): FeedSeoBoostContentData {
  const recommendedFor = buildRecommendedFor(feed);
  while (recommendedFor.length < 3) {
    recommendedFor.push("일상 급여 정보를 참고하려는 보호자");
  }

  const comparisonPoints = buildComparisonPoints(feed, similarFeeds);
  while (comparisonPoints.length < 3) {
    comparisonPoints.push("동일 브랜드·유사 목적 사료와 칼로리·성분을 함께 비교해 선택");
  }

  return normalizeSeoBoostContent({
    recommendedFor: recommendedFor.slice(0, 5),
    feedingNotes: buildFeedingNotes(feed),
    comparisonPoints: comparisonPoints.slice(0, 5),
  });
}

export const RULE_BASED_MODEL = "rule-based-v1";

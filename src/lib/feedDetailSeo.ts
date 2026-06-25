import type { FeedDetailItem } from "@/lib/catFoodCsv";
import {
  feedConditionLabel,
  feedTypeLabel,
  lifeStageLabel,
} from "@/lib/feedDetailLabels";
import { safeLower, safeNumber, safeString } from "@/lib/feedSafeValues";
import type { FaqItem } from "@/lib/seo";

const MIN_DESC_LEN = 150;
const MAX_DESC_LEN = 300;

/** 원재료 문자열에서 상위 N개 추출 */
export function extractMainIngredients(
  ingredients: string | null | undefined,
  limit = 3,
): string[] {
  const raw = safeString(ingredients).trim();
  if (!raw) return [];
  return raw
    .split(/[,、]/)
    .map((s) => s.replace(/\([^)]*\)/g, "").trim())
    .filter((s) => s.length >= 2)
    .slice(0, limit);
}

function clampDescription(text: string): string {
  if (text.length <= MAX_DESC_LEN) return text;
  const cut = text.slice(0, MAX_DESC_LEN - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const lastComma = cut.lastIndexOf(",");
  const breakAt = Math.max(lastComma, lastSpace);
  if (breakAt > MIN_DESC_LEN) return `${cut.slice(0, breakAt).trim()}…`;
  return `${cut.trim()}…`;
}

function purposePhrase(feed: FeedDetailItem): string | null {
  const cond = safeLower(feed.feedCondition);
  const name = safeLower(feed.name);
  const combined = `${name} ${safeLower(feed.nutritionAnalysis)}`;

  if (cond === "weight" || cond === "diet" || safeLower(feed.lifeStage) === "weight_control")
    return "체중 관리를 돕도록 설계된";
  if (cond === "urinary" || combined.includes("유리너리") || combined.includes("비뇨"))
    return "비뇨기·요로 건강을 고려한";
  if (cond === "hairball" || combined.includes("헤어볼"))
    return "헤어볼 배출에 도움을 주는";
  if (cond === "kidney" || cond === "renal" || combined.includes("신장"))
    return "신장 건강을 고려한";
  if (cond === "digestive" || cond === "digestion" || combined.includes("소화"))
    return "소화기 건강을 고려한";
  if (safeLower(feed.lifeStage).includes("indoor") || combined.includes("인도어"))
    return "실내 생활 고양이를 위한";
  if (safeLower(feed.lifeStage).includes("senior") || cond === "senior")
    return "노령기 영양 요구에 맞춘";
  if (safeLower(feed.lifeStage).includes("kitten"))
    return "성장기 영양 요구에 맞춘";
  return null;
}

/**
 * 사료명·칼로리·라이프스테이지·주요 성분 기반 고유 설명 (150~300자)
 */
export function buildFeedSeoDescription(feed: FeedDetailItem): string {
  const brand = safeString(feed.brand).trim() || "—";
  const name = safeString(feed.name).trim() || "이름 없음";
  const productName = `${brand} ${name}`;
  const kcal = safeNumber(feed.kcalPer100g) ?? feed.kcalPer100g;
  const typeLabel = feedTypeLabel(feed.rawType, feed.feedKind);
  const lifeLabel = lifeStageLabel(feed.lifeStage);
  const mainIngs = extractMainIngredients(feed.ingredients);
  const purpose = purposePhrase(feed);

  let text = `${productName}는 100g당 ${kcal}kcal의 ${typeLabel} 사료입니다.`;
  if (purpose) {
    text += ` ${purpose} 제품으로, ${lifeLabel} 고양이의 일상 급여에 참고할 수 있는 칼로리·성분 정보를 제공합니다.`;
  } else {
    text += ` ${lifeLabel} 급여 대상에 맞춰 칼로리와 영양 성분을 확인할 수 있습니다.`;
  }

  if (mainIngs.length > 0) {
    text += ` 주요 원료는 ${mainIngs.join(", ")} 등이며, 등록성분표와 함께 하루 급여량 계산에 활용하세요.`;
  } else if (safeString(feed.nutritionAnalysis).trim()) {
    text += ` 등록성분 정보를 바탕으로 우리 아이 체중·활동량에 맞는 급여량을 산출할 수 있습니다.`;
  } else {
    text += ` 우리냥이맘마에서 100g당 칼로리 기준으로 맞춤 급여량을 계산해 보세요.`;
  }

  if (text.length < MIN_DESC_LEN) {
    const condLabel = feedConditionLabel(feed.feedCondition);
    if (condLabel && condLabel !== "—" && condLabel !== "해당 없음") {
      text += ` ${condLabel} 목적 사료로 분류되며, 수의사·브랜드 급여 가이드와 함께 참고하시면 좋습니다.`;
    } else {
      text += ` 건강 상태·체중·활동량에 따라 실제 급여량은 달라질 수 있으니 정기적으로 체형과 함께 조절하세요.`;
    }
  }

  return clampDescription(text);
}

/** 추천 급여 대상 태그 */
export function buildFeedRecommendedTargets(feed: FeedDetailItem): string[] {
  const targets = new Set<string>();
  const ls = safeLower(feed.lifeStage);
  const cond = safeLower(feed.feedCondition);
  const name = safeLower(feed.name);
  const nut = safeLower(feed.nutritionAnalysis);
  const combined = `${name} ${nut}`;

  if (ls.includes("kitten") || cond === "kitten" || cond === "growth") {
    targets.add("키튼");
  }
  if (ls.includes("senior") || cond === "senior") {
    targets.add("노령묘");
  }
  if (
    ls.includes("indoor") ||
    cond === "indoor" ||
    combined.includes("인도어") ||
    combined.includes("실내")
  ) {
    targets.add("실내묘");
  }
  if (ls.includes("neutered") || combined.includes("중성")) {
    targets.add("중성화묘");
  }
  if (
    ls === "weight_control" ||
    cond === "weight" ||
    cond === "diet" ||
    cond === "low_fat" ||
    combined.includes("체중") ||
    combined.includes("라이트") ||
    combined.includes("다이어트")
  ) {
    targets.add("체중관리");
  }
  if (cond === "urinary" || combined.includes("유리너리") || combined.includes("비뇨")) {
    targets.add("비뇨기 건강");
  }
  if (cond === "hairball" || combined.includes("헤어볼")) {
    targets.add("헤어볼 케어");
  }
  if (cond === "kidney" || cond === "renal" || combined.includes("신장")) {
    targets.add("신장 케어");
  }
  if (cond === "digestive" || cond === "digestion") {
    targets.add("소화기 케어");
  }
  if (ls.includes("adult") && targets.size === 0) {
    targets.add("성묘");
  }
  if (ls.includes("all_life") || ls === "all") {
    targets.add("전연령");
  }

  return Array.from(targets);
}

function kittenAgeAnswer(feed: FeedDetailItem): string {
  const ls = safeLower(feed.lifeStage);
  const name = safeLower(feed.name);
  if (ls.includes("kitten") || name.includes("키튼") || name.includes("kitten")) {
    if (ls.includes("0_4m") || name.includes("베이비") || name.includes("0~4"))
      return "제품명·급여 대상 표기상 생후 약 0~4개월 또는 이에 상응하는 초기 키튼 급여용으로 분류됩니다. 정확한 개월 수는 포장·브랜드 안내를 확인하세요.";
    if (ls.includes("4_12m"))
      return "급여 대상이 4~12개월 키튼으로 분류됩니다. 생후 12개월 전후부터 성묘용 사료로 전환 시기를 함께 검토하세요.";
    return "키튼·성장기용으로 분류된 사료입니다. 브랜드별 권장 시작 개월 수는 포장 표기를 따르는 것이 좋습니다.";
  }
  if (ls.includes("senior") || safeLower(feed.name).includes("7세") || safeLower(feed.name).includes("11세"))
    return "노령묘·시니어용 사료로, 성장기 키튼 급여용이 아닙니다. 키튼에게는 연령에 맞는 키튼 전용 사료를 선택하세요.";
  return "성묘·전연령용으로 분류되어 있어, 키튼 단독 급여용이 아닐 수 있습니다. 키튼은 연령별 키튼 전용 라인을 우선 확인하세요.";
}

function weightManagementAnswer(feed: FeedDetailItem): string {
  const ls = safeLower(feed.lifeStage);
  const cond = safeLower(feed.feedCondition);
  const name = safeLower(feed.name);
  const kcal = safeNumber(feed.kcalPer100g) ?? feed.kcalPer100g;
  const isWeight =
    ls === "weight_control" ||
    cond === "weight" ||
    cond === "diet" ||
    name.includes("체중") ||
    name.includes("라이트") ||
    name.includes("다이어트") ||
    name.includes("weight");

  if (isWeight) {
    return `체중 관리·저칼로리 목적으로 분류된 사료입니다. 100g당 ${kcal}kcal이며, 체중 감량·유지 목적일 때 수의사와 함께 총 섭취 칼로리를 조절하세요.`;
  }
  if (kcal <= 330 && feed.rawType === "dry") {
    return `100g당 ${kcal}kcal로 건식 평균 대비 낮은 편입니다. 체중 관리 보조용으로 고려할 수 있으나, 전용 체중 관리 사료와 동일하지 않을 수 있습니다.`;
  }
  return "체중 관리 전용 사료로 분류되지 않았습니다. 다이어트가 필요하면 저칼로리·고섬유 전용 라인과 수의사 상담을 함께 고려하세요.";
}

/** 사료 상세 FAQ 자동 생성 */
export function buildFeedDetailFaqs(feed: FeedDetailItem): FaqItem[] {
  const brand = safeString(feed.brand).trim() || "—";
  const name = safeString(feed.name).trim() || "이름 없음";
  const productName = `${brand} ${name}`;
  const kcal = safeNumber(feed.kcalPer100g) ?? feed.kcalPer100g;
  const typeLabel = feedTypeLabel(feed.rawType, feed.feedKind);
  const lifeLabel = lifeStageLabel(feed.lifeStage);
  const targets = buildFeedRecommendedTargets(feed);

  const faqs: FaqItem[] = [
    {
      question: `${productName}은 몇 개월부터 급여 가능한가요?`,
      answer: kittenAgeAnswer(feed),
    },
    {
      question: `${productName}은 체중 관리에 적합한가요?`,
      answer: weightManagementAnswer(feed),
    },
    {
      question: `${productName}의 100g당 칼로리는 얼마인가요?`,
      answer: `상세 페이지 상단에서 100g당 ${kcal}kcal(${typeLabel})을 확인할 수 있습니다. 하루 급여량은 체중·활동량에 따라 달라지므로 우리냥이맘마 급여량 계산기로 맞춤 산출을 권장합니다.`,
    },
    {
      question: `${productName}은 어떤 고양이에게 추천되나요?`,
      answer:
        targets.length > 0
          ? `급여 대상·성분 기준으로 ${targets.join(", ")}에게 참고할 수 있는 사료입니다. ${lifeLabel} 분류이며, 특정 질환·알레르기가 있다면 수의사와 상담 후 선택하세요.`
          : `${lifeLabel} 급여 대상으로 분류됩니다. 실내 생활·체중·건강 상태에 따라 다른 기능성 사료와 비교해 선택하세요.`,
    },
  ];

  if (targets.includes("실내묘")) {
    faqs.push({
      question: `${productName}은 실내묘에게 적합한가요?`,
      answer:
        "실내 생활·저활동 고양이를 위한 사료로 분류되거나, 이름·성분에 실내(인도어) 케어 요소가 포함되어 있습니다. 활동량이 적은 고양이의 칼로리 조절에 참고할 수 있습니다.",
    });
  }

  if (feed.rawType === "wet" || feed.feedKind === "습식") {
    faqs.push({
      question: `${productName}을 건식과 함께 급여해도 되나요?`,
      answer:
        "건식·습식 혼합 급여는 가능합니다. 두 사료의 100g당 칼로리를 합산해 하루 총 섭취 칼로리가 권장량을 넘지 않도록 그램 수를 조절하세요.",
    });
  }

  return faqs.slice(0, 6);
}

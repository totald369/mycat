import type { FeedDetailItem } from "@/lib/catFoodCsv";
import {
  feedConditionLabel,
  feedTypeLabel,
  lifeStageLabel,
} from "@/lib/feedDetailLabels";
import { parseNutritionMetrics } from "@/lib/feedNutritionInterpretation";
import {
  particleEunNeun,
  particleEulReul,
  particleIGa,
} from "@/lib/koreanParticles";
import { safeLower, safeNumber, safeString } from "@/lib/feedSafeValues";
import type { FaqItem } from "@/lib/seo";

const MIN_FAQ_COUNT = 3;
const MAX_FAQ_COUNT = 4;

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

function faqProductLabel(feed: FeedDetailItem): string {
  const brand = safeString(feed.brand).trim();
  let name = safeString(feed.name).trim() || "이름 없음";
  if (/반려묘용/.test(name)) {
    name = name
      .replace(/\s*반려묘용\s*(습식|건식)?사료\s*/g, " ")
      .replace(/\s*\d+\s*g\s*$/i, "")
      .trim();
  }
  const full = brand ? `${brand} ${name}` : name;
  if (full.length <= 36) return full;

  const short = brand ? `${brand} ${name}` : name;
  return short.length <= 36 ? short : `${short.slice(0, 34)}…`;
}

type FeedTraits = {
  isIndoor: boolean;
  isKitten: boolean;
  isSenior: boolean;
  isUrinary: boolean;
  isHairball: boolean;
  isWeightDiet: boolean;
  isWet: boolean;
  isDigestive: boolean;
  proteinPct: number | null;
  fiberPct: number | null;
};

function buildFeedTraits(feed: FeedDetailItem): FeedTraits {
  const ls = safeLower(feed.lifeStage);
  const cond = safeLower(feed.feedCondition);
  const name = safeLower(feed.name);
  const nut = safeLower(feed.nutritionAnalysis);
  const combined = `${name} ${nut}`;
  const metrics = parseNutritionMetrics(feed.nutritionAnalysis);

  return {
    isIndoor:
      ls.includes("indoor") ||
      cond === "indoor" ||
      combined.includes("인도어") ||
      combined.includes("실내"),
    isKitten:
      ls.includes("kitten") ||
      cond === "kitten" ||
      cond === "growth" ||
      name.includes("키튼") ||
      name.includes("kitten"),
    isSenior:
      ls.includes("senior") ||
      cond === "senior" ||
      name.includes("7세") ||
      name.includes("11세") ||
      name.includes("시니어"),
    isUrinary:
      cond === "urinary" || combined.includes("유리너리") || combined.includes("비뇨"),
    isHairball: cond === "hairball" || combined.includes("헤어볼"),
    isWeightDiet:
      ls === "weight_control" ||
      cond === "weight" ||
      cond === "diet" ||
      cond === "low_fat" ||
      combined.includes("체중") ||
      combined.includes("라이트") ||
      combined.includes("다이어트"),
    isWet: feed.rawType === "wet" || feed.feedKind === "습식",
    isDigestive:
      cond === "digestive" ||
      cond === "digestion" ||
      combined.includes("소화") ||
      name.includes("gi biome") ||
      name.includes("gi "),
    proteinPct: metrics.find((m) => m.label === "조단백")?.value ?? null,
    fiberPct: metrics.find((m) => m.label === "조섬유")?.value ?? null,
  };
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

function seniorAgeAnswer(feed: FeedDetailItem): string {
  const name = safeLower(feed.name);
  const ls = safeLower(feed.lifeStage);
  if (name.includes("11세") || name.includes("11+"))
    return "11세 이상 노령묘용으로 분류된 사료입니다. 치아·소화 상태에 맞춰 급여량을 조절하고, 수의사 권장에 따르세요.";
  if (name.includes("7세") || name.includes("7+") || ls.includes("senior"))
    return "시니어·노령묘용 사료로 분류됩니다. 연령에 맞는 급여 가이드를 포장 표기와 함께 확인하세요.";
  return "노령기 영양 요구를 고려한 사료로 분류됩니다. 기존 사료에서 전환 시 점진적으로 바꾸는 것이 좋습니다.";
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

function proteinNutritionAnswer(
  feed: FeedDetailItem,
  protein: number,
  isWet: boolean,
): string {
  if (isWet) {
    return `등록성분 기준 단백질 ${protein}%로 습식 사료 중 높은 편입니다. 성장기·활동량이 많은 고양이 급여에 참고할 수 있으며, 하루 총 칼로리와 함께 조절하세요.`;
  }
  return `등록성분 기준 단백질 ${protein}%로 건식 사료 중 높은 편입니다. 성장기·근육 유지가 필요한 고양이에게 참고할 수 있으며, 신장 등 건강 상태는 수의사와 상담하세요.`;
}

function fiberNutritionAnswer(fiber: number): string {
  return `조섬유 ${fiber}%로 건식 사료 중 높은 편입니다. 포만감·배변 상태를 고려할 때 참고할 수 있으며, 소화가 예민한 고양이는 급여량을 나눠 조절하세요.`;
}

type FaqCandidate = { priority: number; item: FaqItem };

/** 사료 상세 FAQ 자동 생성 */
export function buildFeedDetailFaqs(feed: FeedDetailItem): FaqItem[] {
  const product = faqProductLabel(feed);
  const traits = buildFeedTraits(feed);
  const targets = buildFeedRecommendedTargets(feed);
  const kcal = safeNumber(feed.kcalPer100g) ?? feed.kcalPer100g;
  const typeLabel = feedTypeLabel(feed.rawType, feed.feedKind);
  const lifeLabel = lifeStageLabel(feed.lifeStage);
  const eun = particleEunNeun(product);
  const iGa = particleIGa(product);
  const eul = particleEulReul(product);

  const candidates: FaqCandidate[] = [
    {
      priority: 100,
      item: {
        question: `${product}${eun} 100g당 칼로리가 얼마인가요?`,
        answer: `상세 페이지에서 100g당 ${kcal}kcal(${typeLabel})을 확인할 수 있습니다. 하루 급여량은 체중·활동량에 따라 달라지므로 우리냥이맘마 급여량 계산기로 맞춤 산출을 권장합니다.`,
      },
    },
  ];

  if (traits.isIndoor) {
    candidates.push({
      priority: 92,
      item: {
        question: `실내묘에게 ${product}${iGa} 맞는 사료인가요?`,
        answer:
          "실내 생활·저활동 고양이를 위한 사료로 분류되거나, 이름·성분에 실내(인도어) 요소가 포함되어 있습니다. 활동량이 적은 고양이의 칼로리 조절에 참고할 수 있습니다.",
      },
    });
  }

  if (traits.isKitten) {
    candidates.push({
      priority: 90,
      item: {
        question: `몇 개월 키튼부터 ${product}${eul} 급여할 수 있나요?`,
        answer: kittenAgeAnswer(feed),
      },
    });
  }

  if (traits.isSenior) {
    candidates.push({
      priority: 89,
      item: {
        question: `노령묘에게 ${product}${iGa} 급여해도 될까요?`,
        answer: seniorAgeAnswer(feed),
      },
    });
  }

  if (traits.isDigestive) {
    candidates.push({
      priority: 91,
      item: {
        question: `소화가 예민한 고양이에게 ${product}${iGa} 맞는 편인가요?`,
        answer:
          "소화기 건강을 고려한 사료로 분류됩니다. 장내 환경·소화 민감도에 따라 수의사·브랜드 급여 가이드와 함께 선택하세요.",
      },
    });
  }

  if (traits.isUrinary) {
    candidates.push({
      priority: 88,
      item: {
        question: `비뇨기 건강을 신경 쓰는 고양이에게 ${product}${iGa} 맞을까요?`,
        answer:
          "비뇨기·요로 건강을 고려한 사료로 분류되거나 관련 성분이 포함되어 있습니다. 수의사·브랜드 급여 안내와 함께 참고하세요.",
      },
    });
  }

  if (traits.isHairball) {
    candidates.push({
      priority: 87,
      item: {
        question: `헤어볼이 자주 나는 고양이에게 ${product}${iGa} 괜찮을까요?`,
        answer:
          "헤어볼 배출을 돕는 섬유·성분이 포함된 사료로 분류됩니다. 그루밍이 많은 장모종 등에 참고할 수 있으며, 증상이 심하면 수의사 상담을 권장합니다.",
      },
    });
  }

  if (traits.isWeightDiet || (kcal <= 330 && feed.rawType === "dry")) {
    candidates.push({
      priority: 86,
      item: {
        question: `체중 관리용으로 ${product}${eul} 급여해도 될까요?`,
        answer: weightManagementAnswer(feed),
      },
    });
  }

  if (traits.isWet) {
    candidates.push({
      priority: 85,
      item: {
        question: `건식 사료와 ${product}${eul} 함께 급여해도 되나요?`,
        answer:
          "건식·습식 혼합 급여는 가능합니다. 두 사료의 100g당 칼로리를 합산해 하루 총 섭취 칼로리가 권장량을 넘지 않도록 그램 수를 조절하세요.",
      },
    });
  }

  const meaningfulProtein =
    traits.proteinPct != null &&
    (traits.isWet ? traits.proteinPct >= 11 : traits.proteinPct >= 35);
  const meaningfulFiber =
    traits.fiberPct != null && !traits.isWet && traits.fiberPct >= 5;

  if (meaningfulProtein && !traits.isDigestive) {
    candidates.push({
      priority: 78,
      item: {
        question: `${product}${eun} 단백질 함량이 높은 편인데, 어떤 고양이에게 맞나요?`,
        answer: proteinNutritionAnswer(feed, traits.proteinPct!, traits.isWet),
      },
    });
  } else if (meaningfulProtein && traits.isDigestive) {
    candidates.push({
      priority: 77,
      item: {
        question: `${product}${eun} 단백질·소화 케어 성분이 어떤 고양이에게 맞나요?`,
        answer: `등록성분 기준 단백질 ${traits.proteinPct}%이며 소화기 건강을 고려한 사료입니다. 소화 민감도·기존 식단과 함께 수의사·브랜드 안내를 참고하세요.`,
      },
    });
  }

  if (meaningfulFiber && !traits.isHairball && !traits.isWeightDiet) {
    candidates.push({
      priority: 76,
      item: {
        question: `${product}${eun} 조섬유 함량이 높은 편인데, 급여 시 무엇을 보면 좋을까요?`,
        answer: fiberNutritionAnswer(traits.fiberPct!),
      },
    });
  }

  candidates.push({
    priority: 55,
    item: {
      question: `어떤 고양이에게 ${product}${eul} 급여하는 게 좋을까요?`,
      answer:
        targets.length > 0
          ? `급여 대상·성분 기준으로 ${targets.join(", ")}에게 참고할 수 있는 사료입니다. ${lifeLabel} 분류이며, 특정 질환·알레르기가 있다면 수의사와 상담 후 선택하세요.`
          : `${lifeLabel} 급여 대상으로 분류됩니다. 실내 생활·체중·건강 상태에 따라 다른 사료와 비교해 선택하세요.`,
    },
  });

  const sorted = [...candidates].sort((a, b) => b.priority - a.priority);
  const seen = new Set<string>();
  const result: FaqItem[] = [];

  for (const candidate of sorted) {
    if (seen.has(candidate.item.question)) continue;
    seen.add(candidate.item.question);
    result.push(candidate.item);
    if (result.length >= MAX_FAQ_COUNT) break;
  }

  return result.length >= MIN_FAQ_COUNT
    ? result
    : sorted.map((c) => c.item).slice(0, MIN_FAQ_COUNT);
}

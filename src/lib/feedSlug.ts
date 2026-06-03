/** 브랜드·제품명 → SEO slug (영문 소문자·숫자·하이픈) */

const BRAND_SLUGS: Record<string, string> = {
  로얄캐닌: "royal-canin",
  힐스: "hills",
  퓨리나: "purina",
  아카나: "acana",
  오리젠: "orijen",
  쉬바: "sheba",
  위스카스: "whiskas",
  레오나르도: "leonardo",
  웰니스: "wellness",
  스텔라앤츄이스: "stella-and-chewy",
  로우즈: "rawz",
  보레알: "boreal",
  브릿: "brit",
  블랙우드: "blackwood",
  쓰라이브: "thrive",
  이즈칸: "eukanuba",
  뉴트리플랜: "nutriplan",
  아보덤: "avoderm",
  알모네이처: "almo-nature",
  밥이보약: "babiboyak",
  유한양행: "yuhan",
  아미오: "amio",
  요라: "yora",
  지위픽: "ziwipick",
  캐츠랑: "catsrang",
  퍼시캣: "persicat",
  프린세스: "princess",
  now: "now",
  SUMMIT: "summit",
  인디고: "indigo",
  하림펫푸드: "harim-pet-food",
  네이처스버라이어티: "natures-variety",
  후새: "fussie-cat",
  아투: "aatu",
};

/** 제품명 토큰 — 긴 구문 우선 매칭 */
const PRODUCT_TERM_SLUGS = [
  ["마더앤베이비캣", "mother-and-babycat"],
  ["마더 앤 베이비캣", "mother-and-babycat"],
  ["키튼 스테럴라이즈드", "kitten-sterilized"],
  ["키튼 스테릴라이즈드", "kitten-sterilized"],
  ["아로마 엑시전트", "aroma-exigent"],
  ["참치와 게살", "tuna-and-crab"],
  ["참치&오징어", "tuna-and-squid"],
  ["참치&새우", "tuna-and-shrimp"],
  ["참치와 오징어", "tuna-and-squid"],
  ["면역 앤 헤어볼", "immune-hairball"],
  ["면역 앤 유리너리", "immune-urinary"],
  ["더리얼", "the-real"],
  ["크런치", "crunch"],
  ["오퍼스링크스", "opus-lynx"],
  ["밀프리", "meal-free"],
  ["화이트피쉬", "whitefish"],
  ["젤리", "jelly"],
  ["오징어", "squid"],
  ["새우", "shrimp"],
  ["참치와 고등어", "tuna-and-mackerel"],
  ["탄탄한 성장", "growth"],
  ["라이트 웨이트", "light-weight"],
  ["인도어 7+", "indoor-7-plus"],
  ["베이비캣", "babycat"],
  ["스테럴라이즈드", "sterilized"],
  ["스테릴라이즈드", "sterilized"],
  ["헤어앤스킨", "hair-and-skin"],
  ["그레인프리", "grain-free"],
  ["에이징 15", "aging-15"],
  ["에이징 11", "aging-11"],
  ["다이제스티브", "digestive"],
  ["팬시피스트", "fancy-feast"],
  ["하이드레이션", "hydration"],
  ["하이드레이팅", "hydrating"],
  ["크레이빙스", "cravings"],
  ["순수생육", "pure-meat"],
  ["모이스트루", "moisture"],
  ["프로플랜", "pro-plan"],
  ["시그니쳐", "signature"],
  ["연어생육", "salmon"],
  ["인도어 7", "indoor-7"],
  ["유리너리", "urinary"],
  ["엑시전트", "exigent"],
  ["슈레디드", "shredded"],
  ["퍼포먼스", "performance"],
  ["인스팅트", "instinct"],
  ["플레이크", "flakes"],
  ["프리미엄", "premium"],
  ["컴플리트", "complete"],
  ["오리지널", "original"],
  ["실내묘", "indoor"],
  ["인도어", "indoor"],
  ["헤어볼", "hairball"],
  ["그레이비", "gravy"],
  ["현미", "brown-rice"],
  ["가금류", "poultry"],
  ["폴트리", "poultry"],
  ["센서리", "sensory"],
  ["다이어트", "diet"],
  ["닭고기", "chicken"],
  ["양고기", "lamb"],
  ["소고기", "beef"],
  ["고등어", "mackerel"],
  ["칠면조", "turkey"],
  ["어덜트", "adult"],
  ["시니어", "senior"],
  ["주니어", "junior"],
  ["덴탈", "dental"],
  ["크레이브", "crave"],
  ["셀렉트", "select"],
  ["치킨", "chicken"],
  ["호박", "pumpkin"],
  ["펌킨", "pumpkin"],
  ["파우치", "pouch"],
  ["게살", "crab"],
  ["키튼", "kitten"],
  ["무스", "mousse"],
  ["참치", "tuna"],
  ["연어", "salmon"],
  ["파테", "pate"],
  ["청크", "chunk"],
  ["케어", "care"],
  ["라이트", "light"],
  ["습식", "wet"],
  ["건식", "dry"],
  ["팬시", "fancy"],
  ["코어", "core"],
  ["캔", "can"],
  ["오리", "duck"],
  ["돼지", "pork"],
  ["프로", "pro"],
] as [string, string][];

const SORTED_TERMS = [...PRODUCT_TERM_SLUGS].sort(
  (a, b) => b[0].length - a[0].length,
);

function slugifySegment(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function romanizeBrand(brand: string): string {
  const trimmed = brand.trim();
  if (BRAND_SLUGS[trimmed]) return BRAND_SLUGS[trimmed];
  const ascii = slugifySegment(trimmed);
  if (ascii) return ascii;
  return "brand";
}

function extractAsciiTokens(text: string): string[] {
  const tokens: string[] = [];
  const re = /[a-zA-Z][a-zA-Z0-9&+#]*/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const t = m[0]
      .replace(/&/g, "-and-")
      .replace(/\+/g, "-plus-")
      .replace(/#/g, "")
      .toLowerCase();
    if (t) tokens.push(slugifySegment(t));
  }
  const gramRe = /(\d+(?:\.\d+)?)\s*(kg|g|ml|oz)\b/gi;
  while ((m = gramRe.exec(text)) !== null) {
    tokens.push(`${m[1]}${m[2].toLowerCase()}`);
  }
  return tokens.filter(Boolean);
}

function romanizeNameTokens(name: string): string[] {
  const parts: string[] = [];
  let remaining = name.trim();

  for (const [ko, en] of SORTED_TERMS) {
    if (remaining.includes(ko)) {
      parts.push(en);
      remaining = remaining.split(ko).join(" ");
    }
  }

  parts.push(...extractAsciiTokens(remaining));

  const hangulLeft = remaining.replace(/[a-zA-Z0-9()[\]%.,+\-/&\s]+/g, "").trim();
  if (hangulLeft.length > 0) {
    const fallback = slugifySegment(hangulLeft);
    if (fallback && !parts.includes(fallback)) parts.push(fallback);
  }

  return parts.filter((p) => p.length > 1);
}

export function buildBaseFeedSlug(brand: string, name: string): string {
  const brandPart = romanizeBrand(brand);
  const nameParts = romanizeNameTokens(name);
  const combined = [brandPart, ...nameParts].filter(Boolean).join("-");
  const slug = slugifySegment(combined);
  if (slug.length >= 3) return slug;
  return slugifySegment(`${brandPart}-food`) || "cat-food";
}

function shortApiSuffix(apiId: string): string {
  const clean = apiId.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  return clean.slice(-6) || "item";
}

export type WithSlugInput = {
  brand: string;
  name: string;
  apiId: string;
  feedKind?: string;
  rawType?: string;
};

export function assignUniqueFeedSlugs<T extends WithSlugInput>(
  items: T[],
): (T & { slug: string })[] {
  const slugCounts = new Map<string, number>();
  const result: (T & { slug: string })[] = [];

  for (const item of items) {
    let base = buildBaseFeedSlug(item.brand, item.name);
    const seen = slugCounts.get(base) ?? 0;
    slugCounts.set(base, seen + 1);

    let slug = base;
    if (seen > 0) {
      const kind =
        item.feedKind === "습식" || item.rawType === "wet"
          ? "wet"
          : item.feedKind === "건식" || item.rawType === "dry"
            ? "dry"
            : "";
      if (kind && !base.endsWith(`-${kind}`)) {
        const withKind = `${base}-${kind}`;
        if ((slugCounts.get(withKind) ?? 0) === 0) {
          slug = withKind;
          slugCounts.set(withKind, 1);
        } else {
          slug = `${base}-${shortApiSuffix(item.apiId)}`;
        }
      } else {
        slug = `${base}-${shortApiSuffix(item.apiId)}`;
      }
    }

    while (result.some((r) => r.slug === slug)) {
      slug = `${base}-${shortApiSuffix(item.apiId)}`;
      base = slug;
    }

    result.push({ ...item, slug });
  }

  return result;
}

export function feedDetailPath(slug: string): string {
  return `/foods/${slug}`;
}

export function isLegacyCsvFeedId(param: string): boolean {
  return param.startsWith("csv-");
}

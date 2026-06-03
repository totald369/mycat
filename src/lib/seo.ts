import type { Metadata } from "next";

export const SITE_URL = "https://meowdiet.com" as const;
export const SITE_NAME = "우리냥이" as const;
export const SITE_BRAND = "우리냥이맘마" as const;
export const SITE_NAME_FULL = "우리냥이 고양이 급여량 계산기" as const;

export const OG_IMAGE = {
  url: "/og-brown.png",
  width: 1200,
  height: 630,
  alt: "우리냥이 고양이 급여량·칼로리 계산기",
} as const;

/** 구글·네이버 공통 타깃 키워드 */
export const CORE_KEYWORDS = [
  "고양이 급여량 계산기",
  "고양이 사료 급여량",
  "고양이 하루 사료 양",
  "고양이 칼로리 계산",
  "고양이 사료 칼로리",
  "고양이 습식 급여량",
  "고양이 간식 칼로리",
  "고양이 하루 사료량",
  "고양이 적정 급여량",
  "고양이 사료 계산",
  "고양이 급여량 계산",
] as const;

/** 네이버 서치어드바이저 권장: 80자 이내 — OG·Twitter fallback */
export const NAVER_OG_DESCRIPTION =
  "고양이 체중·활동량·사료 칼로리로 하루 급여량을 계산해보세요.";

/** 사이트 기본 meta description */
export const DEFAULT_DESCRIPTION =
  "고양이 체중·활동량·사료 칼로리로 하루 급여량을 계산하고, 사료 칼로리 정보를 확인해보세요.";

export type FaqItem = {
  question: string;
  answer: string;
};

export const HOME_FAQ: FaqItem[] = [
  {
    question: "고양이 하루 사료량은 어떻게 계산하나요?",
    answer:
      "체중, 체형(BCS), 활동량, 성별·중성화 여부를 입력한 뒤 급여 중인 건식·습식 사료와 간식 빈도를 합산해 하루 총 섭취 칼로리와 권장 칼로리를 비교합니다. 우리냥이 계산기는 RER(안정 시 에너지 요구량)에 생활 요인을 곱해 권장량을 산출합니다.",
  },
  {
    question: "고양이 칼로리 계산 시 간식도 포함해야 하나요?",
    answer:
      "네. 간식·트릿·습식 토핑도 하루 칼로리에 포함됩니다. 간식을 빼고 계산하면 사료가 과다 급여될 수 있어, 계산기에서 간식 빈도를 함께 반영합니다.",
  },
  {
    question: "고양이 적정 급여량은 체중만으로 정할 수 있나요?",
    answer:
      "체중은 출발점일 뿐입니다. 같은 체중이라도 활동량, 나이, 중성화 여부, 체형에 따라 필요 칼로리가 달라집니다. 정기적으로 재계산하며 미세 조정하는 것이 좋습니다.",
  },
  {
    question: "건식과 습식을 같이 먹을 때는 어떻게 계산하나요?",
    answer:
      "급여 중인 사료를 각각 그램·급여 횟수로 입력하면 건식·습식 칼로리를 나눠 합산합니다. 결과 화면에서 섭취 구성(건식·습식·간식)을 확인할 수 있습니다.",
  },
  {
    question: "중성화한 고양이도 이 계산기를 쓸 수 있나요?",
    answer:
      "가능합니다. 중성화 여부를 입력하면 에너지 요인에 반영됩니다. 중성화 이후 체중이 오르면 2~4주 단위로 다시 계산해 급여량을 조정하세요.",
  },
];

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const WEBAPP_ID = `${SITE_URL}/#webapp`;

export function absoluteUrl(path: string): string {
  if (path.startsWith("http")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

/** 네이버 OG 권장 80자 이내 — 긴 description은 짧은 fallback 사용 */
export function ogDescriptionFor(description: string, override?: string): string {
  if (override) return override;
  return [...description].length > 80 ? NAVER_OG_DESCRIPTION : description;
}

export function buildOpenGraph(
  title: string,
  description: string,
  path: string,
  type: "website" | "article" = "website",
): NonNullable<Metadata["openGraph"]> {
  return {
    title,
    description,
    url: absoluteUrl(path),
    siteName: SITE_NAME,
    locale: "ko_KR",
    type,
    images: [
      {
        url: OG_IMAGE.url,
        width: OG_IMAGE.width,
        height: OG_IMAGE.height,
        alt: OG_IMAGE.alt,
      },
    ],
  };
}

export function buildTwitterCard(
  title: string,
  description: string,
): NonNullable<Metadata["twitter"]> {
  return {
    card: "summary_large_image",
    title,
    description,
    images: [OG_IMAGE.url],
  };
}

/** 루트 레이아웃 기본 메타 */
export function buildRootMetadata(): Metadata {
  const title = `고양이 급여량 계산기 | ${SITE_BRAND}`;
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: `%s | ${SITE_BRAND}`,
    },
    description: DEFAULT_DESCRIPTION,
    keywords: [...CORE_KEYWORDS],
    authors: [{ name: SITE_BRAND, url: SITE_URL }],
    creator: SITE_BRAND,
    publisher: SITE_BRAND,
    category: "health",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: buildOpenGraph(
      title,
      NAVER_OG_DESCRIPTION,
      "/",
    ),
    twitter: buildTwitterCard(title, NAVER_OG_DESCRIPTION),
    verification: {
      google: "8M9JJaFTVZbs-ZQzd7cpmI2luczjidpKkuS5sTO8nMg",
      other: {
        "naver-site-verification": "9930da34737f943a79ea16f2a702cad985fd0977",
      },
    },
    other: {
      "format-detection": "telephone=no",
    },
  };
}

export type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  ogDescription?: string;
  ogType?: "website" | "article";
  noindex?: boolean;
};

export function buildPageMetadata(options: PageMetadataOptions): Metadata {
  const {
    title,
    description,
    path,
    keywords = [],
    ogDescription,
    ogType = "website",
    noindex = false,
  } = options;

  const ogDesc = ogDescriptionFor(description, ogDescription);

  return {
    title: { absolute: title },
    description,
    keywords: [...CORE_KEYWORDS, ...keywords],
    alternates: {
      canonical: path,
      languages: { "ko-KR": path },
    },
    robots: noindex
      ? { index: false, follow: true }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true },
        },
    openGraph: buildOpenGraph(title, ogDesc, path, ogType),
    twitter: buildTwitterCard(title, ogDesc),
  };
}

export function buildWizardStepMetadata(
  step: "step1" | "step2" | "step3" | "result",
  title: string,
): Metadata {
  return buildPageMetadata({
    title,
    description: `${SITE_NAME} 고양이 급여량 계산 — ${title}`,
    path: `/${step}`,
    noindex: true,
  });
}

export function buildFaqPageJsonLd(faqs: FaqItem[]) {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

const WEBAPP_DESCRIPTION =
  "고양이 체중, 활동량, 체형, 사료 칼로리를 기준으로 하루 급여량과 섭취 칼로리를 계산하는 웹 서비스";

export function buildHomeJsonLdGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORGANIZATION_ID,
        name: SITE_BRAND,
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl("/favicon-our-cat.png"),
        },
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: SITE_URL,
        name: `${SITE_BRAND} 고양이 급여량 계산기`,
        description: DEFAULT_DESCRIPTION,
        inLanguage: "ko-KR",
        publisher: { "@id": ORGANIZATION_ID },
      },
      {
        "@type": "WebApplication",
        "@id": WEBAPP_ID,
        name: SITE_BRAND,
        description: WEBAPP_DESCRIPTION,
        url: SITE_URL,
        applicationCategory: "HealthApplication",
        operatingSystem: "Web",
        browserRequirements: "Requires JavaScript",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "KRW",
        },
        inLanguage: "ko-KR",
        isPartOf: { "@id": WEBSITE_ID },
        publisher: { "@id": ORGANIZATION_ID },
      },
      buildFaqPageJsonLd(HOME_FAQ),
    ],
  };
}

export function buildArticleJsonLd(options: {
  path: string;
  headline: string;
  description: string;
  datePublished?: string;
}) {
  return {
    "@type": "Article",
    headline: options.headline,
    description: options.description,
    inLanguage: "ko-KR",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(options.path),
    },
    author: { "@id": ORGANIZATION_ID },
    publisher: { "@id": ORGANIZATION_ID },
    datePublished: options.datePublished ?? "2026-01-01",
    dateModified: new Date().toISOString().slice(0, 10),
  };
}

export function buildBreadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildWebPageJsonLd(options: {
  path: string;
  name: string;
  description: string;
}) {
  return {
    "@type": "WebPage",
    "@id": absoluteUrl(options.path),
    name: options.name,
    description: options.description,
    inLanguage: "ko-KR",
    isPartOf: { "@id": WEBSITE_ID },
    publisher: { "@id": ORGANIZATION_ID },
  };
}

export function buildWebPageJsonLdGraph(options: {
  path: string;
  name: string;
  description: string;
  breadcrumbs: Array<{ name: string; path: string }>;
}) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORGANIZATION_ID,
        name: SITE_BRAND,
        url: SITE_URL,
      },
      buildWebPageJsonLd(options),
      buildBreadcrumbJsonLd(options.breadcrumbs),
    ],
  };
}

export type FeedDetailJsonLdInput = {
  path: string;
  headline: string;
  name: string;
  brand: string;
  description: string;
  kcalPer100g: number;
  proteinPercent?: number | null;
  fatPercent?: number | null;
  fiberPercent?: number | null;
  feedKind: string;
};

function buildFeedNutritionProperties(
  input: FeedDetailJsonLdInput,
): Array<{ "@type": "PropertyValue"; name: string; value: string }> {
  const props: Array<{ "@type": "PropertyValue"; name: string; value: string }> =
    [
      {
        "@type": "PropertyValue",
        name: "100g당 칼로리",
        value: `${input.kcalPer100g} kcal`,
      },
      {
        "@type": "PropertyValue",
        name: "사료 유형",
        value: input.feedKind,
      },
    ];

  if (input.proteinPercent != null) {
    props.push({
      "@type": "PropertyValue",
      name: "조단백",
      value: `${input.proteinPercent}%`,
    });
  }
  if (input.fatPercent != null) {
    props.push({
      "@type": "PropertyValue",
      name: "조지방",
      value: `${input.fatPercent}%`,
    });
  }
  if (input.fiberPercent != null) {
    props.push({
      "@type": "PropertyValue",
      name: "조섬유",
      value: `${input.fiberPercent}%`,
    });
  }

  return props;
}

/** 사료 상세 — 정보 제공 페이지용 WebPage + Article (Product Rich Result 미대상) */
export function buildFeedDetailJsonLdGraph(
  input: FeedDetailJsonLdInput,
): Record<string, unknown> {
  const pageUrl = absoluteUrl(input.path);
  const pageId = `${pageUrl}#webpage`;
  const articleId = `${pageUrl}#article`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORGANIZATION_ID,
        name: SITE_BRAND,
        url: SITE_URL,
      },
      {
        "@type": "WebPage",
        "@id": pageId,
        url: pageUrl,
        name: input.headline,
        description: input.description,
        inLanguage: "ko-KR",
        isPartOf: { "@id": WEBSITE_ID },
        publisher: { "@id": ORGANIZATION_ID },
        mainEntity: { "@id": articleId },
      },
      {
        "@type": "Article",
        "@id": articleId,
        headline: input.headline,
        description: input.description,
        inLanguage: "ko-KR",
        author: { "@id": ORGANIZATION_ID },
        publisher: { "@id": ORGANIZATION_ID },
        mainEntityOfPage: { "@id": pageId },
        about: {
          "@type": "Thing",
          name: input.name,
          brand: {
            "@type": "Brand",
            name: input.brand,
          },
          additionalProperty: buildFeedNutritionProperties(input),
        },
      },
      buildBreadcrumbJsonLd([
        { name: "홈", path: "/" },
        { name: "사료 목록", path: "/foods" },
        { name: input.brand, path: "/foods" },
        { name: input.name, path: input.path },
      ]),
    ],
  };
}

export function buildFeedDetailMetadata(feed: {
  brand: string;
  name: string;
  slug: string;
  kcalPer100g: number;
  feedKind: string;
}) {
  const productName = `${feed.brand} ${feed.name}`;
  const title = `${productName} 성분 분석 | 칼로리·원재료·급여량 | ${SITE_BRAND}`;
  const description = `${productName}의 칼로리, 조단백, 조지방, 원재료 정보를 확인하고 우리냥이 급여량을 계산해보세요. 100g당 ${feed.kcalPer100g}kcal (${feed.feedKind}).`;
  const path = `/foods/${feed.slug}`;

  return buildPageMetadata({
    title,
    description,
    path,
    keywords: [
      productName,
      `${feed.brand} 사료`,
      `${feed.brand} ${feed.name} 성분`,
      "고양이 사료 칼로리",
      "고양이 사료 성분",
      "고양이 급여량",
    ],
    ogDescription: `${productName} — 100g당 ${feed.kcalPer100g}kcal, 성분·급여량 정보`,
  });
}

export function buildLandingJsonLdGraph(options: {
  path: string;
  headline: string;
  description: string;
  faqs: FaqItem[];
}) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORGANIZATION_ID,
        name: SITE_BRAND,
        url: SITE_URL,
      },
      buildArticleJsonLd({
        path: options.path,
        headline: options.headline,
        description: options.description,
      }),
      buildBreadcrumbJsonLd([
        { name: "홈", path: "/" },
        { name: options.headline, path: options.path },
      ]),
      buildFaqPageJsonLd(options.faqs),
    ],
  };
}

export function buildLandingFaqs(keyword: string): FaqItem[] {
  return [
    {
      question: `${keyword}은 어떻게 계산하나요?`,
      answer: `체중, 활동량, 체형, 중성화 여부와 급여 사료·간식 정보를 입력하면 하루 권장 칼로리와 현재 섭취 칼로리를 비교해 ${keyword}을 확인할 수 있습니다.`,
    },
    {
      question: `${keyword} 계산 시 간식도 포함해야 하나요?`,
      answer:
        "간식·트릿·습식 토핑은 하루 칼로리에 포함하는 것이 좋습니다. 간식을 제외하면 사료 급여량이 과해질 수 있습니다.",
    },
    {
      question: "얼마나 자주 다시 계산해야 하나요?",
      answer:
        "체중·체형·활동량이 바뀌거나 사료를 교체할 때, 또는 2~4주마다 재계산해 급여량을 조정하는 것을 권장합니다.",
    },
  ];
}

export const ROBOTS_DISALLOW = [
  "/api/",
  "/step1",
  "/step2",
  "/step3",
  "/result",
  "/r/",
] as const;

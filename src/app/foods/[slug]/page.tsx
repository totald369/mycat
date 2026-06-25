import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { FeedDetailView } from "@/components/feed-detail/FeedDetailView";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  buildFeedRelatedInternalLinks,
  getFeedDetailPath,
  getRelatedFeedsByBrand,
  getRelatedFeedsByLifeStage,
  getRelatedFeedsByPurpose,
  getRelatedFeedsBySimilarKcal,
  listFeedDetailSlugs,
  resolveFeedRouteParam,
} from "@/lib/feedDetail";
import {
  buildFeedDetailFaqs,
  buildFeedRecommendedTargets,
  buildFeedSeoDescription,
} from "@/lib/feedDetailSeo";
import {
  buildFeedDetailJsonLdGraph,
  buildFeedDetailMetadata,
  buildPageMetadata,
} from "@/lib/seo";
import {
  buildNutritionInterpretations,
  parseNutritionMetrics,
} from "@/lib/feedNutritionInterpretation";
import { getFeedSeoBoostContent } from "@/lib/feedSeoBoostStore";
import { safeNumber, safeString } from "@/lib/feedSafeValues";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return listFeedDetailSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug: param } = await params;
  const resolved = resolveFeedRouteParam(param);

  if (!resolved) {
    return buildPageMetadata({
      title: "사료 정보를 찾을 수 없어요 | 우리냥이맘마",
      description: "요청하신 사료 정보를 찾을 수 없습니다.",
      path: `/foods/${param}`,
      noindex: true,
    });
  }

  const seoDescription = buildFeedSeoDescription(resolved.feed);
  const metadataFeed = {
    ...resolved.feed,
    seoDescription,
  };

  if (resolved.isLegacyRedirect) {
    return buildFeedDetailMetadata(metadataFeed);
  }

  return buildFeedDetailMetadata(metadataFeed);
}

export default async function FoodDetailPage({ params }: PageProps) {
  const { slug: param } = await params;
  const resolved = resolveFeedRouteParam(param);

  if (!resolved) {
    notFound();
  }

  if (resolved.isLegacyRedirect) {
    permanentRedirect(getFeedDetailPath(resolved.feed));
  }

  const { feed } = resolved;
  const pagePath = getFeedDetailPath(feed);
  const productName = `${safeString(feed.brand).trim() || "—"} ${safeString(feed.name).trim() || "이름 없음"}`;
  const seoDescription = buildFeedSeoDescription(feed);
  const recommendedTargets = buildFeedRecommendedTargets(feed);
  const faqs = buildFeedDetailFaqs(feed);

  const metrics = parseNutritionMetrics(feed.nutritionAnalysis);
  const protein = metrics.find((m) => m.label === "조단백")?.value ?? null;
  const fat = metrics.find((m) => m.label === "조지방")?.value ?? null;
  const fiber = metrics.find((m) => m.label === "조섬유")?.value ?? null;

  const pageHeadline = `${productName} 칼로리 정보`;
  const jsonLd = buildFeedDetailJsonLdGraph(
    {
      path: pagePath,
      headline: pageHeadline,
      name: productName,
      brand: feed.brand,
      description: seoDescription,
      kcalPer100g: safeNumber(feed.kcalPer100g) ?? feed.kcalPer100g,
      proteinPercent: protein,
      fatPercent: fat,
      fiberPercent: fiber,
      feedKind: feed.feedKind,
    },
    faqs,
  );

  const isWet = feed.rawType === "wet" || feed.feedKind === "습식";
  const nutritionInterpretations = buildNutritionInterpretations(
    feed.nutritionAnalysis,
    isWet,
  );

  const relatedByBrand = getRelatedFeedsByBrand(feed, 4);
  const relatedByPurpose = getRelatedFeedsByPurpose(feed, 4);
  const relatedByKcal = getRelatedFeedsBySimilarKcal(feed, 3);
  const relatedByLifeStage = getRelatedFeedsByLifeStage(feed, 3);
  const relatedFeedLinks = buildFeedRelatedInternalLinks(feed, {
    byPurpose: relatedByPurpose,
    byBrand: relatedByBrand,
    byLifeStage: relatedByLifeStage,
    byKcal: relatedByKcal,
  });
  const seoBoostContent = getFeedSeoBoostContent(feed.apiId);

  return (
    <>
      <JsonLd id={`food-detail-jsonld-${feed.slug}`} data={jsonLd} />
      <FeedDetailView
        feed={feed}
        seoDescription={seoDescription}
        recommendedTargets={recommendedTargets}
        nutritionInterpretations={nutritionInterpretations}
        relatedFeedLinks={relatedFeedLinks}
        faqs={faqs}
        seoBoostContent={seoBoostContent}
      />
    </>
  );
}

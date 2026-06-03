import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { FeedDetailView } from "@/components/feed-detail/FeedDetailView";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  getFeedDetailPath,
  getRelatedFeedsByBrand,
  getRelatedFeedsByLifeStage,
  getRelatedFeedsBySimilarKcal,
  listFeedDetailSlugs,
  resolveFeedRouteParam,
} from "@/lib/feedDetail";
import {
  buildFeedDetailJsonLdGraph,
  buildFeedDetailMetadata,
  buildPageMetadata,
} from "@/lib/seo";
import {
  buildNutritionInterpretations,
  parseNutritionMetrics,
} from "@/lib/feedNutritionInterpretation";

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

  if (resolved.isLegacyRedirect) {
    return buildFeedDetailMetadata(resolved.feed);
  }

  return buildFeedDetailMetadata(resolved.feed);
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
  const productName = `${feed.brand} ${feed.name}`;
  const pageDescription = `${productName}의 칼로리, 조단백, 조지방, 원재료 정보와 급여 기준량`;

  const metrics = parseNutritionMetrics(feed.nutritionAnalysis);
  const protein = metrics.find((m) => m.label === "조단백")?.value ?? null;
  const fat = metrics.find((m) => m.label === "조지방")?.value ?? null;
  const fiber = metrics.find((m) => m.label === "조섬유")?.value ?? null;

  const pageHeadline = `${productName} 성분 분석`;
  const jsonLd = buildFeedDetailJsonLdGraph({
    path: pagePath,
    headline: pageHeadline,
    name: productName,
    brand: feed.brand,
    description: pageDescription,
    kcalPer100g: feed.kcalPer100g,
    proteinPercent: protein,
    fatPercent: fat,
    fiberPercent: fiber,
    feedKind: feed.feedKind,
  });

  const isWet = feed.rawType === "wet" || feed.feedKind === "습식";
  const nutritionInterpretations = buildNutritionInterpretations(
    feed.nutritionAnalysis,
    isWet,
  );

  const relatedByBrand = getRelatedFeedsByBrand(feed);
  const relatedByKcal = getRelatedFeedsBySimilarKcal(feed);
  const relatedByLifeStage = getRelatedFeedsByLifeStage(feed);

  return (
    <>
      <JsonLd id={`food-detail-jsonld-${feed.slug}`} data={jsonLd} />
      <FeedDetailView
        feed={feed}
        nutritionInterpretations={nutritionInterpretations}
        relatedByBrand={relatedByBrand}
        relatedByKcal={relatedByKcal}
        relatedByLifeStage={relatedByLifeStage}
      />
    </>
  );
}

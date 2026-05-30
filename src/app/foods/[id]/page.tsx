import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FeedDetailView } from "@/components/feed-detail/FeedDetailView";
import { JsonLd } from "@/components/seo/JsonLd";
import { getFeedById, listFeedDetailIds } from "@/lib/feedDetail";
import { buildPageMetadata, buildWebPageJsonLdGraph } from "@/lib/seo";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  return listFeedDetailIds().map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const feed = await getFeedById(id);

  if (!feed) {
    return buildPageMetadata({
      title: "사료 정보를 찾을 수 없어요 | 우리냥이맘마",
      description: "요청하신 사료 정보를 찾을 수 없습니다.",
      path: `/foods/${id}`,
      noindex: true,
    });
  }

  const title = `${feed.brand} ${feed.name} 칼로리 정보 | 우리냥이맘마`;
  const description = `${feed.brand} ${feed.name}의 100g당 칼로리, 건식/습식 유형, 급여 기준량을 확인하고 고양이 하루 급여량 계산에 활용해보세요.`;

  return buildPageMetadata({
    title,
    description,
    path: `/foods/${id}`,
    keywords: [
      `${feed.brand} ${feed.name}`,
      "고양이 사료 칼로리",
      "고양이 사료 정보",
    ],
    ogDescription: `${feed.brand} ${feed.name} 100g당 칼로리·급여 기준 정보`,
  });
}

export default async function FoodDetailPage({ params }: PageProps) {
  const { id } = await params;
  const feed = await getFeedById(id);

  if (!feed) {
    notFound();
  }

  const pagePath = `/foods/${id}`;
  const pageName = `${feed.brand} ${feed.name} 칼로리 정보`;
  const pageDescription = `${feed.brand} ${feed.name}의 100g당 칼로리, 건식/습식 유형, 급여 기준량 정보`;

  const jsonLd = buildWebPageJsonLdGraph({
    path: pagePath,
    name: pageName,
    description: pageDescription,
    breadcrumbs: [
      { name: "홈", path: "/" },
      { name: "사료 찾기", path: "/feed-find" },
      { name: `${feed.brand} ${feed.name}`, path: pagePath },
    ],
  });

  return (
    <>
      <JsonLd id={`food-detail-jsonld-${id}`} data={jsonLd} />
      <FeedDetailView feed={feed} />
    </>
  );
}

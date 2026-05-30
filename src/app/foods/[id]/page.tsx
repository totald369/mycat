import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FeedDetailView } from "@/components/feed-detail/FeedDetailView";
import { getFeedById, listFeedDetailIds } from "@/lib/feedDetail";
import { buildPageMetadata } from "@/lib/seo";

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
      title: "사료 정보를 찾을 수 없어요",
      description: "요청하신 사료 정보를 찾을 수 없습니다.",
      path: `/foods/${id}`,
      noindex: true,
    });
  }

  const title = `${feed.brand} ${feed.name} 칼로리 정보 | 우리냥이`;
  const description = `${feed.brand} ${feed.name}의 100g당 칼로리, 건식/습식 유형, 급여 기준량을 확인하고 고양이 하루 급여량을 계산해보세요.`;

  return buildPageMetadata({
    title,
    description,
    path: `/foods/${id}`,
  });
}

export default async function FoodDetailPage({ params }: PageProps) {
  const { id } = await params;
  const feed = await getFeedById(id);

  if (!feed) {
    notFound();
  }

  return <FeedDetailView feed={feed} />;
}

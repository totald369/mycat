import type { Metadata } from "next";

import { FeedFindPageClient } from "@/components/feed-find/FeedFindPageClient";
import { FeedFindSeoIntro } from "@/components/feed-find/FeedFindSeoIntro";
import { JsonLd } from "@/components/seo/JsonLd";
import { getFeedCatalogItems } from "@/lib/feedCatalogServer";
import { buildPageMetadata, buildWebPageJsonLdGraph } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "고양이 사료 칼로리 찾기 | 브랜드별 급여 기준 확인",
  description:
    "브랜드·제품명으로 사료를 검색하고 100g당 칼로리, 건식·습식 유형, 급여 대상을 확인한 뒤 우리 아이 급여량 계산에 활용해보세요.",
  path: "/feed-find",
  keywords: ["고양이 사료 찾기", "고양이 사료 칼로리", "고양이 사료 정보"],
});

export default async function FeedFindPage() {
  const initialCatalog = await getFeedCatalogItems();
  const jsonLd = buildWebPageJsonLdGraph({
    path: "/feed-find",
    name: "고양이 사료 칼로리 찾기",
    description:
      "브랜드·제품명으로 사료를 검색하고 100g당 칼로리, 건식·습식 유형, 급여 대상을 확인해보세요.",
    breadcrumbs: [
      { name: "홈", path: "/" },
      { name: "고양이 사료 찾기", path: "/feed-find" },
    ],
  });

  return (
    <>
      <JsonLd id="feed-find-jsonld" data={jsonLd} />
      <FeedFindPageClient
        intro={<FeedFindSeoIntro />}
        initialCatalog={initialCatalog}
      />
    </>
  );
}

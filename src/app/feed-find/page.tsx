import type { Metadata } from "next";

import { FeedFindPageClient } from "@/components/feed-find/FeedFindPageClient";
import { FeedFindSeoIntro } from "@/components/feed-find/FeedFindSeoIntro";
import { JsonLd } from "@/components/seo/JsonLd";
import { getFeedCatalogItems } from "@/lib/feedCatalogServer";
import { buildPageMetadata, buildWebPageJsonLdGraph } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "고양이 사료 찾기 — 사료 칼로리·급여 기준 정보 | 우리냥이맘마",
  description:
    "브랜드별 고양이 사료의 건식·습식 유형, 100g당 칼로리, 급여 기준 정보를 검색해보세요.",
  path: "/feed-find",
  keywords: ["고양이 사료 찾기", "고양이 사료 칼로리", "고양이 사료 정보"],
});

export default async function FeedFindPage() {
  const initialCatalog = await getFeedCatalogItems();
  const jsonLd = buildWebPageJsonLdGraph({
    path: "/feed-find",
    name: "고양이 사료 찾기",
    description:
      "브랜드별 고양이 사료의 건식·습식 유형, 100g당 칼로리, 급여 기준 정보를 검색해보세요.",
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

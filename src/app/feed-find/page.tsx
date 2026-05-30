import type { Metadata } from "next";

import { FeedFindPageClient } from "@/components/feed-find/FeedFindPageClient";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "사료 찾기",
  description:
    "고양이 사료명·브랜드명으로 건식·습식 사료를 검색하고, 없는 제품은 추가 요청할 수 있습니다.",
  path: "/feed-find",
});

export default function FeedFindPage() {
  return <FeedFindPageClient />;
}

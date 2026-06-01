import { NextResponse } from "next/server";
import { getFeedCatalogItems } from "@/lib/feedCatalogServer";

/** 정적에 가까운 카탈로그 — CDN·브라우저 캐시로 반복 요청 비용 감소 */
const FEEDS_CACHE_CONTROL =
  "public, s-maxage=300, stale-while-revalidate=3600";

export async function GET() {
  const items = await getFeedCatalogItems();

  if (items.length > 0) {
    return NextResponse.json(
      { items },
      { headers: { "Cache-Control": FEEDS_CACHE_CONTROL } },
    );
  }

  return NextResponse.json(
    {
      items: [],
      error:
        "급여 목록을 불러올 수 없습니다. (로컬: DATABASE_URL·db:push·db:seed:csv, 배포: prisma/cat_food.csv 포함 여부 확인)",
    },
    { status: 503 },
  );
}

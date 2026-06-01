import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/seo/JsonLd";
import { getAllFeedDetails, getFeedDetailPath } from "@/lib/feedDetail";
import {
  feedTypeLabel,
  lifeStageLabel,
} from "@/lib/feedDetailLabels";
import {
  buildPageMetadata,
  buildWebPageJsonLdGraph,
  SITE_BRAND,
} from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: `고양이 사료 칼로리·성분 목록 | ${SITE_BRAND}`,
  description:
    "로얄캐닌, 힐스, 쉬바 등 주요 고양이 사료의 칼로리·성분·원재료 정보를 브랜드·연령·유형별로 확인하고 급여량을 계산해보세요.",
  path: "/foods",
  keywords: [
    "고양이 사료 목록",
    "고양이 사료 칼로리",
    "고양이 사료 성분",
    "사료 브랜드 비교",
  ],
});

function groupBy<T>(
  items: T[],
  keyFn: (item: T) => string,
): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const key = keyFn(item);
    const list = map.get(key) ?? [];
    list.push(item);
    map.set(key, list);
  }
  return map;
}

function FeedLinkList({
  feeds,
}: {
  feeds: ReturnType<typeof getAllFeedDetails>;
}) {
  return (
    <ul className="grid gap-2">
      {feeds.map((feed) => (
        <li key={feed.slug}>
          <Link
            href={getFeedDetailPath(feed)}
            prefetch={false}
            className="block rounded-xl border border-[#eee] bg-white px-4 py-3 text-sm text-[#171717] active:bg-[#f5f1ed]"
          >
            <span className="font-semibold">
              {feed.brand} {feed.name}
            </span>
            <span className="mt-0.5 block text-xs text-[#666]">
              {feed.feedKind} · {feed.kcalPer100g} kcal/100g
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function FoodsIndexPage() {
  const feeds = getAllFeedDetails();

  const byBrand = groupBy(feeds, (f) => f.brand);
  const brandKeys = [...byBrand.keys()].sort((a, b) =>
    a.localeCompare(b, "ko"),
  );

  const byLifeStage = groupBy(feeds, (f) =>
    lifeStageLabel(f.lifeStage),
  );
  const lifeKeys = [...byLifeStage.keys()].sort((a, b) =>
    a.localeCompare(b, "ko"),
  );

  const byType = groupBy(feeds, (f) =>
    feedTypeLabel(f.rawType, f.feedKind),
  );
  const typeKeys = [...byType.keys()].sort((a, b) =>
    a.localeCompare(b, "ko"),
  );

  const jsonLd = buildWebPageJsonLdGraph({
    path: "/foods",
    name: "고양이 사료 칼로리·성분 목록",
    description:
      "브랜드·연령·유형별 고양이 사료 칼로리와 성분 정보 목록",
    breadcrumbs: [
      { name: "홈", path: "/" },
      { name: "사료 목록", path: "/foods" },
    ],
  });

  return (
    <>
      <JsonLd id="foods-index-jsonld" data={jsonLd} />
      <main className="relative z-10 mx-auto min-h-[100dvh] w-full max-w-[min(100%,768px)] bg-white px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
        <header className="space-y-2 border-b border-[#eee] pb-6">
          <p className="text-sm text-[#666]">{SITE_BRAND}</p>
          <h1 className="text-2xl font-bold text-[#171717]">
            고양이 사료 칼로리·성분 목록
          </h1>
          <p className="text-sm leading-relaxed text-[#555]">
            등록된 사료 {feeds.length}종의 칼로리·성분·원재료 정보를 확인할 수
            있습니다. 각 사료 페이지에서 급여량 계산기로 바로 연결할 수 있어요.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Link
              href="/feed-find"
              prefetch={false}
              className="rounded-lg border border-[#eee] px-4 py-2 text-sm font-medium text-[#171717]"
            >
              사료 찾기
            </Link>
            <Link
              href="/step1"
              prefetch={false}
              className="rounded-lg bg-[#f8620c] px-4 py-2 text-sm font-semibold text-white"
            >
              급여량 계산하기
            </Link>
          </div>
        </header>

        <nav className="mt-6 flex flex-wrap gap-2 text-sm" aria-label="목록 바로가기">
          <a href="#by-brand" className="text-[#f8620c] underline">
            브랜드별
          </a>
          <span className="text-[#ccc]">·</span>
          <a href="#by-life" className="text-[#f8620c] underline">
            연령별
          </a>
          <span className="text-[#ccc]">·</span>
          <a href="#by-type" className="text-[#f8620c] underline">
            유형별
          </a>
          <span className="text-[#ccc]">·</span>
          <a href="#all-feeds" className="text-[#f8620c] underline">
            전체 목록
          </a>
        </nav>

        <section id="by-brand" className="mt-10 space-y-8">
          <h2 className="text-lg font-bold text-[#171717]">브랜드별 사료</h2>
          {brandKeys.map((brand) => (
            <div key={brand}>
              <h3 className="mb-3 text-base font-semibold text-[#333]">{brand}</h3>
              <FeedLinkList feeds={byBrand.get(brand) ?? []} />
            </div>
          ))}
        </section>

        <section id="by-life" className="mt-12 space-y-8">
          <h2 className="text-lg font-bold text-[#171717]">연령별 사료</h2>
          {lifeKeys.map((life) => (
            <div key={life}>
              <h3 className="mb-3 text-base font-semibold text-[#333]">{life}</h3>
              <FeedLinkList feeds={byLifeStage.get(life) ?? []} />
            </div>
          ))}
        </section>

        <section id="by-type" className="mt-12 space-y-8">
          <h2 className="text-lg font-bold text-[#171717]">사료 유형별</h2>
          {typeKeys.map((type) => (
            <div key={type}>
              <h3 className="mb-3 text-base font-semibold text-[#333]">{type}</h3>
              <FeedLinkList feeds={byType.get(type) ?? []} />
            </div>
          ))}
        </section>

        <section id="all-feeds" className="mt-12 space-y-4">
          <h2 className="text-lg font-bold text-[#171717]">
            전체 사료 ({feeds.length}종)
          </h2>
          <FeedLinkList feeds={feeds} />
        </section>
      </main>
    </>
  );
}

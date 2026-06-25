import { writeFileSync } from "node:fs";

import { getFeedCatalogItems } from "@/lib/feedCatalogServer";
import {
  buildFeedRelatedInternalLinks,
  getRelatedFeedsByBrand,
  getRelatedFeedsByLifeStage,
  getRelatedFeedsByPurpose,
  getRelatedFeedsBySimilarKcal,
  listFeedDetailSlugs,
  resolveFeedRouteParam,
} from "@/lib/feedDetail";

const CHECK_SLUGS = [
  "royal-canin-indoor",
  "hills-gi-biome",
  "hills-chicken-wet-156g-pwetzd",
];

async function main() {
  const related: Record<string, unknown> = {};
  for (const slug of CHECK_SLUGS) {
    const resolved = resolveFeedRouteParam(slug);
    if (!resolved) throw new Error(`missing slug: ${slug}`);
    related[slug] = buildFeedRelatedInternalLinks(resolved.feed, {
      byPurpose: getRelatedFeedsByPurpose(resolved.feed, 4),
      byBrand: getRelatedFeedsByBrand(resolved.feed, 4),
      byLifeStage: getRelatedFeedsByLifeStage(resolved.feed, 3),
      byKcal: getRelatedFeedsBySimilarKcal(resolved.feed, 3),
    }).map((link) => ({
      href: link.href,
      label: link.label,
      kcalPer100g: link.kcalPer100g,
      reasonLabel: link.reasonLabel,
    }));
  }

  const catalog = (await getFeedCatalogItems()).map((item) => ({
    id: item.id,
    slug: item.slug,
    label: item.label,
    kcalPer100g: item.kcalPer100g,
    brand: item.brand,
    name: item.name,
  }));

  const snapshot = {
    slugCount: listFeedDetailSlugs().length,
    slugs: listFeedDetailSlugs(),
    related,
    catalogSample: catalog.filter(
      (item) => item.slug != null && CHECK_SLUGS.includes(item.slug),
    ),
    catalogCount: catalog.length,
  };

  const outPath = process.argv[2] ?? "snapshots/feed-data-phase1.json";
  writeFileSync(outPath, `${JSON.stringify(snapshot, null, 2)}\n`);
  console.log(`wrote ${outPath} (${snapshot.slugCount} slugs)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

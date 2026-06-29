import type { CsvFeedRow } from "./feedServingGuideCsv";
import {
  normalizeHillsCsvName,
  normalizeHillsTitle,
  propagateHillsLegacyGuides,
  resolveHillsFeedId,
} from "./feedServingGuideHills";
import {
  RC_SLUG_FEED_ID,
  RC_TITLE_FEED_ID,
} from "./feedServingGuideRoyalCanin";

export function normalizeMatchKey(text: string): string {
  return text
    .toLowerCase()
    .replace(/&amp;/g, "&")
    .replace(/[\s_\-/·•]+/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
}

const RC_NAME_ALIASES: Record<string, string[]> = {
  마더앤베이비캣: ["motherbabycat", "mother&babycat", "motherandbabycat"],
  키튼: ["kitten"],
  인도어: ["indoor", "indoor27", "indooradult"],
  인도어렁헤어: ["indoorlonghair", "indoorlonghair"],
  스테럴라이즈드: ["sterilised", "spayedneutered", "neutered"],
  헤어볼케어: ["hairballcare", "hairball"],
  유리너리케어: ["urinarycare", "urinary"],
  라이트웨이트케어: ["weightcare", "lightweightcare"],
  다이제스티브케어: ["digestivecare", "digestive"],
  덴탈케어: ["dentalcare", "dental"],
  헤어앤스킨케어: ["hairandskincare", "hairskin"],
  인도어7: ["indoor7", "indoor7+"],
  에이징15: ["aging15", "ageing15"],
  아로마엑시전트: ["aromaexigent"],
  세이버엑시전트: ["savour", "fussy", "savourexigent"],
  프로틴엑시전트: ["proteinexigent"],
  피트: ["fit", "fit32", "fitandactive"],
  페르시안키튼: ["persiankitten"],
  페르시안어덜트: ["persianadult", "persian"],
  노령웨이숏: ["britishshorthairaging11", "britishshorthairaging"],
  에이징11: ["aging11", "ageing11", "aging11+"],
  랙돌어덜트: ["ragdolladult", "ragdoll"],
  벵갈어덜트: ["bengaladult", "bengal"],
  브리티쉬숏헤어어덜트: ["britishshorthairadult", "britishshorthair"],
  샴어덜트: ["siameseadult", "siamese"],
  센서블: ["sensible", "sensitive"],
  레날스페셜: ["renalspecial"],
  레날셀렉트: ["renalselect"],
  얼리레날: ["earlyrenal"],
  레날: ["renal"],
};

function csvKeys(row: CsvFeedRow): string[] {
  const keys = new Set<string>();
  keys.add(normalizeMatchKey(row.name));
  keys.add(normalizeMatchKey(`${row.brand}${row.name}`));
  const aliasBase = normalizeMatchKey(row.name);
  for (const [ko, aliases] of Object.entries(RC_NAME_ALIASES)) {
    if (aliasBase.includes(normalizeMatchKey(ko))) {
      for (const a of aliases) keys.add(normalizeMatchKey(a));
    }
  }
  return [...keys];
}

function scrapedKeys(title: string, slug: string): string[] {
  const keys = new Set<string>();
  keys.add(normalizeMatchKey(title));
  keys.add(normalizeMatchKey(slug.replace(/-\d+$/g, "")));
  keys.add(normalizeMatchKey(slug));
  const slugParts = slug.split("-").filter((p) => !/^\d+$/.test(p));
  keys.add(normalizeMatchKey(slugParts.join("")));
  return [...keys];
}

export function resolveRcCsvRow(
  rows: CsvFeedRow[],
  opts: {
    slug?: string;
    title: string;
    vetFeedId?: string;
    technology?: string;
  },
): CsvFeedRow | null {
  if (opts.technology && opts.technology !== "dry") return null;

  if (opts.vetFeedId) {
    const byId = rows.find((r) => r.id === opts.vetFeedId);
    if (byId) return byId;
  }

  const slug = opts.slug ?? "";
  const slugNorm = slug.replace(/-\d+$/, "");
  const mappedId =
    RC_SLUG_FEED_ID[slug] ??
    RC_SLUG_FEED_ID[slugNorm] ??
    RC_TITLE_FEED_ID[normalizeMatchKey(opts.title)];
  if (mappedId) {
    const byMap = rows.find((r) => r.id === mappedId);
    if (byMap) return byMap;
  }

  return matchCsvRow(rows, {
    brand: "로얄캐닌",
    title: opts.title,
    slug,
    technology: opts.technology,
  });
}

export function matchCsvRow(
  rows: CsvFeedRow[],
  candidate: {
    brand: string;
    title: string;
    slug?: string;
    technology?: string;
  },
): CsvFeedRow | null {
  if (candidate.technology && candidate.technology !== "dry") return null;

  const brandNorm = normalizeMatchKey(candidate.brand);
  const scraped = new Set(scrapedKeys(candidate.title, candidate.slug ?? ""));

  const brandRows = rows.filter(
    (r) =>
      r.type === "dry" &&
      (normalizeMatchKey(r.brand).includes(brandNorm) ||
        brandNorm.includes(normalizeMatchKey(r.brand))),
  );

  let best: CsvFeedRow | null = null;
  let bestScore = 0;

  for (const row of brandRows) {
    const keys = csvKeys(row);
    for (const k of keys) {
      if (!k) continue;
      for (const s of scraped) {
        if (!s) continue;
        if (k === s) {
          return row;
        }
        // "kitten"이 "kittensterilised"에 매칭되는 것 방지
        if (k.length >= 4 && s.length >= 4 && k.includes(s) && k !== s) {
          const score = s.length - 1;
          if (score > bestScore) {
            bestScore = score;
            best = row;
          }
          continue;
        }
        if (s.includes(k) && k.length >= 4) {
          const score = k.length;
          if (score > bestScore) {
            bestScore = score;
            best = row;
          }
        }
      }
    }
  }

  return bestScore >= 4 ? best : null;
}

export function matchHillsCsvRow(
  rows: CsvFeedRow[],
  hillsTitle: string,
): CsvFeedRow | null {
  const byMap = resolveHillsFeedId(rows, hillsTitle);
  if (byMap) return byMap;

  const titleNorm = normalizeHillsTitle(hillsTitle);

  const hillsRows = rows.filter(
    (r) => r.type === "dry" && normalizeMatchKey(r.brand).includes("힐스"),
  );

  let best: CsvFeedRow | null = null;
  let bestScore = 0;

  for (const row of hillsRows) {
    const nameNorm = normalizeHillsCsvName(row.name);

    if (!nameNorm) continue;

    if (titleNorm === nameNorm) {
      return row;
    }

    if (titleNorm.includes(nameNorm)) {
      const score = 5000 + nameNorm.length;
      if (score > bestScore) {
        bestScore = score;
        best = row;
      }
      continue;
    }

    if (nameNorm.includes(titleNorm) && titleNorm.length >= 4) {
      const extra = nameNorm.length - titleNorm.length;
      if (extra <= 8) {
        const score = 1000 + titleNorm.length;
        if (score > bestScore) {
          bestScore = score;
          best = row;
        }
      }
    }

    const codeMatch = titleNorm.match(/([a-z]{1,3}d|gib바이옴|메타볼릭|멀티케어\+메타볼릭)/i);
    const nameCode = nameNorm.match(/([a-z]{1,3}d|gib바이옴|메타볼릭|멀티케어\+메타볼릭)/i);
    if (codeMatch && nameCode && codeMatch[1] === nameCode[1]) {
      const score = 2000 + codeMatch[1].length;
      if (score > bestScore) {
        bestScore = score;
        best = row;
      }
    }
  }

  return bestScore >= 1000 ? best : null;
}

export { propagateHillsLegacyGuides };

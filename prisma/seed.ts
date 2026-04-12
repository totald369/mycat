import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const OPFF_USER_AGENT =
  "mycat-calculator/1.0 (https://openpetfoodfacts.org; local-dev seed)";

const koPath = join(process.cwd(), "prisma", "breedKoByApiId.json");
const nameKoByApiId = JSON.parse(readFileSync(koPath, "utf-8")) as Record<
  string,
  string
>;

const feedKoPath = join(process.cwd(), "prisma", "feedKoByApiId.json");
const feedNameKoByApiId = JSON.parse(
  readFileSync(feedKoPath, "utf-8"),
) as Record<string, string>;

type CatApiBreed = {
  id: string;
  name: string;
  description?: string;
  origin?: string;
  temperament?: string;
  life_span?: string;
  wikipedia_url?: string;
};

type OpffProduct = {
  code?: string;
  product_name?: string;
  product_name_en?: string;
  product_name_ko?: string;
  generic_name?: string;
  generic_name_ko?: string;
  brands?: string;
  categories_tags?: string[];
  /** OPFF 언어 코드 (예: fr, en) — Papago 출발어 추정용 */
  lc?: string;
};

type OpffSearchResponse = {
  products?: OpffProduct[];
  page?: number;
  page_count?: number;
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function inferFeedKind(tags: string[], productName: string): string {
  const t = tags.join(" ").toLowerCase();
  const n = productName.toLowerCase();
  if (
    t.includes("wet-cat") ||
    t.includes("wet_cat") ||
    (t.includes("wet") && t.includes("cat-food"))
  ) {
    return "습식";
  }
  if (
    t.includes("dry-cat") ||
    t.includes("dry-cat-food") ||
    t.includes("dry-catfood")
  ) {
    return "건식";
  }
  if (
    /pâtée|patee|pate|mousse|gravy|bocconcini|mousseline|fillet|tray|pouch/i.test(
      n,
    )
  ) {
    return "습식";
  }
  if (/croquette|kibble|croquettes|\d\s*kg\b/i.test(n)) {
    return "건식";
  }
  return "기타";
}

function buildDisplayLabel(kind: string, brand: string, name: string): string {
  const mid = [brand, name]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  const core = `${kind}/${mid || "이름 없음"}`;
  return core.length > 400 ? `${core.slice(0, 397)}…` : core;
}

function textHasHangul(s: string): boolean {
  return /[\uAC00-\uD7A3]/.test(s);
}

/** OPFF 필드·다국어 product_name_xx 등에서 한글 상품명 후보 추출 (API 비용 없음) */
function extractKoreanNameFromOpff(p: OpffProduct): string | null {
  const record = p as Record<string, unknown>;

  const directKo = [p.product_name_ko, p.generic_name_ko];
  for (const v of directKo) {
    if (typeof v === "string") {
      const t = v.trim();
      if (t) return t;
    }
  }

  for (const key of Object.keys(record)) {
    if (!/^product_name_[a-z]{2}$/.test(key) && !/^generic_name_[a-z]{2}$/.test(key))
      continue;
    const v = record[key];
    if (typeof v !== "string") continue;
    const t = v.trim();
    if (t && textHasHangul(t)) return t;
  }

  for (const v of [p.product_name, p.product_name_en, p.generic_name]) {
    if (typeof v !== "string") continue;
    const t = v.trim();
    if (t && textHasHangul(t)) return t;
  }

  return null;
}

function papagoSourceFromLc(lc: string | undefined): string {
  const x = (lc ?? "en").toLowerCase();
  if (x === "fr") return "fr";
  if (x === "de") return "de";
  if (x === "es") return "es";
  if (x === "it") return "it";
  if (x === "ja") return "ja";
  if (x === "zh" || x === "cn") return "zh-CN";
  return "en";
}

type PapagoNmtJson = {
  message?: { result?: { translatedText?: string } };
  errorMessage?: string;
};

async function papagoTranslateToKo(
  text: string,
  source: string,
  clientId: string,
  clientSecret: string,
): Promise<string | null> {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const body = new URLSearchParams({
    source,
    target: "ko",
    text: trimmed.slice(0, 5000),
  });
  const res = await fetch("https://openapi.naver.com/v1/papago/n2mt", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "X-Naver-Client-Id": clientId,
      "X-Naver-Client-Secret": clientSecret,
    },
    body: body.toString(),
  });
  const data = (await res.json()) as PapagoNmtJson;
  const out = data.message?.result?.translatedText?.trim();
  if (!res.ok || !out) {
    console.warn(
      "Papago 번역 실패:",
      data.errorMessage ?? res.statusText ?? res.status,
    );
    return null;
  }
  return out;
}

async function seedBreeds() {
  const headers: HeadersInit = {};
  const key = process.env.CAT_API_KEY;
  if (key) headers["x-api-key"] = key;

  const res = await fetch("https://api.thecatapi.com/v1/breeds", { headers });
  if (!res.ok) {
    throw new Error(`The Cat API 오류: ${res.status} ${res.statusText}`);
  }

  const breeds = (await res.json()) as CatApiBreed[];
  if (!Array.isArray(breeds) || breeds.length === 0) {
    throw new Error("The Cat API에서 품종 목록을 받지 못했습니다.");
  }

  for (const b of breeds) {
    const nameKo = nameKoByApiId[b.id] ?? null;
    await prisma.breed.upsert({
      where: { apiId: b.id },
      create: {
        apiId: b.id,
        nameEn: b.name,
        nameKo,
        origin: b.origin ?? null,
        temperament: b.temperament ?? null,
        description: b.description ?? null,
        lifeSpan: b.life_span ?? null,
        wikipediaUrl: b.wikipedia_url ?? null,
      },
      update: {
        nameEn: b.name,
        nameKo,
        origin: b.origin ?? null,
        temperament: b.temperament ?? null,
        description: b.description ?? null,
        lifeSpan: b.life_span ?? null,
        wikipediaUrl: b.wikipedia_url ?? null,
      },
    });
  }

  const count = await prisma.breed.count();
  console.log(`품종 ${count}건을 DB에 반영했습니다. (출처: The Cat API)`);
}

async function seedFeedProducts() {
  const pageSize = 100;
  const maxPages = 15;

  const papagoId = process.env.FEED_PAPAGO_CLIENT_ID ?? "";
  const papagoSecret = process.env.FEED_PAPAGO_CLIENT_SECRET ?? "";
  let papagoBudget = Number.parseInt(process.env.FEED_PAPAGO_MAX ?? "0", 10);
  if (Number.isNaN(papagoBudget) || papagoBudget < 0) papagoBudget = 0;
  const papagoEnabled = Boolean(papagoId && papagoSecret && papagoBudget > 0);

  if (papagoEnabled) {
    console.log(
      `급여 한글: Papago 번역 최대 ${papagoBudget}건 (나머지는 OPFF 한글 필드만 자동)`,
    );
  } else {
    console.log(
      "급여 한글: OPFF 내 한글·다국어 필드만 자동 추출 (Papago는 .env에 FEED_PAPAGO_* 설정 시)",
    );
  }

  let autoFromOpff = 0;
  let autoFromPapago = 0;

  for (let page = 1; page <= maxPages; page++) {
    const url =
      `https://world.openpetfoodfacts.org/cgi/search.pl?` +
      `action=process&tagtype_0=categories&tag_contains_0=contains&tag_0=cat-food&json=true&page_size=${pageSize}&page=${page}`;

    const res = await fetch(url, {
      headers: { "User-Agent": OPFF_USER_AGENT },
    });

    if (!res.ok) {
      throw new Error(
        `Open Pet Food Facts 오류: ${res.status} ${res.statusText}`,
      );
    }

    const data = (await res.json()) as OpffSearchResponse;
    const products = data.products ?? [];
    if (products.length === 0) break;

    for (const p of products) {
      const code = (p.code ?? "").trim();
      if (!code) continue;

      const nameRaw = (
        p.product_name ||
        p.product_name_en ||
        ""
      ).trim();
      const brand = (p.brands ?? "").trim();
      if (!nameRaw && !brand) continue;

      const name = nameRaw || brand;
      const tags = p.categories_tags ?? [];
      const kind = inferFeedKind(tags, `${brand} ${name}`);
      const displayLabel = buildDisplayLabel(kind, brand, nameRaw || name);
      const sourceUrl = `https://world.openpetfoodfacts.org/product/${code}`;

      const manualRaw = feedNameKoByApiId[code];
      let nameKo: string | null;

      if (manualRaw !== undefined) {
        nameKo = manualRaw.trim() || null;
      } else {
        nameKo = extractKoreanNameFromOpff(p);
        if (nameKo) autoFromOpff += 1;
        else if (papagoEnabled && papagoBudget > 0) {
          const toTranslate = [brand, nameRaw || name]
            .filter(Boolean)
            .join(" ")
            .trim();
          if (toTranslate && !textHasHangul(toTranslate)) {
            const translated = await papagoTranslateToKo(
              toTranslate,
              papagoSourceFromLc(p.lc),
              papagoId,
              papagoSecret,
            );
            if (translated) {
              nameKo = translated;
              papagoBudget -= 1;
              autoFromPapago += 1;
              await sleep(200);
            }
          }
        }
      }

      await prisma.feedProduct.upsert({
        where: { apiId: code },
        create: {
          apiId: code,
          feedKind: kind,
          brand: brand || null,
          name,
          nameKo,
          displayLabel,
          sourceUrl,
        },
        update: {
          feedKind: kind,
          brand: brand || null,
          name,
          displayLabel,
          sourceUrl,
          nameKo,
        },
      });
    }

    await sleep(450);
    if (products.length < pageSize) break;
  }

  const count = await prisma.feedProduct.count();
  console.log(
    `급여(사료) ${count}건을 DB에 반영했습니다. (출처: Open Pet Food Facts, cat-food)`,
  );
  console.log(
    `  한글 nameKo: OPFF 자동 ${autoFromOpff}건, Papago ${autoFromPapago}건 (수동 JSON은 별도)`,
  );
}

async function main() {
  await seedBreeds();
  try {
    await seedFeedProducts();
  } catch (e) {
    console.warn(
      "급여(사료) 시드만 실패했습니다. 네트워크·User-Agent 제한을 확인하세요.",
      e,
    );
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });

/**
 * hillspet.co.kr 고양이 사료 상세 스크래핑 (일회성 데이터 수집용)
 * Usage: node scripts/scrape-hills.mjs
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const SEEDS = [
  "https://www.hillspet.co.kr/cat-food/pd-gastrointestinal-biome-feline-dry",
  "https://www.hillspet.co.kr/cat-food/science-diet-adult-original-dry",
  "https://www.hillspet.co.kr/cat-food/prescription-diet-id-digestive-care-dry",
  "https://www.hillspet.co.kr/cat-food/prescription-diet-cd-multicare-chicken-urinary-care-dry",
  "https://www.hillspet.co.kr/cat-food/science-diet-kitten-original-dry",
  "https://www.hillspet.co.kr/cat-food/prescription-diet-td-dental-care-dry",
  "https://www.hillspet.co.kr/cat-food/prescription-diet-wd-glucose-management-dry",
  "https://www.hillspet.co.kr/cat-food/pd-kd-feline-dry",
  "https://www.hillspet.co.kr/cat-food/pd-id-feline-canned",
  "https://www.hillspet.co.kr/cat-food/pd-wd-feline-dry",
  "https://www.hillspet.co.kr/cat-food/pd-zd-feline-dry",
  "https://www.hillspet.co.kr/cat-food/pd-td-feline-dry",
  "https://www.hillspet.co.kr/cat-food/sd-feline-adult-hairball-control-light-dry",
  "https://www.hillspet.co.kr/cat-food/science-diet-adult-hairball-dry",
  "https://www.hillspet.co.kr/cat-food/science-diet-adult-perfect-weight-dry",
];

const EXTRA_URLS = [
  "https://www.hillspet.co.kr/cat-food/pd-kd-feline-dry",
  "https://www.hillspet.co.kr/cat-food/prescription-diet-kd-ocean-fish-tuna-kidney-care-dry",
  "https://www.hillspet.co.kr/cat-food/prescription-diet-kd-chicken-kidney-care-canned",
  "https://www.hillspet.co.kr/cat-food/prescription-diet-kd-chicken-vegetable-stew-kidney-care-canned",
  "https://www.hillspet.co.kr/cat-food/prescription-diet-kd-early-support-feline-dry",
  "https://www.hillspet.co.kr/cat-food/prescription-diet-kd-tuna-vegetable-stew-kidney-care-canned",
  "https://www.hillspet.co.kr/cat-food/pd-metabolic-feline-dry",
  "https://www.hillspet.co.kr/cat-food/pd-yd-feline-dry",
  "https://www.hillspet.co.kr/cat-food/pd-td-feline-dry",
  "https://www.hillspet.co.kr/cat-food/pd-onc-feline-dry",
  "https://www.hillspet.co.kr/cat-food/pd-feline-onc-on-care-chicken-stew",
  "https://www.hillspet.co.kr/cat-food/pd-zd-feline-canned",
  "https://www.hillspet.co.kr/cat-food/pd-zd-feline-dry",
  "https://www.hillspet.co.kr/cat-food/pd-wd-feline-canned",
  "https://www.hillspet.co.kr/cat-food/pd-wd-feline-dry",
  "https://www.hillspet.co.kr/cat-food/pd-id-feline-canned",
  "https://www.hillspet.co.kr/cat-food/pd-id-feline-chicken-and-vegetable-stew-canned",
  "https://www.hillspet.co.kr/cat-food/pd-id-feline-dry",
  "https://www.hillspet.co.kr/cat-food/pd-ad-canine-feline-canned",
  "https://www.hillspet.co.kr/cat-food/pd-gastrointestinal-biome-feline-chicken-and-vegetable-stew-canned",
  "https://www.hillspet.co.kr/cat-food/science-diet-adult-perfect-digestion-salmon-oats-brown-rice-dry",
  "https://www.hillspet.co.kr/cat-food/science-diet-adult-perfect-digestion-chicken-vegetable-rice-stew-canned",
  "https://www.hillspet.co.kr/cat-food/sd-feline-adult-perfect-weight-chicken-vegetable-stew-canned",
  "https://www.hillspet.co.kr/cat-food/sd-feline-kitten-healthy-cuisine-chicken-rice-stew-canned",
  "https://www.hillspet.co.kr/cat-food/sd-feline-adult-healthy-cuisine-chicken-rice-stew-canned",
  "https://www.hillspet.co.kr/cat-food/sd-feline-adult-7-plus-healthy-cuisine-roasted-chicken-rice-medley-canned",
  "https://www.hillspet.co.kr/cat-food/sd-feline-adult-healthy-cuisine-tuna-carrots-stew-canned",
  "https://www.hillspet.co.kr/cat-food/prescription-diet-cd-multicare-stress-vegetable-tuna-stew-urinary-care-canned",
  "https://www.hillspet.co.kr/cat-food/prescription-diet-cd-multicare-stress-chicken-vegetable-stew-urinary-care-canned",
  "https://www.hillspet.co.kr/cat-food/prescription-diet-id-kitten-feline-canned",
  "https://www.hillspet.co.kr/cat-food/prescription-diet-id-digestive-care-canned",
  "https://www.hillspet.co.kr/cat-food/sd-feline-adult-urinary-hairball-control-dry",
  "https://www.hillspet.co.kr/cat-food/sd-feline-adult-hairball-control-light-dry",
  "https://www.hillspet.co.kr/cat-food/sd-feline-adult-indoor-dry",
  "https://www.hillspet.co.kr/cat-food/science-diet-adult-indoor-dry",
  "https://www.hillspet.co.kr/cat-food/science-diet-adult-light-dry",
  "https://www.hillspet.co.kr/cat-food/science-diet-adult-perfect-digestion-chicken-barley-whole-oats-recipe-dry",
  "https://www.hillspet.co.kr/cat-food/science-diet-mature-adult-indoor-dry",
  "https://www.hillspet.co.kr/cat-food/science-diet-mature-adult-7-perfect-digestion-dry",
  "https://www.hillspet.co.kr/cat-food/science-diet-adult-hairball-dry",
  "https://www.hillspet.co.kr/cat-food/science-diet-adult-sensitive-stomach-dry",
  "https://www.hillspet.co.kr/cat-food/prescription-diet-gastrointestinal-biome-feline-dry",
];

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Accept-Language": "ko-KR,ko;q=0.9",
};

async function fetchHtml(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

function discoverUrls(html) {
  const found = new Set();
  for (const m of html.matchAll(
    /https:\/\/www\.hillspet\.co\.kr\/cat-food\/[a-z0-9\-]+/g,
  )) {
    found.add(m[0]);
  }
  for (const m of html.matchAll(/href="(\/cat-food\/[a-z0-9\-]+)"/g)) {
    found.add("https://www.hillspet.co.kr" + m[1]);
  }
  return found;
}

function stripTags(s) {
  return s
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, " ")
    .trim();
}

function parseProduct(url, html) {
  const slug = url.split("/cat-food/")[1];
  let title = "";
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) title = stripTags(h1[1]);
  if (!title) {
    const t = html.match(/<title>([^<]+)<\/title>/i);
    if (t) title = t[1].split("|")[0].trim();
  }

  let form = "";
  if (/건사료|건식|dry/i.test(html) && !/습식|캔|스튜|canned|stew/i.test(title))
    form = "dry";
  if (/습식|캔|파테|canned/i.test(html) || /캔|파테|습식/.test(title)) form = "wet";
  if (/스튜|stew/i.test(html) || /스튜/.test(title)) form = "wet";

  // 사료 형태 block
  const formBlock = html.match(/사료\s*형태[\s\S]{0,200}?(건사료|습식|캔|스튜)/i);
  if (formBlock) {
    const f = formBlock[1];
    if (/건/.test(f)) form = "dry";
    else form = "wet";
  }

  let size = "";
  const sizeM = html.match(/사이즈[\s\S]{0,300}?(\d[\d.,\s]*(kg|g|ml|oz)[^\n<]{0,40})/i);
  if (sizeM) size = stripTags(sizeM[1]);

  const BAD_ING = /급여|유용한정보|주치의|반려동물을|임신|환불|몸무게를유지/;
  function cleanIngredientText(raw) {
    return raw.replace(/<[^>]+>/g, "").replace(/\s+/g, "").trim();
  }
  function isIngredientList(s) {
    return (
      s.includes(",") &&
      s.length > 30 &&
      !BAD_ING.test(s) &&
      /닭|물|돼지|쌀|옥수수|현미|생선|연어|참치|칠면조|정제수|닭고기육수/.test(s)
    );
  }

  let ingredients = "";
  const ingBlocks = [
    ...html.matchAll(
      /cmp-accordion__title">([^<]*성분[^<]*)<[\s\S]*?<div class="segment[^"]*">\s*([\s\S]*?)\s*<\/div>/g,
    ),
  ];
  for (const m of ingBlocks) {
    const s = cleanIngredientText(m[2]);
    if (isIngredientList(s)) {
      ingredients = s;
      break;
    }
  }
  if (!ingredients) {
    for (const seg of html.matchAll(
      /<div class="segment[^"]*">\s*([\s\S]*?)\s*<\/div>/g,
    )) {
      const s = cleanIngredientText(seg[1]);
      if (isIngredientList(s)) {
        ingredients = s;
        break;
      }
    }
  }

  let kcalKg = null;
  let kcalCan = null;
  let servingG = null;
  const kcalKgM = html.match(/(\d{3,4})\s*kcal\/kg/i);
  if (kcalKgM) kcalKg = Number(kcalKgM[1]);
  const kcalCanM = html.match(
    /(\d{2,4}(?:\.\d+)?)\s*kcal\s*\/[^(\n<]*\(\s*(\d+)\s*g\s*\)/i,
  );
  if (kcalCanM) {
    kcalCan = Number(kcalCanM[1]);
    servingG = Number(kcalCanM[2]);
  }

  const nutrients = {};
  const labels = [
    "단백질",
    "지방",
    "조섬유",
    "칼슘",
    "인",
    "마그네슘",
    "타우린",
    "칼륨",
    "나트륨",
  ];
  for (const label of labels) {
    const re = new RegExp(
      `<td>\\s*${label}\\s*</td>\\s*<td>\\s*([\\d.]+)\\s*%`,
      "i",
    );
    const m = html.match(re);
    if (m) nutrients[label] = m[1] + "%";
  }

  const parts = [];
  for (const label of ["단백질", "지방", "조섬유", "칼슘", "인", "마그네슘", "타우린"]) {
    if (nutrients[label]) parts.push(`${label} ${nutrients[label]}`);
  }
  if (kcalKg) parts.push(`ME ${kcalKg} kcal/kg (건조물 기준)`);
  const nutrition = parts.join(", ");

  const isPrescription =
    /프리스크립션|prescription|pd-/.test(html) || /pd-/.test(slug);

  let kcalPer100g = null;
  if (kcalKg) kcalPer100g = Math.round(kcalKg / 10);
  else if (kcalCan && servingG)
    kcalPer100g = Math.round((kcalCan / servingG) * 100);

  return {
    url,
    slug,
    title,
    form: form || "dry",
    size,
    ingredients,
    kcalKg,
    kcalCan,
    servingG,
    kcalPer100g,
    nutrients,
    nutrition,
    isPrescription,
  };
}

async function main() {
  const allUrls = new Set(EXTRA_URLS);
  for (const seed of SEEDS) {
    try {
      const html = await fetchHtml(seed);
      for (const u of discoverUrls(html)) allUrls.add(u);
    } catch (e) {
      console.error("seed", seed, e.message);
    }
  }

  const results = [];
  const urls = [...allUrls].sort();
  console.error(`Fetching ${urls.length} URLs...`);

  for (const url of urls) {
    try {
      await new Promise((r) => setTimeout(r, 200));
      const html = await fetchHtml(url);
      const p = parseProduct(url, html);
      if (p.kcalPer100g || p.nutrition || p.ingredients) results.push(p);
      console.error(
        p.slug,
        p.kcalPer100g ?? "-",
        p.servingG ? `srv${p.servingG}` : "",
        p.ingredients ? "ing" : "---",
        p.nutrition ? "nut" : "---",
      );
    } catch (e) {
      console.error("FAIL", url, e.message);
    }
  }

  const out = join(process.cwd(), "scripts", "hills-scraped.json");
  writeFileSync(out, JSON.stringify(results, null, 2), "utf8");
  console.error(`Wrote ${results.length} products to ${out}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

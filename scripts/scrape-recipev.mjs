/**
 * recipe-v.co.kr 반려묘 사료 상세(제품 이미지) 스크래핑
 * Usage: node scripts/scrape-recipev.mjs
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

const BASE = "https://recipe-v.co.kr/wp-content/uploads/2023/11";

/** slug → 이미지 파일 (공식 페이지 prod_img*) */
const PRODUCTS = [
  { slug: "renal", file: "prod_imgc01_001.jpeg", path: "prescription/renal" },
  { slug: "urinary", file: "prod_imgc01_002.jpeg", path: "prescription/urinary" },
  { slug: "digest", file: "prod_imgc01_003.jpeg", path: "prescription/digest" },
  { slug: "skin", file: "prod_imgc01_004.jpeg", path: "prescription/skin-and-allergy" },
  { slug: "lowpet", file: "prod_imgc01_005.jpeg", path: "prescription/lowpet" },
  { slug: "diet", file: "prod_imgc02_001.jpeg", path: "functional/diet" },
  { slug: "hairball", file: "prod_imgc02_002.jpeg", path: "functional/hair-ball" },
  { slug: "kitten", file: "prod_imgc03_001.jpeg", path: "by-life-cycle/kitten" },
  { slug: "adult", file: "prod_imgc03_002.jpeg", path: "by-life-cycle/adult" },
  { slug: "senior", file: "prod_imgc03_003.jpeg", path: "by-life-cycle/senior" },
  { slug: "korshort", file: "prod_imgc04_001.jpeg", path: "by-breed/korean-shorthair" },
];

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "image/*,*/*",
  Referer: "https://recipe-v.co.kr/cat/prescription/",
};

async function downloadImage(slug, file) {
  const url = `${BASE}/${file}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const local = join(process.cwd(), "scripts", `.cache-recipev-${slug}.jpg`);
  writeFileSync(local, buf);
  const h = +execSync(`sips -g pixelHeight "${local}" | awk '/pixelHeight/{print $2}'`)
    .toString()
    .trim();
  const top = h - 5950;
  const crop = join(process.cwd(), "scripts", `.cache-recipev-${slug}-crop.jpg`);
  execSync(
    `sips --cropToHeightWidth 3950 1000 --cropOffset ${top} 0 "${local}" --out "${crop}"`,
  );
  console.log("OK", slug, `h=${h}`, url);
  return { url: `https://recipe-v.co.kr/cat/${PRODUCTS.find((p) => p.slug === slug)?.path}/`, imageUrl: url, cropPath: crop };
}

const meta = [];
for (const p of PRODUCTS) {
  try {
    meta.push({ slug: p.slug, ...(await downloadImage(p.slug, p.file)) });
  } catch (e) {
    console.error("FAIL", p.slug, e.message);
  }
}

const out = join(process.cwd(), "scripts", "recipev-image-meta.json");
writeFileSync(out, JSON.stringify(meta, null, 2));
console.log("Wrote", out, "— OCR/vision으로 recipev-scraped.json 갱신 필요");

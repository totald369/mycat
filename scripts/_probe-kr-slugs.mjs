const headers = {
  "User-Agent": "Mozilla/5.0 (Macintosh)",
  "Accept-Language": "ko-KR",
  Referer: "https://www.royalcanin.com/kr/",
};

async function tryLocale(locale, slug, vet = false) {
  const base = vet ? "vet-products" : "retail-products";
  const url = `https://www.royalcanin.com/${locale}/cats/products/${base}/${slug}`;
  const html = await fetch(url, {
    headers: {
      ...headers,
      "Accept-Language": locale === "kr" ? "ko-KR" : "en-GB",
    },
  }).then((r) => r.text());
  const m = html.match(/__NEXT_DATA__[^>]*>([\s\S]*?)<\/script>/);
  if (!m || html.length < 5000) return null;
  const r = JSON.parse(m[1]).props?.pageProps?.productData?.response;
  if (!r || r.technology !== "dry") return null;
  return {
    locale,
    title: r.title,
    guide: Boolean(r.original_product?.feeding_guideline_html),
  };
}

async function probe(slug, vet = false) {
  for (const locale of ["kr", "uk"]) {
    const x = await tryLocale(locale, slug, vet);
    if (x) return { slug, ...x };
  }
  return null;
}

const slugs = [
  "mother-&-babycat-2544",
  "kitten-2522",
  "kitten-spayed--neutered-2562",
  "indoor-adult-2529",
  "hairball-care-2534",
  "urinary-care-1800",
  "weight-care-2524",
  "digestive-care-2555",
  "dental-care-2532",
  "hair&skin-care-2526",
  "indoor-7+-2548",
  "indoor-long-hair-usa-only-2549",
  "aging-11+-2561",
  "fit-and-active-2520",
  "fit-32-2520",
  "fussy-2531",
  "sensitive-digestion-2521",
  "ragdoll-adult-2515",
  "siamese-adult-2551",
  "persian-adult-2552",
  "persian-kitten-2554",
  "maine-coon-adult-2550",
  "bengal-adult-4370",
  "appetite-control-care-2563",
];

for (const slug of slugs) {
  const x = await probe(slug);
  console.log(x ? `${x.slug} [${x.locale}] ${x.title} ${x.guide ? "OK" : "NO_GUIDE"}` : `${slug} MISS`);
  await new Promise((r) => setTimeout(r, 150));
}

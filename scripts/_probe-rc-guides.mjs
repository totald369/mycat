async function getGuide(slug) {
  const url = `https://www.royalcanin.com/uk/cats/products/retail-products/${slug}`;
  const html = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0", "Accept-Language": "en-GB" },
  }).then((r) => r.text());
  const r = JSON.parse(
    html.match(/__NEXT_DATA__[^>]*>([\s\S]*?)<\/script>/)[1],
  ).props.pageProps.productData.response;
  return { title: r.title, guide: r.original_product.feeding_guideline_html };
}

const slugs = [
  "indoor-long-hair-usa-only-2549",
  "kitten-2522",
  "mother-&-babycat-2544",
  "kitten-spayed--neutered-2562",
  "sterilised-37-2530",
  "spayed-neutered-adult-2530",
  "british-shorthair-adult-2553",
  "aging-12+-2561",
  "aging-15+-2560",
];

for (const slug of slugs) {
  try {
    const x = await getGuide(slug);
    console.log("===", slug, x.title);
    console.log(x.guide?.slice(0, 1000));
  } catch {
    console.log(slug, "FAIL");
  }
  await new Promise((r) => setTimeout(r, 200));
}

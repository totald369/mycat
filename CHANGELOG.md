# Changelog

## 2026-04-27

### Data

- Added 14 `RecipeV` cat feeds from `yuhan_recipe_v_mall` into `prisma/cat_food.csv` for production catalog delivery.
- Filled kcal values from label screenshots for 13 products; `10025316492` (코숏) remains without confirmed kcal and is left blank.
- Applied medical conditions (`renal`, `digestive`, `urinary`, `senior`, `low_fat`, `adult`, `skin_allergy`, `hairball`, `diet`, `indoor`, `kitten`) for the new rows.

## 2026-04-14

### Performance

- **next.config.ts**: `images.formats` AVIF + WebP; `experimental.optimizePackageImports: ["lottie-react"]`.
- **`GET /api/feeds`**: `Cache-Control: public, s-maxage=300, stale-while-revalidate=3600`.
- **Result** (`src/app/result/page.tsx`): `html-to-image` loaded only when saving image; `CheckCatLottie` via `next/dynamic` (`ssr: false`).
- **Step3** (`src/app/step3/page.tsx`): `CalculatingPawsPetLottie` dynamically imported.
- **SVG** (`AppLogo`, `PawButton`, Step2 BCS icons): `next/image` + `unoptimized`. Result hero WebP and related capture area stay `<img>` for `html-to-image` compatibility.

Build snapshot: `/result` and `/step3` First Load JS about **205 kB → ~121 kB / ~123 kB**.

### UX (Clarity dead clicks)

- Loading copy when **`output` is still null** and no error (short Korean loading line in UI).

### Follow-up (result splash & wizard inputs)

- **Result** (`src/app/result/page.tsx`): Complete splash dismisses only when **`CheckCatLottie`** calls `onComplete` (removed tap target, four-second fallback, and the tap-hint subtitle below the complete headline). **`CheckCatLottie`**: if the Lottie JSON fetch fails, still invokes `onComplete` so the screen cannot stall.
- **Wizard fields** (`wizardFieldClasses.ts`): **`wizardInputRowClass`** / **`wizardInputInRowClass`** — Figma 45:402-style horizontal flex (`flex-1` text + `shrink-0` trailing actions) with **`overflow-hidden`** and input **`truncate`**, instead of overlaying the search icon with `absolute`.
- **Step1** (`src/app/step1/page.tsx`): Breed field uses the row pattern above.
- **Step3** (`src/app/step3/page.tsx`): Feed search field uses the same row pattern (clear + search buttons in a trailing `shrink-0` group); field wrapper **`min-w-0`** for reliable ellipsis in the card column.

### Share (short links only)

- **Result** share uses **`/r/{id}`** only (no long `?s=` fallback). `requestShortShareLink` retries `POST /api/share` up to 3 times; loading state and toasts for copy / errors.
- **`POST /api/share`**: returns existing **`shortId`** when the same `payload` was already stored (HTTP 200).

### Data

- When `prisma/cat_food.csv` / `prisma/cat_food.numbers` are updated in the same commit, production feed catalog follows after deploy.

# Changelog

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

### Follow-up (result splash & step1)

- **Result** (`src/app/result/page.tsx`): Complete splash dismisses only when **`CheckCatLottie`** calls `onComplete` (removed tap target, four-second fallback, and the tap-hint subtitle below the complete headline). **`CheckCatLottie`**: if the Lottie JSON fetch fails, still invokes `onComplete` so the screen cannot stall.
- **Step1** (`src/app/step1/page.tsx`): Breed field uses **`truncate`**, **`min-w-0`**, and extra right padding so long values do not overlap the search icon.

### Share (short links only)

- **Result** share uses **`/r/{id}`** only (no long `?s=` fallback). `requestShortShareLink` retries `POST /api/share` up to 3 times; loading state and toasts for copy / errors.
- **`POST /api/share`**: returns existing **`shortId`** when the same `payload` was already stored (HTTP 200).

### Data

- When `prisma/cat_food.csv` / `prisma/cat_food.numbers` are updated in the same commit, production feed catalog follows after deploy.

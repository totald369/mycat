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

- **Result** (`src/app/result/page.tsx`): “계산 ��료” splash is a **full-area `button`** (tap skips to content); subtitle “��러 결과 보기”; `touch-manipulation` on mobile.
- Loading copy when **`output` is still null** and no error: “결과를 불러오는 중이에요…”.

### Data

- When `prisma/cat_food.csv` / `prisma/cat_food.numbers` are updated in the same commit, production feed catalog follows after deploy.

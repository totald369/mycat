# Changelog

## 2026-05-26

### UX (Step3)

- 추가된 사료 **칩 탭** 시 g·회·사료명을 입력란에 불러와 **수정** 버튼으로 급여량 갱신. 편집 중 칩 링 표시, 재탭 시 선택 해제.

### SEO (Google)

- **Home** (`src/app/page.tsx`): 계산 카드 아래에 **SEO 가이드 섹션(H2 5개)** + 내부 링크 추가(고정 CTA는 유지, 하단 겹침 문구 제거).
- **Landing**: 검색 의도형 한국어 랜딩 페이지 8개 추가(고유 메타/본문/H1/H2, 계산기(`/step1`)로 링크).
- **Sitemap** (`src/app/sitemap.ts`): 랜딩 경로를 `seoLandingPages.ts`에서 생성한 목록으로 관리해 누락 방지.
- **Copy polish**: 홈 SEO 타이틀 하단 안내 문구를 새 카피로 교체하고 중요 문구 색상 강조 + 문장 시작 2px 들여쓰기 적용.
- **FAQ UI** (`src/components/seo/SeoFaqSection.tsx`): 질문/답변 앞머리에 `Q.` / `A.` 프리픽스 추가.
- **Hierarchy tune** (`src/components/seo/HomeSeoGuideSection.tsx`): 카드 아래 SEO 안내 영역 타이포를 FAQ 섹션 위계와 맞추도록 제목/본문 크기·행간·여백 상향 조정.

### UX (Search input)

- **Step1/Step3** (`src/app/step1/page.tsx`, `src/app/step3/page.tsx`): 검색 입력창에서 Enter 키로도 검색 모달이 열리도록 키보드 동작 추가.

### Site footer

- **`SiteFooter`**: 홈·SEO 랜딩 하단에 `2026 우리냥이맘마. All rights reserved.` 푸터 추가.

### Performance (home LCP)

- **Home carousel**: `HomeCardCarouselLazy`로 마퀴 클라이언트 번들 지연 로드.
- **Below-fold**: `HomePageBelowFold` + `content-visibility`로 SEO·FAQ paint 비용 완화.
- **Prefetch**: 홈·랜딩 내부 링크 `prefetch={false}`로 초기 네트워크 부담 감소.
- **Assets/scripts**: 배경·로고 우선순위 조정, AdSense `afterInteractive` 로드, `html-to-image` import 최적화.

## 2026-05-18

### UX (Step3)

- 급여 정보 입력 화면 상단 **입력 체크리스트** UI 제거.

## 2026-05-18 (Clarity UX)

### UX (Microsoft Clarity 세션 인사이트 대응)

- **Step1**: 생년월일 필수(다음·결과 검증 일치), 성별 선택 후 체중 입력으로 포커스·스크롤, 배경 LCP `priority={false}`.
- **Step2**: `useRequireWizardStep`·체형/활동량 선택 요약, step1 미완료 시 다음 차단.
- **Step3**: 사료 추가 안내, 간식 필수 검증, 오류 시 섹션 스크롤, 이전 단계 가드.
- **`wizardFlow.ts`**: step1/2 완료 여부·직접 URL 진입 리다이렉트.

## 2026-05-18 (AdSense·Step3)

### AdSense

- **`src/constants/googleAdSense.ts`**: Publisher ID `ca-pub-7804546387826763`.
- **`layout.tsx`**: Site-wide AdSense script in `<head>` (all pages) for Google site verification / ad serving.

### UX (Step3 snack)

- Snack choices: **하루 한번 / 주2-3회 / 주1회 미만 / 주지 않음** (2×2 grid). Legacy label `주 2-3회` still maps in calculator.

## 2026-05-18 (SEO)

### SEO (Google·Naver, structured data, CWV)

- **`src/lib/seo.ts`**: Central site config, core keywords, `buildRootMetadata` / `buildPageMetadata`, JSON-LD helpers (Organization, WebSite, WebApplication, Article, FAQPage, BreadcrumbList), wizard `noindex`.
- **Home** (`page.tsx`): sr-only H1, FAQ section + FAQ schema, WebApplication graph, semantic `header`/`nav`/`aside`, landing internal links.
- **Landing** (`SeoLandingPage.tsx`, `seoLandingPages.ts`): Korean-first titles/descriptions, visible FAQ + Article/Breadcrumb/FAQ JSON-LD, breadcrumb nav.
- **`sitemap.ts` / `robots.ts` / `public/robots.txt`**: Index landing + home only; disallow `/step*`, `/result`, `/r/`, `/api/`; Naver Yeti rule.
- **Wizard layouts**: `robots: noindex` for step1–3 and result.

## 2026-05-18

### UX (Result calorie breakdown)

- **Result** (`src/app/result/page.tsx`): Summary card stays **권장 칼로리 / 급여 칼로리**; tagline line 1 uses **권장량 대비 %** (`권장량보다 N% 적게/많이 먹고 있어요.` or `권장량에 맞게 먹고 있어요.`), line 2 keeps existing action copy (늘리기/줄이기/유지).
- **Intake chips** below the card: **건식 / 습식 / 간식** kcal pills (0 kcal hidden); total kcal is not repeated under the card.
- **Calculator** (`src/lib/calculator.ts`): `dryFoodCalories` / `wetFoodCalories` from feed `feedKind`; `foodCalories` unchanged as their sum.
- **Wizard** (`src/lib/wizardCalories.ts`): Resolves `feedKind` from catalog or `건식/`·`습식/` label prefix when building foods from Step3 chips.
- **Share** (`src/lib/shareResultPayload.ts`): Payload **v2** includes dry/wet split; v1 links still decode (dry = legacy `foodCalories`, wet = 0).

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

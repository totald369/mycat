# Changelog

## 2026-06-04

### Feed catalog (사료 CSV)

- **퓨어네이쳐 캣 치킨 2kg** (`CP7292214927`): 쿠팡 상품 기준 등록, [공식몰 캣 치킨](https://purenature.kr/product/%ED%93%A8%EC%96%B4%EB%84%A4%EC%9D%B4%EC%B3%90-%EC%BA%A3-%EC%B9%98%ED%82%A8-5kg/53/) 원료·등록성분량·ME 3,595 kcal/kg(360 kcal/100g) 반영.

## 2026-05-26

### SEO — 사료 상세 URL·메타·구조화 데이터

- **`/foods/[slug]`**: SEO URL (`royal-canin-indoor` 등). 레거시 `/foods/csv-*` → slug **301** 리다이렉트.
- **`/foods`**: 브랜드·연령·유형별 HTML 링크 목록, sitemap·WebPage+Article JSON-LD·성분 해석·내부링크.
- **사료 상세 JSON-LD**: Product → WebPage + Article (정보 제공 페이지, Product Rich Result·offers 오류 회피).
- **습식·건식 추가 3 (어바웃펫 ID)**: CSV 13종 — 알모네이처 젤리·참치&새우 캔, 인디고 헤어볼·유리너리, 하림 더리얼 5.8kg, NV Instinct LID 칠면토, 후새·아투·now·로우즈 밀프리 건식. 후새·하림 건식 ME 미표기는 성분 기반 추정.
- **어바웃펫 추가 4 (31 URL)**: CSV 30종 신규 — 이즈칸 퍼포먼스 어덜트, 스텔라 크레이빙스 2종, 레오나르도 컴플리트·피쉬, ANF 6free 4종, 위스카스 테이스티믹스·포켓 6종, 뉴트로 2종, 후새 메리타임, 게더, 스텔라 로우코티드, 캐츠랑·케어캣·CP클래식, 데일리딜라이트·런치·사조 습식·간식캔. GP251070977 중복 제외. 캐츠랑·위스카스 포켓 등 ME 미표기는 성분·유사 제품 기준 추정.

### Navigation (메뉴 레이어)

- **`SiteMenuLayer`**: 피그마 Menu Layer(315:54) 기준 전역 메뉴 오버레이 — 375px 앱 셸, 4개 항목(급여량 계산하기·사료 찾기·급여 가이드·칼로리 가이드).
- **`WizardHeader`**: 좌 메뉴 버튼(`Ic_Menu`) 탭 시 메뉴 레이어 오픈.
- **`siteMenu.ts`**: 메뉴 항목 정의 및 `isSiteMenuItemActive` — 현재 경로에 맞는 항목 Active(브라운 `#6f4425` + `WizardSelectedChoiceLayers`, 흰색 semibold). 계산기(`/step1`~`/result`), 사료 찾기(`/feed-find`, `/foods/*`) 포함.

### Feed find (사료 찾기)

- **`/feed-find`**: 전용 사료 찾기 페이지 — 공통 헤더 + `FeedSearchView`(page 모드). 페이지 진입 시 전체 사료 목록 표시, 칩·검색 필터.
- **`FeedFindPageView`**: 독립 탐색형 UI — 8개 필터 칩(전체·건식·습식·키튼·성묘·체중관리·헤어볼·처방식), 인기 사료, `FeedFindCard`(브랜드·칼로리·뱃지·상세 보기). 계산기 팝업(`FeedSearchView` modal)과 분리.
- **`FeedSearchView`**: step3 모달용 간편 검색(건식/습식 칩만). page 모드는 `FeedFindPageView`로 대체.
- **`next.config.ts`**: `/사료-찾기` → `/feed-find` 영구 리다이렉트.

### Modal layout (팝업 너비 통일)

- **`wizardModalOverlayClass` / `wizardModalPanelClass`**: 전면 팝업을 페이지와 동일 375px 중앙 정렬.
- **적용**: 메뉴 레이어, 품종·사료 검색 모달, step3 계산 중 오버레이.

### Food detail (사료 상세)

- **`/foods/[id]`**: CSV 기반 사료 상세 페이지 — 브랜드·제품명·유형·급여 대상·칼로리·기준 급여량, 가이드·성분(준비 중) 섹션, not-found(돌아가기·계산하러 가기). 계산기 CTA 미연결(화면 로직 정합성).
- **`FeedFindPageClient`**: 사료 선택 시 `/foods/[id]` 이동.
- **SEO**: 동적 title/description, SSG(`generateStaticParams`).
- **성분 CSV**: `prisma/cat_food.csv`에 `ingredients`·`nutrition_analysis` 열 추가 — 상세 페이지 등록성분량·원재료 표시.
- **로얄캐닌 유리너리 케어**: CSV 등록(`csv-01tdJ000002FJKvQAO`) — 공식 원재료·등록성분량(단백질 33% 등), 358 kcal/100g.
- **로얄캐닌 케어 시리즈 (클럽 ID)**: CSV 10종 등록·성분 반영 — 헤어볼·유리너리·라이트 웨이트(건·습), 헤어볼 습식, 다이제스티브(건·습), 덴탈, 헤어앤스킨. 구 numeric id(`6`·`7`) → 클럽 상품번호(`01tdJ000002FJK*`)로 교체.
- **로얄캐닌 라이프스테이지 (클럽 ID)**: CSV 16종 등록·성분 반영 — 마더앤베이비캣·키튼·인도어(건·습) 등 구 numeric id(`1`~`4`·`9`) → 클럽 상품번호로 교체, 습식·캔 신규(마더앤베이비캣 습식·캔, 키튼 습식, 인도어 습식, 베이비캣 무스, 헤어앤스킨 케어 습식).
- **로얄캐닌 노령 라인 (클럽 ID)**: CSV 6종 — 인도어 7+(건·습), 에이징 11(건·습), 에이징 15(건·습). 구 numeric id(`8`) 교체, 공식 KR 원재료·등록성분량·칼로리 반영.
- **로얄캐닌 스테럴라이즈드·엑시전트·피트 (클럽 ID)**: CSV 6종 — 스테럴라이즈드(건·습 파우치), 아로마·세이버·프로틴 엑시전트, 피트. 구 numeric id(`5`·`10`) → 클럽 상품번호로 교체.
- **로얄캐닌 묘종·센서리·인스팅티브 (클럽 ID)**: CSV 14종 — 페르시안(키튼·어덜트), 랙돌·벵갈·브리티시 숏헤어·샴, 인도어 롱헤어, 센서블, 인스팅티브(성묘·7+), 센서리(스멜·테이스트·필), 노령웨이숏. 공식 KR 원재료·등록성분량·칼로리 반영(센서리 필 습식 원재료는 동일 라인 스멜 KR·등록성분 UK 기준, 노령웨이숏은 KR 전용 상세 페이지 없어 에이징 12+ 공식 성분 적용).
- **아카나 건식 (어바웃펫 ID)**: CSV 5종 — 바운티풀 캐치·홈스테드 하비스트 신규, 캣 패시피카·와일드 프레이리·그래스랜드는 구 numeric id(`22`~`24`) → `GP251077033` 등으로 교체. ACANA 공식 성분·ME(100g당 kcal) 반영.
- **습식 캔 (어바웃펫 ID)**: CSV 12종 — 아보덤 그레인프리 5종, 로우즈 슈레디드 6종, 알모네이처 HFC 무스 1종. 구 `182`·`183` → `GP251025417`·`GP251025411`로 교체(85g·성분 반영). 아보덤·로우즈·알모네이처 공식 성분·ME 반영(참치&새우는 KR 전용 SKU로 동일 라인 해산물 그레이비 기준 추정).
- **습식·건식 추가 (어바웃펫 ID)**: CSV 12종 — 웰니스 코어 플레이크 참치&새우, 보레알·로우즈 그레이비, 쉬바 무스 2종, 오리젠 캣 키튼, 퓨리나 팬시피스트·프로플랜 키튼(건), 뉴트리플랜 모이스트루 키튼 파우치, 아카나 키튼 청크 캔, 브릿 키튼 파우치. 공식·KR 등록성분 반영(쉬바 무스·뉴트리플랜·브릿 습식은 ME 미표기 제품으로 성분 기반 추정).
- **키튼 사료 (어바웃펫 ID)**: CSV 9종 — 이즈칸 퍼포먼스·now·블랙우드·하림 밥이보약(건), 브릿·위스카스·레오나르도·웰니스·쓰라이브(습). 구 `163` 밥이보약 탄탄한 성장 → `GP251100696` 교체. 이즈칸·위스카스 습식·하림 건식은 ME 미표기로 성분 기반 추정.
- **습식·건식 추가 2 (어바웃펫 ID)**: CSV 6종 — 쉬바 참치·참치&게살·참치&고등어 파우치, 스텔라앤츄이스 크레이빙스 2종, 레오나르도 순수생육 연어(건). 쉬바 파우치는 ME 미표기로 동일 라인 기준 추정, 스텔라·레오나르도는 공식 ME 반영.
- **`feedDetailLabels`**: `senior_11y_plus`·`senior_15y_plus` 라이프스테이지 라벨 추가.
- **`FeedDetailView`**: 성분 데이터 있을 때 등록성분량·원재료 카드 렌더.
- **`next.config.ts`**: `images.qualities` `[58, 62, 64, 68, 72]` — Next.js 16 대비·dev issue 경고 완화.

### Info guides (정보 가이드)

- **`/feeding-guide`**: 고양이 급여 가이드 — 급여량·칼로리·건습식·간식·조정 방법 안내, 계산기 CTA.
- **`/calorie-guide`**: 고양이 칼로리 가이드 — 100g당 kcal·건습식 차이·간식·재계산 시점 안내, 계산기 CTA.
- **`InfoGuidePage`**: 375px 모바일 레이아웃, 내부 링크(가이드·계산기·사료 찾기), Article JSON-LD.
- **메뉴·푸터**: 가이드 경로를 `/feeding-guide`, `/calorie-guide`로 연결.
- **Sitemap**: 두 가이드 URL 추가.

### Site footer

- **`SiteFooter`**: 홈·SEO 랜딩 하단 `2026 우리냥이맘마. All rights reserved.` + 바로가기 링크(급여 가이드·칼로리 가이드·급여량 계산하기·사료 찾기).

### UI (공통 헤더)

- **`WizardHeader`**: 피그마 시안 기준 전 페이지(홈·step1~3·result) 공통 헤더 — 좌 `Ic_Menu` 메뉴, 중앙 로고, 우측 액션(결과 화면 이미지 저장) 또는 균형 스페이서. `padding: 16px 24px`, 배경 투명.
- **`wizardHeaderOffsetClass`**: safe-area + 헤더 높이 + 8px 본문 상단 여백.
- **Asset**: `public/design-resource/icon/Ic_Menu.svg` 추가.

### UX (Step3)

- 추가된 사료 **칩 탭** 시 g·회·사료명을 입력란에 불러와 **수정** 버튼으로 급여량 갱신. 편집 중 칩 링 표시, 재탭 시 선택 해제.

### SEO (서비스 확장 후 구조 개선)

- **`seo.ts`**: 글로벌 메타 `우리냥이맘마` 브랜드 통일, 키워드 확장, `title: { absolute }`로 중복 접미사 방지, OG 80자 fallback(`NAVER_OG_DESCRIPTION`), WebPage JSON-LD 헬퍼, WebApplication 설명 강화.
- **홈(`/`)**: 계산기 검색 의도 메타(title/description), SEO H2 5개 재구성, `SeoInternalLinksSection` 내부 링크.
- **`/feed-find`**: 사료 찾기 메타·H1 인트로·관련 링크, WebPage JSON-LD.
- **`/foods/[id]`**: 동적 메타(우리냥이맘마), H1 브랜드+제품명, CTA·관련 가이드 링크, WebPage JSON-LD.
- **가이드(`/feeding-guide`, `/calorie-guide`)**: 검색 의도별 title/description·keywords, CTA 문구 정리.
- **`sitemap.ts`**: `/feed-find` 및 CSV 사료 상세 198개 URL 추가.
- **`seoInternalLinks.ts`**, **`SeoInternalLinksSection.tsx`**, **`FeedFindSeoIntro.tsx`**: 페이지 간 내부 링크 공통화.

### SEO (Naver·Google)

- **Meta description** (`src/lib/seo.ts`, `page.tsx`): 사이트·OG·Twitter description을 80자 이내 문구로 통일 (`고양이 체중·활동량·사료 칼로리로 하루 급여량을 계산해보세요.`). 홈이 긴 description으로 덮어쓰지 않도록 `DEFAULT_DESCRIPTION` 공유.

### SEO (Google)

- **Home** (`src/app/page.tsx`): 계산 카드 아래에 **SEO 가이드 섹션(H2 5개)** + 내부 링크 추가(고정 CTA는 유지, 하단 겹침 문구 제거).
- **Landing**: 검색 의도형 한국어 랜딩 페이지 8개 추가(고유 메타/본문/H1/H2, 계산기(`/step1`)로 링크).
- **Sitemap** (`src/app/sitemap.ts`): 랜딩 경로를 `seoLandingPages.ts`에서 생성한 목록으로 관리해 누락 방지.
- **Copy polish**: 홈 SEO 타이틀 하단 안내 문구를 새 카피로 교체하고 중요 문구 색상 강조 + 문장 시작 2px 들여쓰기 적용.
- **FAQ UI** (`src/components/seo/SeoFaqSection.tsx`): 질문/답변 앞머리에 `Q.` / `A.` 프리픽스 추가.
- **Hierarchy tune** (`src/components/seo/HomeSeoGuideSection.tsx`): 카드 아래 SEO 안내 영역 타이포를 FAQ 섹션 위계와 맞추도록 제목/본문 크기·행간·여백 상향 조정.
- **Home SEO copy** (`HomeSeoGuideSection.tsx`): 급여량 계산 안내 문구 수정(급여 그램·우리 아이 급여량 기준). 홈 SEO 섹션 내부 랜딩 링크 전부 제거.

### UX (Search input)

- **Step1/Step3** (`src/app/step1/page.tsx`, `src/app/step3/page.tsx`): 검색 입력창에서 Enter 키로도 검색 모달이 열리도록 키보드 동작 추가.

### Performance (home LCP)

- **Home carousel**: `HomeCardCarouselLazy`로 마퀴 클라이언트 번들 지연 로드.
- **Below-fold**: `HomePageBelowFold` + `content-visibility`로 SEO·FAQ paint 비용 완화.
- **Prefetch**: 홈·랜딩 내부 링크 `prefetch={false}`로 초기 네트워크 부담 감소.
- **Assets/scripts**: 배경·로고 우선순위 조정, AdSense `afterInteractive` 로드, `html-to-image` import 최적화.

### Performance (Clarity CLS·INP)

- **CLS**: `HomePageBelowFold`의 `content-visibility` 제거 — 스크롤 시 intrinsic size 불일치로 발생하던 레이아웃 이동 완화.
- **CLS**: 홈 히어로 `h1` `min-h-[147px]`로 타이틀 영역 높이 예약.
- **CLS**: `HomeCardCarouselLazy` SSR 활성화 — hydration 전후 캐러셀 영역 안정화.
- **CLS**: Pretendard `adjustFontFallback: "Arial"` — 폰트 swap 시 텍스트 reflow 완화.
- **CLS·INP**: `/feed-find` 로딩 시 스켈레톤 UI(`FeedFindSkeletons`) + 필터 칩 즉시 표시, `startTransition`으로 필터·검색 업데이트.
- **INP**: AdSense 스크립트 `lazyOnload`로 변경 — 상호작용 구간 main thread 부담 감소.

### Performance (페이지 전환·로딩)

- **`WizardShellBackground`**: 루트 레이아웃에 위저드 배경 단일 인스턴스 — 페이지별 `fixed` 배경 중복으로 이전 화면이 겹치던 현상 완화.
- **`ScrollToTopOnNavigate`**: 라우트 변경 시 스크롤 초기화.
- **body** 배경 `#fffcf9` — 배경 WebP 로드 전 흰 깜빡임 완화.
- **Home carousel**: `HomeCardCarouselLazy` `ssr: false` 복원 — 초기 hydration 부담·전환 지연 감소.
- **`/feed-find`**: `getFeedCatalogItems` 서버 preload — 클라이언트 fetch·스켈레톤 전환 없이 목록 즉시 표시.
- **`useRequireWizardStep`**: `useLayoutEffect` + 렌더 차단 — step2/3 잘못된 화면 한 프레임 노출 방지.
- **`feedCatalogServer.ts`**: `/api/feeds`와 카탈로그 로드 로직 공용화.

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

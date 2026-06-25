# Changelog

## 2026-06-05

### 건식 브랜드 급여 가이드 참고값

- `cat_food.csv`에 `guide_daily_g`, `guide_weight_kg` 컬럼 추가 — 건식은 제조사 급여표 기준 **하루 권장 그램**·**기준 체중(kg)**.
- 습식 `serving_g`는 1팩 용량 유지. 상세 페이지 카드 라벨을 유형별로 분리(습식 「1팩·1캔 기준」, 건식 「브랜드 급여 가이드」).
- 일괄 채우기: `npm run feed-guides:fill` — 로얄캐닌(공식몰 급여표)·힐스(hillspet.co.kr) 스크래핑 후 CSV 반영. `--dry-run`, `--brand=로얄캐닌`, `--force` 지원.
- 로얄캐닌 retail: probe 확인 slug·CSV id 매핑(`feedServingGuideRoyalCanin.ts`), 급여표 파서(헤더열·체중범위·키튼 월령·vet 표) 보강.
- 로얄캐닌 처방식(vet): `<th/>` 빈 열 파싱·숫자-only g 셀·세타이어티 유지 단계 표 지원. 하이포/아날러제닉 5g 오입력 수정, GI 파이버·세타이어티 등 미채움 15종 보강.
- 로얄캐닌 retail 잔여 8종: slug 발견(`sterilised-37-2537`, `ageing-15+-8075`, `aroma/protein-exigent-2543/2542` 등), 전치형·FUSSY·키튼 월령범위 파서 추가. **로얄캐닌 건식 41/41종 전량 채움.**
- 로얄캐닌 vet 스크래핑: locale 순서 `kr` 우선·fetch 재시도(403/429·빈 응답)로 네트워크 오류 시 스킵되던 처방 건식 12종 캐시 복구. 습식 전용 slug 3건(`renal-1246`, `urinary-so-1254`, `gastrointestinal-4039`)은 정상 스킵.

## 2026-06-24

### 사료 상세페이지 위계 정리

- 중복 제거: 배지와 겹치던 InfoCard(유형·연령)·화면용 seoDescription·관련 사료 4중 섹션 삭제. SEO부스트 있을 때 추천 대상 칩 숨김.
- 위계: 핵심 수치(칼로리·급여) → CTA → 사료 안내/추천 → 성분(해석 포함) → 관련 사료(라벨) → FAQ.
- 관련 사료 통합 목록에 `같은 브랜드`·`비슷한 칼로리` 등 출처 라벨 표시.

### 사료 찾기 빈 결과 CTA 문구 단순화

- 검색어 없을 때와 동일하게 **「사료 추가 요청하기」** 고정 — `「키워드」` 특수문자 제거.

### SEO 부스트 섹션 AI 아이콘

- 파일럿 3개 섹션 제목에 아이콘·`AI` 배지 — OpenAI 12건(스파클+배지), 규칙 기반 60건(회색 아이콘).
- `feedSeoBoost.json`에 `source: openai | rule` 메타데이터 동기화.

### SEO 부스트 OpenAI 12건 부분 반영

- 파일럿 72건 중 **12건** OpenAI(`gpt-4o-mini`) 콘텐츠로 갱신, 나머지 60건은 규칙 기반 유지.
- 생성기: `feedingNotes` 길이 자동 보정, API 속도 제한 대기·429 재시도, OpenAI 완료분만 스킵.

### SEO 부스트 콘텐츠 72건 생성·배포

- OpenAI 키 없이 **규칙 기반 생성기**(`feedSeoBoostRules.ts`)로 파일럿 72건 콘텐츠 생성 — `prisma/feedSeoBoost.json` `contents` 반영.
- `OPENAI_API_KEY` 설정 시 OpenAI 우선, 미설정 시 규칙 기반 자동 폴백.

### SEO 부스트 파일럿 대상 72건 등록

- **GSC 노출 상위** 10 URL + **아보덤 85g 3종** + **로얄캐닌 전체 63종** → `prisma/feedSeoBoost.json` `pilotFeedApiIds` 72건.
- 파일럿 상한 20 → **100**, 일괄 등록 스크립트 `npm run seo-boost:register` 추가.
- OpenAI 콘텐츠는 `npm run seo-boost:generate`로 별도 생성(아직 `contents` 비어 있음).

## 2026-06-06

### SEO 부스트 파일럿 (OpenAI + DB, 상위 20개)

- **대상**: GSC 조회수 상위 사료 최대 20개 — `/admin/seo-boost`에서 `feedApiId` 지정·일괄 생성.
- **추가 섹션**: 「이 사료는 이런 고양이에게 추천해요」「급여 전 참고할 점」「비슷한 사료와 비교 포인트」— OpenAI 생성 후 DB·`prisma/feedSeoBoost.json` 저장, 상세 페이지는 빌드 캐시만 사용(런타임 API 호출 없음).
- **CLI**: `npm run seo-boost:generate` (`--force`, `--id=36,37`). 빌드 시 `npm run seo-boost:sync`로 DB→JSON 동기화.
- **환경 변수**: `OPENAI_API_KEY`, `ADMIN_SECRET`, 선택 `OPENAI_MODEL`.

### 사료 상세페이지 SEO 강화

- **고유 설명**: 사료명·kcal·라이프스테이지·주요 원료 기반 150~300자 설명(`feedDetailSeo.ts`) — meta description·JSON-LD·본문 노출.
- **추천 대상**: 실내묘·중성화묘·체중관리·키튼·노령묘 등 condition·lifeStage·제품명 키워드 태그.
- **관련 사료**: 같은 브랜드·목적·연령·칼로리 내부링크 4~8개(`getRelatedFeedsByPurpose`, `buildFeedRelatedInternalLinks`).
- **FAQ**: 급여 개월·체중 관리·100g당 kcal 등 자동 생성 + FAQPage JSON-LD.

### 펫프렌즈 요세라 요시캣 키튼 1.9kg 등록

- **[펫프렌즈 요시캣 키튼 1.9kg](https://m.pet-friends.co.kr/product/detail/207950?productId=207950)** (`PF207950`): 펫프렌즈 상품 속성(attr10·attr11) 원재료·등록성분 반영. ME 3,966 kcal/kg는 [Josera 공식](https://www.josera.de/josicat-kitten.html) 기준(397 kcal/100g).
- **스크립트**: `petfriends-scraped.json`, `apply-petfriends-csv.mjs` 추가.

### 레거시 25건·kcal 오입력 3건 상세 보강

- **쓰라이브** 6건(id `185`–`187`, `189`, `191`, `192`): [vetsend.co.uk](https://www.vetsend.co.uk/thrive-complete-cat-food) Complete 라인 Composition·GA. id `192`는 [thrivepetfoods.com.au](https://www.thrivepetfoods.com.au/ocean-fish/) Ocean Fish 매핑.
- **오리젠** 5건(id `51`–`55`): [orijenpetfoods.com](https://www.orijenpetfoods.com) US·UK 공식 GA·원재료. id `55` 습식은 Original Entrée.
- **퍼시캣** 5건(id `56`–`60`): 국내 퍼시캣 = [Fussie Cat](https://fussiecat.com) Market Fresh·Fine Dining Pâté. id `58`·`59`는 인도어·체중관리 전용 SKU 없어 근접 레시피 매핑.
- **요라** id `147`: [yorapets.com](https://yorapets.com/uk/cat-food/insect-protein-adult-dry-cat-food/) 인섹트 프로틴 GA.
- **SUMMIT** 2건(id `149`, `150`): [summitpetfood.com](https://summitpetfood.com) Range Rotisserie·Meadow Roast.
- **아보덤** id `184`: [avodermnatural.com](https://avodermnatural.com/products/chicken-herring-meal-formula/) 치킨&헤링 밀.
- **아미오** 4건(id `176`, `179`–`181`): 단종 SKU·풀무원몰 미게재. 건강담은·자연담은·그레인프리 현행 라벨 근사.
- **레시피브이 인도어 C** id `10786596088`: 공식몰 미게재. [다이어트캣](https://recipe-v.co.kr/cat/functional/diet/) 저칼로리 레시피 근사, kcal 312.5 유지.
- **kcal 오입력** 3건: `GI251060046`·`GI251059523` → 335, `GI251119612` → 330.
- **스크립트**: `remaining-details-scraped.json`, `apply-remaining-details-csv.mjs` 추가.

### 프린세스·레오나르도·아카나 레거시 21건 원재료·등록성분 보강

- **프린세스** 8건(id `132`–`139`): [petprinces.com](https://petprinces.com) 엑설런스 라인 Composition·Analytical constituents 기준. 헤어볼(id `139`)은 FOS·셀룰로오스 Gold 라인([dogsworld.com.cy](https://dogsworld.com.cy)) 참고.
- **레오나르도** 7건(id `140`–`146`): [leonardo-catfood.com](https://www.leonardo-catfood.com) Composition·Analytical constituents 기준.
- **아카나** 6건(id `21`, `25`–`29`): 건식 4건 [acana.com](https://www.acana.com) US·[alaskamillandfeed.com](https://alaskamillandfeed.com) GA, 습식 2건 [vetsend.co.uk](https://www.vetsend.co.uk/acana-premium-pate) Premium Pâté 기준. id `26` 라이트 앤 피트는 공식 고양이 SKU 없어 체중관리용 Highest Protein Indoor 레시피로 매핑.
- **스크립트**: `legacy-wet-dry-scraped.json`, `apply-legacy-wet-dry-csv.mjs` 추가.

### 힐스 10종 원재료 보강

- `HP1584-ADT-UR-HB`·`HP6800-ADT-PW`·`HP1584-ADT-HB`·`HP1584-ADT-HB-LGT`·`HP1810-KD-FISH` 5건: [hillspet.co.kr](https://www.hillspet.co.kr/cat-food) 성분 아코디언 재파싱.
- `HP-WET-AD`·`HP-WET-KD-PATE`·`HP-WET-GI-STEW`·`HP-WET-GI-STRESS-STEW`·`HP-WET-SNR7-STEW` 5건: KR 페이지 원재료 미표기 → 레거시·[hillspet.com](https://www.hillspet.com) 영문 성분 한글화.
- **스크립트**: `apply-hills-ingredients-csv.mjs`, `scrape-hills.mjs` 성분 파서(급여 안내 문구 필터) 개선.

### 로얄캐닌 처방식 17종 등록성분 보강

- 레거시 id `73`–`89` 처방식 17건: KR 페이지에 등록성분 미표기 → [로얄캐닌 UK vet](https://www.royalcanin.com/uk/cats/products/vet-products) Analytical constituents 기준 단백질·조지방·조섬유·조회분 등 반영.
- **스크립트**: `scrape-royalcanin-vet.mjs` UK fallback·영문 성분 파서 추가.

### 쿠팡 CA코리아 뉴블루캣 15kg 등록

- **[쿠팡 뉴블루캣 15kg](https://www.coupang.com/vp/products/1288790820)** (`CP1288790820`): [다나와](https://prod.danawa.com/info/?pcode=7573558) 등록성분·단백질원(닭고기·쌀·옥수수) 반영. ME 미표기로 성분 기반 추정(315 kcal/100g).
- **스크립트**: `coupang-scraped.json`, `apply-coupang-csv.mjs` 추가.

### 어바웃펫 쓰라이브·퍼시캣 SKU 10종 상세 보강

- **[어바웃펫](https://aboutpet.co.kr)** 상품 상세 이미지 기준: 쓰라이브 컴플리트 그레인프리 캔·프리미엄 플러스 건식, 퍼시캣 프리미엄 참치&실꼬리돔 원재료·등록성분·kcal 반영.
- **레거시** 3종(id `188`, `190`, `193`): 그레인프리 컴플리트 캔 75g 라인으로 in-place 갱신.
- **신규·갱신** GP/GS id 9건 append·GP251028759 보정(아보덤 GP251025416은 기등록).
- **스크립트**: `scrape-aboutpet.mjs`, `apply-aboutpet-csv.mjs`, `aboutpet-scraped.json` 추가.

### 풀무원몰 아미오 고양이 주식 14종 상세 보강

- **[풀무원몰 고양이 주식](https://shop.pulmuone.co.kr/shop/goodsList?itemId=5736)** 카테고리 14종: 상품 상세 이미지(등록성분·원재료) 기준 반영. API `nutrition` 필드는 비어 있어 `detailDescription` BOS 라벨 이미지에서 추출.
- **레거시** 5종(id `173`–`175`, `177`–`178`): 자연담은·건강담은·그레인프리 라인 원재료·등록성분·kcal in-place 갱신.
- **신규** 9종(id `PM43259` 등): 날씬하냥·시원하냥, 건강담은 헤어볼·유리너리(6.4/1.8kg), 자연담은 1.8kg SKU append.
- **스크립트**: `scrape-pulmuone.mjs`, `apply-pulmuone-amio-csv.mjs`, `pulmuone-amio-scraped.json` 추가.

### 힐스·퓨리나·캐츠랑 레거시 상세 보강

- **힐스** 22종(id `11`–`20`, `61`–`72`): [hillspet.co.kr](https://www.hillspet.co.kr) Science Diet·Prescription Diet 공식 slug 매핑. 헤어볼·k/d 캔·a/d 등 원재료 미표기 페이지는 동일 라인 HP SKU·공식 US 성분으로 보완.
- **퓨리나** 10종(id `36`–`44`, `148`): [Purina CA](https://www.purina.ca) ONE·Fancy Feast 및 글로벌 라벨 기준 원재료·등록성분·ME 반영.
- **캐츠랑** 12종(id `151`–`162`): 기존 `DJ*`·`GI*`·`PI*` SKU 및 코스트코·SSG 고메디쉬 라인 성분 매핑. 습식 파우치는 저요저요·고메디쉬 레시피 기준 추정.
- **스크립트**: `scrape-hills-legacy.mjs`, `apply-hills-legacy-csv.mjs`, `hills-legacy-scraped.json`, `purina-scraped.json`, `apply-purina-csv.mjs`, `catsrang-legacy-scraped.json`, `apply-catsrang-legacy-csv.mjs` 추가.

### 지위픽·로우즈·알모네이처 레거시 상세 보강

- **지위픽** 10종(id `90`–`99`): [ZIWI US](https://us.ziwipets.com) 에어드라이·캔 공식 페이지 원재료·등록성분·ME 반영(건식 kcal 공식값 기준 갱신).
- **로우즈** 17종(id `30`–`35`, `100`–`110`): [RAWZ](https://rawznaturalpetfood.com) 96% 파테·슈레드·키튼·시니어 공식 페이지. 비프 파테·인도어는 US 미판매 SKU → `beef-and-beef-liver-cat-food`, `immune-support-chicken-chicken-liver-cat-food`로 대체.
- **알모네이처** 18종(id `45`–`50`, `120`–`131`): [Almo Nature](https://www.almonature.com) HFC·Daily·Legend(en-us)·Complete 공식 코드 매핑. 롱제비티 2종(id `122`–`123`)은 공식 건식 레시피 성분만 반영(kcal·ME는 습식 CSV 추정값 유지).
- **스크립트**: `scrape-ziwi.mjs`, `scrape-rawz.mjs`, `scrape-almo.mjs` 및 각 `apply-*-csv.mjs`, `*-scraped.json` 추가.

### 유한양행 레시피브이 반려묘 13종 상세 보강

- **[레시피브이 공식몰](https://recipe-v.co.kr/cat/prescription/)** 처방식·기능성·연령별·코숏 묘종 페이지 제품 상세 이미지 기준 id `9993727576` 등 13건 원재료·등록성분·ME 반영. 인도어 C(id `10786596088`)는 공식몰 미게재로 kcal만 유지.
- **스크립트**: `scripts/scrape-recipev.mjs`, `scripts/apply-recipev-csv.mjs`, `scripts/recipev-scraped.json` 추가.

## 2026-06-05

### 로얄캐닌 처방식 17종 상세 보강

- **[로얄캐닌 KR 고양이 처방식](https://www.royalcanin.com/kr/cats/products/vet-products)** 공식 페이지 기준 레거시 id `73`–`89` 17건 원재료·칼로리 반영. 건식은 `density`→kcal/100g, 습식 파우치는 대사에너지·85g 기준.
- **등록성분**: KR 처방식 건식 페이지에 % 미표기 — 유리너리 파우치(id `79`)만 등록성분 보강. 아날러제닉·뉴터드 세타이어티 밸런스는 UK 폴백 대신 KR 페이지 한글 원재료로 정정.
- **스크립트**: `scripts/scrape-royalcanin-vet.mjs`, `scripts/apply-rc-vet-csv.mjs`, `scripts/rc-vet-scraped.json` 추가.

## 2026-06-04

### Google AdSense — 사이트 검토용 head 스크립트

- **`layout.tsx`**: AdSense 스크립트를 루트 `<head>`에 네이티브 `<script async>`로 단일 삽입(body `lazyOnload` 제거). Google 사이트 검토·전 페이지 로드 대응.
- **`googleAdSense.ts`**: Publisher ID `ca-pub-7804546387826763` — SEO `metadata`·GA·Clarity와 분리 유지.

### Google SEO — 메타·롱테일·내부링크

- **메타 title·description**: 메인·사료 찾기·급여/칼로리 가이드 클릭 지향 문구로 개선.
- **롱테일 랜딩 3페이지**: `/고양이-5kg-사료량`, `/고양이-건식-습식-급여량`, `/고양이-사료-바꿀때-급여량` — H1·H2·FAQ·계산기·가이드 내부링크.
- **사료 상세**: H1 `{brand} {name} 칼로리 정보`, 칼로리·급여 H2, metadata·JSON-LD headline 보강.
- **`seoInternalLinks.ts`**: 계산기·가이드·롱테일 허브 링크 확장. sitemap 자동 반영(349 URL).

### Food Search — 검색·필터·no-result

- **`feedSearchNormalize.ts`**: 한글 키워드 정규화(건식·전연령·치킨 등), 붙여 쓴 검색어 토큰 분리.
- **`feedSearchUtils.ts`**: brand·ingredients 등 확장 검색, 유사 결과 추천, no-result CTA·「전체 사료 보기」.
- **칩 필터**: `전연령` 추가. `buildFeedRequestHref()` — 검색어 CTA 표시(Google Form prefill TODO).

### Stability — Food Search·Detail

- **`feedSafeValues.ts`**: `safeString`·`safeNumber` 등 optional 필드 방어.
- **검색·필터·상세·slug**: null/undefined·NaN 크래시 방지, 404·error boundary(`/feed-find`, `/foods/[slug]`).

### SEO — 이미지 alt 속성

- **`imageAlt.ts`**: 공통 alt 상수·`bcsIconAlt`·`resultHeroAlt`·`featureIconAlt` 헬퍼 추가.
- **`displayTextSvg.ts`**: SVG 타이틀·버튼·카드에 `alt` 필드 정의.
- **전 페이지·컴포넌트**: 홈·step1~3·result·feed-find 등 `<Image>`/`<img>` 빈 `alt=""` → 의미 있는 설명으로 교체(SEO 검사 대응).

### Feed catalog (사료 CSV)

- **하림펫푸드 밥이보약·더리얼 캣** (공식몰 기준): [걱정없는 헤어볼 2kg](https://harimpetfood.com/product/%EB%B0%A5%EC%9D%B4%EB%B3%B4%EC%95%BD-cat-%EA%B1%B1%EC%A0%95%EC%97%86%EB%8A%94-%ED%97%A4%EC%96%B4%EB%B3%BC-2kg-%EC%9C%A0%ED%86%B5%EA%B8%B0%ED%95%9C-261017/3052/)·[사료 모음](https://harimpetfood.com/product/%EB%8D%94%EB%A6%AC%EC%96%BC%EB%B0%A5%EC%9D%B4%EB%B3%B4%EC%95%BD-%EA%B3%A0%EC%96%91%EC%9D%B4-%EC%82%AC%EB%A3%8C-%EB%AA%A8%EC%9D%8C/1584/)·[크런치 1kg 모음](https://harimpetfood.com/product/%EB%B9%A0%EB%A5%B8%EB%B0%B0%EC%86%A1-%EB%8D%94%EB%A6%AC%EC%96%BC-%EC%BA%A3-%EA%B7%B8%EB%A0%88%EC%9D%B8%ED%94%84%EB%A6%AC-%ED%81%AC%EB%9F%B0%EC%B9%98-1kg-%EB%AA%A8%EC%9D%8C-%EB%8B%A8%EB%8F%85-%EA%B5%AC%EB%A7%A4-%EC%A0%84%EC%9A%A9/2002/) — 밥이보약 9종 원료·등록성분량 보강, 더리얼 캣 그레인프리 크런치 5.8kg·1kg 신규 10종, 기존 연어·오리·참치·대구 어덜트를 하림펫푸드 브랜드로 정정.
- **퓨어네이쳐 캣 치킨 2kg** (`CP7292214927`): 쿠팡 상품 기준 등록, [공식몰 캣 치킨](https://purenature.kr/product/%ED%93%A8%EC%96%B4%EB%84%A4%EC%9D%B4%EC%B3%90-%EC%BA%A3-%EC%B9%98%ED%82%A8-5kg/53/) 원료·등록성분량·ME 3,595 kcal/kg(360 kcal/100g) 반영.
- **하림펫푸드·대주펫푸드 2차** (공식몰·네이버 기준): [밥이보약 CAT 빛나는 피모 2kg](https://harimpetfood.com/product/%EB%B9%A0%EB%A5%B8%EB%B0%B0%EC%86%A1-%EB%B0%A5%EC%9D%B4%EB%B3%B4%EC%95%BD-cat-%EB%B9%9B%EB%82%98%EB%8A%94-%ED%94%BC%EB%AA%A8-2kg-%EB%8B%A8%EB%8F%85-%EA%B5%AC%EB%A7%A4-%EC%A0%84%EC%9A%A9/1974/) 기존 id `165` 제품명 정정, [오리지널 화식 5일 식단](https://harimpetfood.com/product/%EA%B3%A0%EC%96%91%EC%9D%B4-%EC%98%A4%EB%A6%AC%EC%A7%80%EB%84%90-%ED%99%94%EC%8B%9D-5%EC%9D%BC-%EC%8B%9D%EB%8B%A860g5%ED%8C%A9/1802/) 체중·피부·맛보기 3종(`HF1802-*`) 신규. 캐츠랑 키튼 8kg·웨이트케어 1.5kg·전연령 5kg·리브레 올라이프 2kg, 쉨잇 캣 동결건조 1.2kg, 세라피드 그레인프리 헤어볼·체중관리·요로 건강 2kg(`DJ*` 네이버 상품번호) 신규 8종. 화식·세라피드 ME 미표기는 성분·유사 제품 기준 추정.
- **힐스** ([hillspet.co.kr](https://www.hillspet.co.kr/) 공식몰 기준): 키튼 센서티브 스토막 & 스킨 연어 & 현미·유리너리 헤어볼 컨트롤·어덜트 7+ 헤어볼 컨트롤·퍼펙트 다이제스천·인도어 치킨 1.58kg 5종(`HP1584-*`) 신규. 유리너리 헤어볼은 공식 페이지 원재료 미표기로 성분만 등록.
- **힐스 추가 6종** ([c/d 멀티케어 스트레스](https://www.hillspet.co.kr/cat-food/prescription-diet-cd-multicare-stress-chicken-urinary-care-dry)·[GI 바이옴 스트레스](https://www.hillspet.co.kr/cat-food/prescription-diet-gastrointestinal-biome-stress-digestive-care-dry)·[c/d 멀티케어](https://www.hillspet.co.kr/cat-food/prescription-diet-cd-multicare-chicken-urinary-care-dry)·[i/d](https://www.hillspet.co.kr/cat-food/prescription-diet-id-digestive-care-dry)·[어덜트 인도어](https://www.hillspet.co.kr/cat-food/science-diet-adult-indoor-dry)·[c/d 멀티케어+메타볼릭](https://www.hillspet.co.kr/cat-food/prescription-diet-cd-multicare-metabolic-urinary-care-dry)): `HP1500-*`, `HP1810-*`, `HP1584-ADT-IND`, `HP2880-CD-META` 6건 신규. 공식 페이지 칼로리·원재료·건조물 기준 영양성분 반영.
- **힐스 사이언스 다이어트 5종 상세 보강** ([어덜트 11+ 치킨](https://www.hillspet.co.kr/cat-food/science-diet-senior-11-dry)·[어덜트 라이트](https://www.hillspet.co.kr/cat-food/science-diet-adult-light-dry)·[키튼 치킨](https://www.hillspet.co.kr/cat-food/science-diet-kitten-original-dry)·[퍼펙트 웨이트](https://www.hillspet.co.kr/cat-food/science-diet-adult-perfect-weight-dry)·[퍼펙트 다이제스천](https://www.hillspet.co.kr/cat-food/science-diet-adult-perfect-digestion-chicken-barley-whole-oats-recipe-dry)): `HP1584-SNR11-CHK`, `HP2000-ADT-LGT`, `HP1584-KTN-ORG`, `HP6800-ADT-PW`, `HP1584-ADT-PD` 신규. 공식몰 원재료·건조물 기준 등록성분·ME 반영(퍼펙트 웨이트·유리너리 헤어볼은 원재료 미표기).
- **힐스 공식몰 27종 추가** ([hillspet.co.kr/cat-food](https://www.hillspet.co.kr/cat-food) 목록 대조): 사이언스 다이어트 건식(어덜트 치킨·헤어볼·헤어볼 라이트·퍼펙트 다이제스천 연어·퍼펙트 웨이트 스튜 등)·프리스크립션 건식(GI 바이옴·k/d·t/d·w/d·y/d·z/d·메타볼릭)·습식/스튜(i/d·k/d·c/d 스트레스·GI·a/d·ONC 등) `HP1810-*`·`HP1500-*`·`HP-WET-*` 27건 신규. 공식 페이지 건조물 기준 등록성분·ME·캔 serving_g 반영(원재료 미표기 품목은 성분만).

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

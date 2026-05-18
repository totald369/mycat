import Image from "next/image";
import type { Metadata } from "next";
import { AppLogo } from "@/components/design/AppLogo";
import { HomeCardCarousel } from "@/components/design/HomeCardCarousel";
import { WizardPageBackground } from "@/components/design/WizardPageBackground";
import { DESIGN_RESOURCE_PX, designResource } from "@/components/design/designResourcePaths";
import { PawPrimaryLink } from "@/components/design/PawButton";
import { DISPLAY_BUTTON, DISPLAY_TITLE } from "@/constants/displayTextSvg";
import { wizardShellHomeClass } from "@/components/design/wizardLayoutClasses";
import { JsonLd } from "@/components/seo/JsonLd";
import { SeoFaqSection } from "@/components/seo/SeoFaqSection";
import {
  buildHomeJsonLdGraph,
  buildPageMetadata,
  HOME_FAQ,
} from "@/lib/seo";
import { SEO_LANDING_PAGES } from "@/lib/seoLandingPages";
import Link from "next/link";

export const metadata: Metadata = buildPageMetadata({
  title: "고양이 급여량 계산기 — 하루 사료량·칼로리",
  description:
    "고양이 체중·활동량·체형·건식·습식 사료·간식을 반영해 하루 적정 급여량과 칼로리를 무료로 계산하세요. 권장 칼로리 대비 급여 상태를 한눈에 확인합니다.",
  path: "/",
  keywords: ["고양이 급여량 계산기", "고양이 하루 사료량"],
});

export default function IntroPage() {
  const { w: iw, h: ih } = DESIGN_RESOURCE_PX.catImg;
  const catLogicalW = iw / 3;
  const catLogicalH = ih / 3;

  return (
    <>
      <JsonLd id="home-jsonld" data={buildHomeJsonLdGraph()} />
      <main className={wizardShellHomeClass}>
        <WizardPageBackground priority={false} quality={62} />

        <div className="relative flex h-full min-h-0 flex-col items-center overflow-hidden pt-12 pb-[calc(7.5rem+env(safe-area-inset-bottom,0px))]">
          <header className="flex w-full shrink-0 flex-col items-center px-4 min-[360px]:px-6">
            <div className="mb-1 flex w-full justify-center">
              <AppLogo />
            </div>

            <h1 className="w-full min-w-0 max-w-full text-center">
              <span className="sr-only">
                고양이 급여량 계산기 — 하루 사료량·칼로리 계산
              </span>
              <span className="flex items-end justify-center gap-1" aria-hidden>
                <Image
                  src={DISPLAY_TITLE.homeLine1Left.src}
                  alt=""
                  width={DISPLAY_TITLE.homeLine1Left.width}
                  height={DISPLAY_TITLE.homeLine1Left.height}
                  className="h-auto w-auto object-contain"
                  unoptimized
                  sizes="63px"
                  decoding="async"
                  fetchPriority="low"
                />
                <Image
                  src={designResource.catImg}
                  alt=""
                  width={iw}
                  height={ih}
                  className="shrink-0 object-contain"
                  style={{ width: catLogicalW, height: catLogicalH }}
                  priority
                  quality={82}
                  sizes={`${Math.ceil(catLogicalW)}px`}
                  fetchPriority="high"
                  decoding="async"
                />
                <Image
                  src={DISPLAY_TITLE.homeLine1Right.src}
                  alt=""
                  width={DISPLAY_TITLE.homeLine1Right.width}
                  height={DISPLAY_TITLE.homeLine1Right.height}
                  className="h-auto w-auto object-contain"
                  unoptimized
                  sizes="63px"
                  decoding="async"
                  fetchPriority="low"
                />
              </span>
              <Image
                src={DISPLAY_TITLE.homeLine2.src}
                alt=""
                width={DISPLAY_TITLE.homeLine2.width}
                height={DISPLAY_TITLE.homeLine2.height}
                className="mx-auto mt-1 h-auto w-auto max-w-full object-contain"
                unoptimized
                sizes="(max-width: 360px) 90vw, 237px"
                decoding="async"
                fetchPriority="low"
                aria-hidden
              />
            </h1>
            <p className="mt-4 text-center text-lg leading-[1.4] text-[#555]">
              사료, 활동량, 성별에 따라 다른 적정 칼로리!
              <br />
              간단한 정보입력으로 쉽게 계산해보세요.
            </p>
          </header>

          <div className="mt-6 flex min-h-0 w-full flex-1 flex-col justify-center">
            <HomeCardCarousel />
          </div>
        </div>

        <nav
          className="fixed bottom-0 left-0 right-0 z-20 overflow-x-clip overflow-y-visible bg-gradient-to-t from-white from-40% via-white/95 to-transparent px-3 pb-4 pt-10 min-[360px]:px-4"
          aria-label="계산 시작"
        >
          <div className="mx-auto w-full max-w-[min(100%,375px)] overflow-visible">
            <PawPrimaryLink href="/step1" labelSvg={DISPLAY_BUTTON.start}>
              계산하기♧
            </PawPrimaryLink>
          </div>
        </nav>
      </main>

      <aside
        className="sr-only"
        aria-label="고양이 급여량·칼로리 계산 안내"
      >
        <section aria-labelledby="seo-guide-title">
          <h2 id="seo-guide-title">고양이 사료 급여량 계산 가이드</h2>
          <p>
            고양이 칼로리 계산은 우리 아이의 건강을 지키는 기본입니다. 이
            고양이 급여량 계산기는 하루 사료량과 적정 급여량을 빠르게 확인할 수
            있도록 구성되어 있습니다.
          </p>

          <h3>고양이 하루 사료량은 어떻게 계산하나요?</h3>
          <p>
            현재 체중과 체형, 활동량, 성별 및 중성화 여부를 입력한 뒤 건식·습식
            사료와 간식량을 합산해 하루 총 섭취 칼로리를 계산합니다. 권장
            칼로리 대비 부족·과다 상태를 확인할 수 있습니다.
          </p>

          <h3>체중, 활동량, 중성화 여부가 왜 중요한가요?</h3>
          <p>
            같은 체중이라도 활동량이 높으면 필요 칼로리가 늘고, 중성화 여부에
            따라 에너지 요구량이 달라집니다. 고양이 사료 계산은 이 요소를 함께
            봐야 정확합니다.
          </p>

          <h3>고양이 적정 급여량을 맞춰야 하는 이유</h3>
          <p>
            급여량이 과하면 비만, 부족하면 영양 불균형 위험이 커집니다. 정기적인
            고양이 칼로리 계산으로 상태를 점검하세요.
          </p>

          <nav aria-label="급여량 가이드 링크">
            <h3>체중·상황별 급여 가이드</h3>
            <ul>
              {SEO_LANDING_PAGES.map((page) => (
                <li key={page.path}>
                  <Link href={page.path}>{page.h1}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </section>

        <SeoFaqSection faqs={HOME_FAQ} />
      </aside>
    </>
  );
}

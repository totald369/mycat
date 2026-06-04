import Image from "next/image";
import type { Metadata } from "next";
import { WizardHeader } from "@/components/design/WizardHeader";
import { DESIGN_RESOURCE_PX, designResource } from "@/components/design/designResourcePaths";
import { PawPrimaryLink } from "@/components/design/PawButton";
import { HomeCardCarouselLazy } from "@/components/home/HomeCardCarouselLazy";
import { HomePageBelowFold } from "@/components/home/HomePageBelowFold";
import { DISPLAY_BUTTON, DISPLAY_TITLE } from "@/constants/displayTextSvg";
import { IMAGE_ALT } from "@/constants/imageAlt";
import {
  wizardHeaderOffsetClass,
  wizardShellHomeClass,
} from "@/components/design/wizardLayoutClasses";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  buildHomeJsonLdGraph,
  buildPageMetadata,
} from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "고양이 사료, 하루에 얼마나 줘야 할까? | 우리냥이맘마 급여량 계산기",
  description:
    "우리 아이 사료량이 적당한지 궁금하다면 체중, 활동량, 체형, 사료 칼로리 기준으로 하루 급여량을 확인해보세요.",
  path: "/",
  keywords: ["고양이 급여량 계산기", "고양이 사료 급여량", "고양이 하루 사료 양"],
  ogDescription:
    "체중·활동량·사료 칼로리로 하루 급여량을 계산해보세요.",
});

export default function IntroPage() {
  const { w: iw, h: ih } = DESIGN_RESOURCE_PX.catImg;
  const catLogicalW = iw / 3;
  const catLogicalH = ih / 3;

  return (
    <>
      <JsonLd id="home-jsonld" data={buildHomeJsonLdGraph()} />
      <main className={wizardShellHomeClass}>
        <WizardHeader />

        <div
          className={`relative flex w-full flex-col items-center overflow-x-clip px-4 pb-4 ${wizardHeaderOffsetClass} min-[360px]:px-6`}
        >
          <header className="flex w-full shrink-0 flex-col items-center">
            <h1 className="w-full min-w-0 max-w-full text-center min-h-[147px]">
              <span className="sr-only">
                고양이 급여량 계산기 — 하루 사료량·칼로리 계산
              </span>
              <span className="flex items-end justify-center gap-1" aria-hidden>
                <Image
                  src={DISPLAY_TITLE.homeLine1Left.src}
                  alt={DISPLAY_TITLE.homeLine1Left.alt}
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
                  alt={IMAGE_ALT.catIllustration}
                  width={iw}
                  height={ih}
                  className="shrink-0 object-contain"
                  style={{ width: catLogicalW, height: catLogicalH }}
                  priority
                  quality={72}
                  sizes={`${Math.ceil(catLogicalW)}px`}
                  fetchPriority="high"
                  decoding="async"
                />
                <Image
                  src={DISPLAY_TITLE.homeLine1Right.src}
                  alt={DISPLAY_TITLE.homeLine1Right.alt}
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
                alt={DISPLAY_TITLE.homeLine2.alt}
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

          <div className="mt-6 w-full">
            <HomeCardCarouselLazy />
          </div>
        </div>

        <HomePageBelowFold />

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
    </>
  );
}

import Image from "next/image";
import { AppLogo } from "@/components/design/AppLogo";
import { HomeCardCarousel } from "@/components/design/HomeCardCarousel";
import { WizardPageBackground } from "@/components/design/WizardPageBackground";
import { DESIGN_RESOURCE_PX, designResource } from "@/components/design/designResourcePaths";
import { PawPrimaryLink } from "@/components/design/PawButton";

export default function IntroPage() {
  const { w: iw, h: ih } = DESIGN_RESOURCE_PX.catImg;
  /** @3x 에셋 → 피그마 1x 논리 크기 */
  const catLogicalW = iw / 3;
  const catLogicalH = ih / 3;

  return (
    <div className="relative z-10 mx-auto h-[100dvh] max-h-[100dvh] w-full max-w-[375px] overflow-hidden bg-transparent">
      <WizardPageBackground />

      <div className="relative flex h-full min-h-0 flex-col items-center overflow-hidden pt-12 pb-[calc(7.5rem+env(safe-area-inset-bottom,0px))]">
        <div className="flex w-full shrink-0 flex-col items-center px-6">
          {/* 피그마: 헤더 없음 — 로고만 타이틀 위 4px 간격·가운데 정렬 */}
          <div className="mb-1 flex w-full justify-center">
            <AppLogo />
          </div>

          <h1 className="text-center font-display text-[40px] leading-none text-[#111]">
            <span className="inline-flex items-end justify-center gap-1">
              <span>우리</span>
              <span className="inline-flex shrink-0 items-end leading-none">
                <Image
                  src={designResource.catImg}
                  alt="우리 냥이"
                  width={iw}
                  height={ih}
                  className="shrink-0 object-contain"
                  style={{
                    width: catLogicalW,
                    height: catLogicalH,
                  }}
                  priority
                  sizes={`${Math.ceil(catLogicalW)}px`}
                />
              </span>
              <span>에게</span>
            </span>
            <span className="mt-0 block pt-1">딱 맞는 칼로리를</span>
            <span className="block">계산해보세요</span>
          </h1>
          <p className="mt-4 text-center text-lg leading-[1.4] text-[#555]">
            사료, 활동량, 성별에 따라 다른 적정 칼로리!
            <br />
            간단한 정보입력으로 쉽게 계산해보세요.
          </p>
        </div>

        <div className="mt-6 flex min-h-0 w-full flex-1 flex-col justify-center">
          <HomeCardCarousel />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 overflow-x-clip overflow-y-visible bg-gradient-to-t from-white from-40% via-white/95 to-transparent px-[16px] pb-4 pt-10">
        <div className="mx-auto w-full max-w-[375px] overflow-visible">
          <PawPrimaryLink href="/step1">계산하기♧</PawPrimaryLink>
        </div>
      </div>
    </div>
  );
}

import Image from "next/image";
import { homeFigma } from "@/components/design/homeFigmaPaths";

/**
 * `Background.png`를 뷰포트 전체에 깔고, 콘텐츠는 상위 `relative z-10` 컬럼이 덮습니다.
 * PNG 알파·명도는 건드리지 않음.
 */
export function WizardPageBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <Image
        src={homeFigma.backgroundPng}
        alt=""
        fill
        className="object-cover object-center"
        sizes="100vw"
        priority={false}
      />
    </div>
  );
}

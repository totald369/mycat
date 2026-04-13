import Image from "next/image";
import { homeFigma } from "@/components/design/homeFigmaPaths";

/**
 * 풀스크린 배경(WebP). 위저드·홈 공통 LCP 후보이므로 기본 `priority`로 조기 로드.
 */
export function WizardPageBackground({
  priority = true,
}: {
  priority?: boolean;
} = {}) {
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
        priority={priority}
        fetchPriority={priority ? "high" : undefined}
      />
    </div>
  );
}

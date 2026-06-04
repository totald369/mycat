import Image from "next/image";
import { designResource } from "@/components/design/designResourcePaths";
import { IMAGE_ALT } from "@/constants/imageAlt";

/** `fullscreen`: 레이아웃 뷰포트 고정 배경 · `contain`: 부모 오버레이 안에만 덮음(계산 중 풀스크린 등) */
type WizardPageBackgroundPlacement = "fullscreen" | "contain";

/**
 * 풀스크린 배경(WebP). `priority`는 위저드·결과 등에서 유지, 홈은 false 권장(히어로·카드 LCP 우선).
 * `quality`는 전체 화면용이라 조금 낮춰 바이트·디코드 부담을 줄임(피크 가독성은 유지).
 */
export function WizardPageBackground({
  priority = true,
  quality = 68,
  placement = "fullscreen",
}: {
  priority?: boolean;
  /** 1–100, 기본값은 노이즈 거의 없이 용량만 줄인 값 */
  quality?: number;
  placement?: WizardPageBackgroundPlacement;
} = {}) {
  const wrapClass =
    placement === "contain"
      ? "pointer-events-none absolute inset-0 z-0 overflow-hidden"
      : "pointer-events-none fixed inset-0 z-0 overflow-hidden";

  return (
    <div className={wrapClass} aria-hidden>
      <Image
        src={designResource.background}
        alt={IMAGE_ALT.pageBackground}
        fill
        className="object-cover object-center"
        sizes="100vw"
        quality={quality}
        priority={priority}
        fetchPriority={priority ? "high" : "low"}
        loading={priority ? "eager" : "lazy"}
      />
    </div>
  );
}

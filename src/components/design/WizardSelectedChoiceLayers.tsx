import Image from "next/image";
import { designResource } from "@/components/design/designResourcePaths";

/**
 * 피그마: 브라운(#6f4425) fill + 선택 텍스처(WebP) 덮은 뒤 콘텐츠는 `relative z-10`.
 * 부모 버튼에 `relative overflow-hidden rounded-xl`(또는 동일 반경) 필요.
 */
export function WizardSelectedChoiceLayers() {
  return (
    <span
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit]"
      aria-hidden
    >
      <span className="absolute inset-0 bg-[#6f4425]" />
      <Image
        src={designResource.selectedChoiceTexture}
        alt=""
        fill
        className="object-cover object-center"
        sizes="200px"
      />
    </span>
  );
}

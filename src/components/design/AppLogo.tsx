import Link from "next/link";
import { designResource } from "@/components/design/designResourcePaths";

/** 피그마 로고 SVG 96×24 — 로컬 SVG는 `<img>`로 안정 표시 */
export function AppLogo() {
  return (
    <Link
      href="/"
      className="inline-flex shrink-0 rounded-sm outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-[#f8620c]/40"
      aria-label="홈으로 이동"
    >
      <img
        src={designResource.logo}
        alt=""
        width={96}
        height={24}
        className="h-6 w-[96px] object-contain object-center"
        draggable={false}
        decoding="async"
        fetchPriority="high"
        aria-hidden
      />
    </Link>
  );
}

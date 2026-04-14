import Image from "next/image";
import Link from "next/link";
import { designResource } from "@/components/design/designResourcePaths";

/** 피그마 로고 SVG 96×24 — `unoptimized`: SVG는 기본 최적화 대상 아님 */
export function AppLogo() {
  return (
    <Link
      href="/"
      className="inline-flex shrink-0 rounded-sm outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-[#f8620c]/40"
      aria-label="홈으로 이동"
    >
      <Image
        src={designResource.logo}
        alt="우리냥이 로고"
        width={96}
        height={24}
        unoptimized
        className="h-6 w-[96px] object-contain object-center"
        draggable={false}
        priority
      />
    </Link>
  );
}

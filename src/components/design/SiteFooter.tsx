import Link from "next/link";

import { INFO_GUIDE_INTERNAL_LINKS } from "@/lib/infoGuidePages";

export function SiteFooter({ className = "" }: { className?: string }) {
  return (
    <footer
      className={`mx-auto w-full max-w-[min(327px,100%)] border-t border-[#e8e4df] pt-8 text-center text-sm leading-relaxed text-[#888] ${className}`.trim()}
    >
      <nav aria-label="바로가기">
        <ul className="mb-6 flex flex-wrap justify-center gap-x-4 gap-y-2">
          {INFO_GUIDE_INTERNAL_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                prefetch={false}
                className="text-[#666] hover:text-[#f8620c]"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <p>2026 우리냥이맘마. All rights reserved.</p>
    </footer>
  );
}

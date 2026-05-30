import Link from "next/link";

import {
  relatedSeoLinks,
  type SeoInternalLink,
} from "@/lib/seoInternalLinks";

type Props = {
  currentPath: string;
  title?: string;
  links?: SeoInternalLink[];
  className?: string;
};

/** SEO용 내부 링크 블록 — 현재 페이지 제외 */
export function SeoInternalLinksSection({
  currentPath,
  title = "함께 보면 좋은 글",
  links,
  className = "",
}: Props) {
  const items = links ?? relatedSeoLinks(currentPath);
  if (items.length === 0) return null;

  const headingId = `seo-links-${currentPath.replace(/\//g, "-") || "home"}`;

  return (
    <section
      className={`space-y-3 ${className}`.trim()}
      aria-labelledby={headingId}
    >
      <h2
        id={headingId}
        className="text-base font-semibold leading-tight text-[#171717] min-[360px]:text-lg"
      >
        {title}
      </h2>
      <ul className="grid gap-2">
        {items.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              prefetch={false}
              className="block rounded-xl border border-[#eee] bg-white px-4 py-3 text-sm font-medium text-[#171717] active:bg-[#f5f1ed]"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

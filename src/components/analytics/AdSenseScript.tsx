"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { ADSENSE_SCRIPT_SRC } from "@/constants/googleAdSense";

/** 계산기·공유·관리 — noindex 구간은 AdSense 미로드(슬롯 없음, Script error 노이즈 감소) */
const ADSENSE_EXCLUDED_PREFIXES = [
  "/step",
  "/result",
  "/r/",
  "/admin",
] as const;

function shouldLoadAdSense(pathname: string | null): boolean {
  if (!pathname) return true;
  return !ADSENSE_EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function AdSenseScript() {
  const pathname = usePathname();

  useEffect(() => {
    if (!shouldLoadAdSense(pathname)) return;

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${ADSENSE_SCRIPT_SRC}"]`,
    );
    if (existing) return;

    const script = document.createElement("script");
    script.async = true;
    script.src = ADSENSE_SCRIPT_SRC;
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);
  }, [pathname]);

  return null;
}

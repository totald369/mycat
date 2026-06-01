"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";

/** 라우트 변경 시 스크롤 위치·겹침 잔상 완화 */
export function ScrollToTopOnNavigate() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** next/font 구 preload 파일명(*.p.woff2) → 현재(*.woff2) */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.endsWith(".p.woff2")) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = pathname.replace(/\.p\.woff2$/, ".woff2");
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: ["/_next/static/media/:path*.p.woff2"],
};

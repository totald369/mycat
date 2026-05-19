import type { Viewport } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { ADSENSE_SCRIPT_SRC } from "@/constants/googleAdSense";
import { GA_MEASUREMENT_ID } from "@/constants/googleAnalytics";
import { CLARITY_PROJECT_ID } from "@/constants/microsoftClarity";
import { buildRootMetadata } from "@/lib/seo";
import "./globals.css";

/** Pretendard subset woff2 — UI에 쓰는 굵기만 (피그마와 동일 스택, next/font로 FOIT 완화) */
const pretendard = localFont({
  src: [
    {
      path: "../fonts/pretendard/Pretendard-Regular.subset.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/pretendard/Pretendard-Medium.subset.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/pretendard/Pretendard-SemiBold.subset.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/pretendard/Pretendard-Bold.subset.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-pretendard",
  display: "swap",
  /** 여러 서브셋 preload는 초기 대역폭·우선순위 경쟁을 키움 — swap으로 시스템 폰트 먼저 표시 */
  preload: false,
  fallback: [
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Apple SD Gothic Neo",
    "Malgun Gothic",
    "sans-serif",
  ],
});

/** 최소 레이아웃 기준 320px 폭(논리 CSS px) — 모바일 퍼스트 대응 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f8f5f2",
};

export const metadata = buildRootMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <head>
        {/* Google AdSense — 사이트 전역 (검수·광고 게재용) */}
        <script async src={ADSENSE_SCRIPT_SRC} crossOrigin="anonymous" />
      </head>
      <body className="font-sans antialiased">
        {children}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="lazyOnload"
        />
        <Script id="gtag-init" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        <Script id="clarity-init" strategy="lazyOnload">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");
          `}
        </Script>
      </body>
    </html>
  );
}

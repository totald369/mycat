import type { Metadata } from "next";
import localFont from "next/font/local";
import { Noto_Sans_KR } from "next/font/google";
import Script from "next/script";
import { GA_MEASUREMENT_ID } from "@/constants/googleAnalytics";
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
  preload: true,
  fallback: [
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Apple SD Gothic Neo",
    "Malgun Gothic",
    "sans-serif",
  ],
});

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

/** Memoment Kkukkukk(꾹꾹체) — 피그마 디스플레이체 woff2 */
const memomentKkukkukk = localFont({
  src: "../fonts/MemomentKkukkukk.woff2",
  variable: "--font-display",
  weight: "400",
  style: "normal",
  display: "swap",
  preload: true,
  fallback: [
    "system-ui",
    "-apple-system",
    "Apple SD Gothic Neo",
    "Malgun Gothic",
    "sans-serif",
  ],
  adjustFontFallback: "Arial",
});

export const metadata: Metadata = {
  title: "냥이 칼로리 계산",
  description: "우리 냥이에게 딱 맞는 칼로리를 계산해보세요",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${pretendard.variable} ${notoSansKr.variable} ${memomentKkukkukk.variable}`}
    >
      <body className="font-sans antialiased">
        {children}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}

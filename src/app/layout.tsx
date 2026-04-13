import type { Metadata } from "next";
import localFont from "next/font/local";
import { Noto_Sans_KR } from "next/font/google";
import Script from "next/script";
import { GA_MEASUREMENT_ID } from "@/constants/googleAnalytics";
import { CLARITY_PROJECT_ID } from "@/constants/microsoftClarity";
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
  display: "optional",
  preload: false,
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
  metadataBase: new URL("https://meowdiet.com"),
  title: "우리냥이 | 고양이 사료 급여량 계산기",
  description:
    "고양이 체중, 활동량, 체형, 사료 정보를 바탕으로 하루 적정 급여량과 칼로리를 계산해보세요.",
  keywords: [
    "고양이 사료 급여량",
    "고양이 하루 사료 양",
    "고양이 칼로리 계산",
    "고양이 급여량 계산기",
  ],
  openGraph: {
    title: "우리냥이 | 고양이 사료 급여량 계산기",
    description: "고양이 체중 기반 사료 급여량 계산 서비스",
    url: "https://meowdiet.com",
    siteName: "우리냥이",
    images: [
      {
        url: "/og-brown.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "우리냥이 | 고양이 사료 급여량 계산기",
    description: "고양이 체중 기반 사료 급여량 계산",
    images: ["/og-brown.png"],
  },
  verification: {
    google: "8M9JJaFTVZbs-ZQzd7cpmI2luczjidpKkuS5sTO8nMg",
    other: {
      "naver-site-verification": "9930da34737f943a79ea16f2a702cad985fd0977",
    },
  },
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
        <Script id="clarity-init" strategy="afterInteractive">
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

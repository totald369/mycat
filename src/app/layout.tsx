import type { Metadata } from "next";
import localFont from "next/font/local";
import { Noto_Sans_KR } from "next/font/google";
import "pretendard/dist/web/static/pretendard-subset.css";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

/** 피그마 디스플레이체 — `src/fonts/MemomentKkukkukk.woff` */
const memomentKkukkukk = localFont({
  src: "../fonts/MemomentKkukkukk.woff",
  variable: "--font-display",
  weight: "400",
  style: "normal",
  display: "swap",
  adjustFontFallback: false,
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
      className={`${notoSansKr.variable} ${memomentKkukkukk.variable}`}
    >
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}

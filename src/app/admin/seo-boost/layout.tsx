import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SEO 부스트 파일럿 | 관리",
  robots: { index: false, follow: false },
};

export default function AdminSeoBoostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

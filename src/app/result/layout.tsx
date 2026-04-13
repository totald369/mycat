import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    canonical: "/result",
  },
};

export default function ResultLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}

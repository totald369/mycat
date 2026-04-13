import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    canonical: "/step1",
  },
};

export default function Step1Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}

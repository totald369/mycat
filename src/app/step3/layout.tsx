import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    canonical: "/step3",
  },
};

export default function Step3Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}

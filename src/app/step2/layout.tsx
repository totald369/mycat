import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    canonical: "/step2",
  },
};

export default function Step2Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}

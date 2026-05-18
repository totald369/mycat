import { buildWizardStepMetadata } from "@/lib/seo";

export const metadata = buildWizardStepMetadata(
  "result",
  "급여량 계산 결과",
);

export default function ResultLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}

import { buildWizardStepMetadata } from "@/lib/seo";

export const metadata = buildWizardStepMetadata(
  "step1",
  "기본 정보 입력",
);

export default function Step1Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}

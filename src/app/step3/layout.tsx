import { buildWizardStepMetadata } from "@/lib/seo";

export const metadata = buildWizardStepMetadata(
  "step3",
  "급여 사료 입력",
);

export default function Step3Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}

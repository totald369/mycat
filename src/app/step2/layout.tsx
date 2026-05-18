import { buildWizardStepMetadata } from "@/lib/seo";

export const metadata = buildWizardStepMetadata(
  "step2",
  "체형·활동량 입력",
);

export default function Step2Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  activityLevelFromStep2Label,
  bodyTypeFromStep2Bcs,
  genderOptionFromStep1Label,
  parseWeightKg,
} from "@/lib/calculator";
import { readWizardState } from "@/lib/wizardStorage";

export function isStep1Complete(): boolean {
  const s = readWizardState().step1;
  return (
    s.name.trim().length > 0 &&
    s.birthDate.trim().length > 0 &&
    genderOptionFromStep1Label(s.gender) != null &&
    parseWeightKg(s.weight) != null
  );
}

export function isStep2Complete(): boolean {
  const s = readWizardState().step2;
  return (
    bodyTypeFromStep2Bcs(s.bcs) != null &&
    activityLevelFromStep2Label(s.activity) != null
  );
}

/** 이전 단계 미완료 시 해당 단계로 보냄 (직접 URL 진입·뒤로가기 혼란 방지) */
export function useRequireWizardStep(step: 2 | 3): void {
  const router = useRouter();

  useEffect(() => {
    if (!isStep1Complete()) {
      router.replace("/step1");
      return;
    }
    if (step >= 3 && !isStep2Complete()) {
      router.replace("/step2");
    }
  }, [step, router]);
}

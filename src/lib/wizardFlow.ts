import { useRouter } from "next/navigation";
import { useLayoutEffect, useState } from "react";
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

/** 이전 단계 미완료 시 해당 단계로 보냄. 준비 전에는 false — 잘못된 화면 깜빡임 방지 */
export function useRequireWizardStep(step: 2 | 3): boolean {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    if (!isStep1Complete()) {
      router.replace("/step1");
      return;
    }
    if (step >= 3 && !isStep2Complete()) {
      router.replace("/step2");
      return;
    }
    setReady(true);
  }, [step, router]);

  return ready;
}

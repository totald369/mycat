const STORAGE_KEY = "mycat-wizard-v1";

export type Step1Persist = {
  name: string;
  birthDate: string;
  gender: string | null;
  weight: string;
  weightUnknown: boolean;
  breed: string;
};

export type Step2Persist = {
  bcs: string;
  activity: string;
};

export type Step3ChipPersist = {
  id: string;
  text: string;
  tone: "purple" | "peach";
};

export type Step3Persist = {
  search: string;
  grams: string;
  times: string;
  chips: Step3ChipPersist[];
  snack: string | null;
  nextTone: "purple" | "peach";
};

export type WizardPersistState = {
  step1: Step1Persist;
  step2: Step2Persist;
  step3: Step3Persist;
};

export const defaultStep1 = (): Step1Persist => ({
  name: "",
  birthDate: "",
  gender: null,
  weight: "",
  weightUnknown: false,
  breed: "",
});

export const defaultStep2 = (): Step2Persist => ({
  bcs: "정상",
  activity: "보통",
});

export const defaultStep3 = (): Step3Persist => ({
  search: "",
  grams: "10",
  times: "1",
  chips: [],
  snack: null,
  nextTone: "purple",
});

export function defaultWizardState(): WizardPersistState {
  return {
    step1: defaultStep1(),
    step2: defaultStep2(),
    step3: defaultStep3(),
  };
}

function isChip(x: unknown): x is Step3ChipPersist {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.text === "string" &&
    (o.tone === "purple" || o.tone === "peach")
  );
}

export function readWizardState(): WizardPersistState {
  const base = defaultWizardState();
  if (typeof window === "undefined") return base;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const p = JSON.parse(raw) as Partial<WizardPersistState>;
    const chipsRaw = p.step3?.chips;
    const chips = Array.isArray(chipsRaw)
      ? chipsRaw.filter(isChip)
      : base.step3.chips;
    return {
      step1: { ...base.step1, ...p.step1 },
      step2: { ...base.step2, ...p.step2 },
      step3: {
        ...base.step3,
        ...p.step3,
        chips,
        nextTone:
          p.step3?.nextTone === "peach" || p.step3?.nextTone === "purple"
            ? p.step3.nextTone
            : base.step3.nextTone,
      },
    };
  } catch {
    return base;
  }
}

export function writeWizardState(next: WizardPersistState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota */
  }
}

export function patchWizardState(
  patch: Partial<{
    step1: Partial<Step1Persist>;
    step2: Partial<Step2Persist>;
    step3: Partial<Step3Persist>;
  }>,
): void {
  const prev = readWizardState();
  const next: WizardPersistState = {
    step1: { ...prev.step1, ...patch.step1 },
    step2: { ...prev.step2, ...patch.step2 },
    step3: {
      ...prev.step3,
      ...patch.step3,
      chips: patch.step3?.chips ?? prev.step3.chips,
    },
  };
  writeWizardState(next);
}

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FieldLabel } from "@/components/design/FieldLabel";
import { PawPrimaryButton } from "@/components/design/PawButton";
import { WizardBottomBar } from "@/components/design/WizardBottomBar";
import { WizardHeader } from "@/components/design/WizardHeader";
import { WizardPageBackground } from "@/components/design/WizardPageBackground";
import { WizardSelectedChoiceLayers } from "@/components/design/WizardSelectedChoiceLayers";
import { WizardProgress } from "@/components/design/WizardProgress";
import { ValidationToast } from "@/components/design/ValidationToast";
import {
  wizardFormCardClass,
  wizardFormInnerClass,
  wizardContentWidthClass,
  wizardPageColumnClass,
  wizardShellClass,
} from "@/components/design/wizardLayoutClasses";
import {
  wizardChoiceClass,
  wizardChoiceSelectedClass,
  wizardInputClass,
  wizardInputInRowClass,
  wizardInputRowClass,
} from "@/components/design/wizardFieldClasses";
import { BreedSearchModal } from "@/components/wireframe/BreedSearchModal";
import { IconSearch } from "@/components/wireframe/icons";
import { parseWeightKg } from "@/lib/calculator";
import { patchWizardState, readWizardState } from "@/lib/wizardStorage";

const GENDER_OPTIONS = [
  "남",
  "남(중성화)",
  "여",
  "여(중성화)",
] as const;

function formatBirthDisplay(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${y}.${m}.${d}`;
}

export default function Step1Page() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<string | null>(null);
  const [weight, setWeight] = useState("");
  const [breed, setBreed] = useState("");
  const [breedModalOpen, setBreedModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const s = readWizardState().step1;
    setName(s.name);
    setBirthDate(s.birthDate);
    setGender(s.gender);
    setWeight(s.weight);
    setBreed(s.breed);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    patchWizardState({
      step1: {
        name,
        birthDate,
        gender,
        weight,
        breed,
      },
    });
  }, [
    hydrated,
    name,
    birthDate,
    gender,
    weight,
    breed,
  ]);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), 2200);
    return () => clearTimeout(timer);
  }, [error]);

  const { maxBirthDate, minBirthDate } = useMemo(() => {
    const ymd = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };
    const today = new Date();
    const oldest = new Date(today);
    oldest.setFullYear(oldest.getFullYear() - 40);
    return { maxBirthDate: ymd(today), minBirthDate: ymd(oldest) };
  }, []);

  const goNext = () => {
    setError(null);
    if (!name.trim()) {
      setError("이름을 입력해 주세요.");
      return;
    }
    if (!gender) {
      setError("성별 및 중성화 여부를 선택해 주세요.");
      return;
    }
    if (!weight.trim()) {
      setError("현재 체중을 입력해 주세요.");
      return;
    }
    if (parseWeightKg(weight) == null) {
      setError("현재 체중(kg)을 올바르게 입력해 주세요.");
      return;
    }
    router.push("/step2");
  };

  return (
    <>
      {error ? <ValidationToast message={error} /> : null}
      <div className={wizardShellClass}>
        <WizardPageBackground />
        <div className={wizardPageColumnClass}>
          <WizardHeader />
          <div className={wizardContentWidthClass}>
            <WizardProgress step={1} />
            <div>
              <h1 className="font-display text-[1.75rem] leading-none text-[#111] min-[360px]:text-[2rem]">
                Step 1 기본정보
              </h1>
              <p className="mt-2 text-base leading-[1.4] text-[#555]">
                우리 아이를 위한 최적의 영양 설계를 위해 기본정보를 입력해 주세요.
              </p>
            </div>
          </div>

          <div className={wizardFormCardClass}>
            <div className={wizardFormInnerClass}>
              <div>
                <FieldLabel required>이름</FieldLabel>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: 페퍼"
                  className={wizardInputClass}
                />
              </div>

              <div>
                <FieldLabel>생년월일</FieldLabel>
                <input
                  id="birth-date"
                  type="date"
                  value={birthDate}
                  min={minBirthDate}
                  max={maxBirthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  aria-label={
                    birthDate
                      ? `생년월일 ${formatBirthDisplay(birthDate)}`
                      : "생년월일 선택"
                  }
                  className={`${wizardInputClass} wf-birth-date-field block w-full`}
                />
              </div>

              <div>
                <FieldLabel required>성별 및 중성화 여부</FieldLabel>
                <div className="grid grid-cols-2 gap-1">
                  {GENDER_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setGender(opt)}
                      className={
                        gender === opt
                          ? wizardChoiceSelectedClass
                          : wizardChoiceClass
                      }
                    >
                      {gender === opt ? <WizardSelectedChoiceLayers /> : null}
                      <span className="relative z-10">{opt}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <FieldLabel required>현재 체중</FieldLabel>
                <div className="flex min-w-0 items-center gap-2 rounded-xl bg-[#f5f1ed] px-4 py-3">
                  <input
                    type="text"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="0.0"
                    inputMode="decimal"
                    className="min-w-0 flex-1 border-0 bg-transparent text-base text-[#111] placeholder:text-[#6b7280] focus:outline-none"
                  />
                  <span className="shrink-0 text-base font-bold text-[#111]">
                    Kg
                  </span>
                </div>
              </div>

              <div className="min-w-0">
                <FieldLabel>품종</FieldLabel>
                <div className={wizardInputRowClass}>
                  <input
                    type="text"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    placeholder="예: 샴, 브리티시 숏헤어..."
                    className={wizardInputInRowClass}
                  />
                  <button
                    type="button"
                    aria-label="품종 검색"
                    className="shrink-0 text-[#555]"
                    onClick={() => setBreedModalOpen(true)}
                  >
                    <IconSearch className="size-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <WizardBottomBar>
        <PawPrimaryButton onClick={goNext}>다음 ♧</PawPrimaryButton>
      </WizardBottomBar>

      <BreedSearchModal
        open={breedModalOpen}
        initialQuery={breed}
        onClose={() => setBreedModalOpen(false)}
        onSelect={setBreed}
      />
    </>
  );
}

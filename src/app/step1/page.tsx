"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FieldLabel } from "@/components/design/FieldLabel";
import { PawPrimaryButton } from "@/components/design/PawButton";
import { WizardBottomBar } from "@/components/design/WizardBottomBar";
import { WizardHeader } from "@/components/design/WizardHeader";
import { WizardPageBackground } from "@/components/design/WizardPageBackground";
import { WizardSelectedChoiceLayers } from "@/components/design/WizardSelectedChoiceLayers";
import { WizardProgress } from "@/components/design/WizardProgress";
import {
  wizardChoiceClass,
  wizardChoiceSelectedClass,
  wizardInputClass,
} from "@/components/design/wizardFieldClasses";
import { BreedSearchModal } from "@/components/wireframe/BreedSearchModal";
import { IconCalendar, IconSearch } from "@/components/wireframe/icons";
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
  const birthInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<string | null>(null);
  const [weight, setWeight] = useState("");
  const [weightUnknown, setWeightUnknown] = useState(false);
  const [breed, setBreed] = useState("");
  const [breedModalOpen, setBreedModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  /**
   * true: 정밀 포인터(마우스·트랙패드) — 투명 date 입력 히트레이어로 직접 피커.
   * false: 주로 터치 — 입력은 화면 밖 + 버튼 showPicker (모바일 네이티브 쉐브론 회피).
   * hover 조건을 넣으면 (hover:none) 데스크톱에서 레이어가 꺼져 달력이 안 뜰 수 있음.
   */
  const [birthHitLayer, setBirthHitLayer] = useState(false);

  useLayoutEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const sync = () => setBirthHitLayer(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const s = readWizardState().step1;
    setName(s.name);
    setBirthDate(s.birthDate);
    setGender(s.gender);
    setWeight(s.weight);
    setWeightUnknown(s.weightUnknown);
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
        weightUnknown,
        breed,
      },
    });
  }, [
    hydrated,
    name,
    birthDate,
    gender,
    weight,
    weightUnknown,
    breed,
  ]);

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

  const openBirthPicker = useCallback(() => {
    const el = birthInputRef.current;
    if (!el) return;
    try {
      el.showPicker?.();
    } catch {
      el.focus();
      el.click();
    }
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
    if (!weightUnknown && !weight.trim()) {
      setError("현재 체중을 입력하거나 「정확히 모름」을 선택해 주세요.");
      return;
    }
    router.push("/step2");
  };

  return (
    <>
      <div className="relative z-10 mx-auto min-h-screen w-full max-w-[375px] overflow-x-hidden bg-transparent">
        <WizardPageBackground />
        <div className="relative flex min-h-screen w-full flex-col items-center gap-8 px-6 pb-36 pt-20">
          <WizardHeader />
          <div className="flex w-full max-w-[327px] flex-col gap-4">
            <WizardProgress step={1} />
            <div>
              <h1 className="font-display text-[32px] leading-none text-[#111]">
                Step 1 기본정보
              </h1>
              <p className="mt-2 text-base leading-[1.4] text-[#555]">
                우리 아이를 위한 최적의 영양 설계를 위해 기본정보를 입력해 주세요.
              </p>
            </div>
          </div>

          <div className="w-full max-w-[343px] rounded-[24px] bg-white p-8 shadow-[0px_8px_32px_0px_rgba(17,17,17,0.06)]">
            <div className="mx-auto flex max-w-[295px] flex-col gap-8">
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
                <div className="relative">
                  <input
                    ref={birthInputRef}
                    id="birth-date"
                    type="date"
                    value={birthDate}
                    min={minBirthDate}
                    max={maxBirthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    tabIndex={birthHitLayer ? undefined : -1}
                    aria-hidden={birthHitLayer ? undefined : true}
                    aria-label={birthHitLayer ? "생년월일" : undefined}
                    className={`wf-birth-date-native [color-scheme:light]${birthHitLayer ? " wf-birth-date-native--hitlayer" : ""}`}
                  />
                  <button
                    type="button"
                    tabIndex={birthHitLayer ? -1 : undefined}
                    aria-hidden={birthHitLayer ? true : undefined}
                    className={`${wizardInputClass} relative flex w-full items-center justify-between gap-3 text-left [color-scheme:light] ${birthHitLayer ? "z-0 pointer-events-none" : "z-10"}`}
                    onClick={birthHitLayer ? undefined : openBirthPicker}
                    aria-label={
                      birthHitLayer
                        ? undefined
                        : birthDate
                          ? `생년월일 ${formatBirthDisplay(birthDate)}`
                          : "생년월일 선택"
                    }
                  >
                    <span
                      className={
                        birthDate
                          ? "min-w-0 truncate text-[#111]"
                          : "text-[#afb4a6]"
                      }
                    >
                      {birthDate
                        ? formatBirthDisplay(birthDate)
                        : "YYYY.MM.DD"}
                    </span>
                    <IconCalendar className="size-6 shrink-0 text-[#555]" />
                  </button>
                </div>
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
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-[#f5f1ed] px-4 py-3">
                    <input
                      type="text"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="0.0"
                      disabled={weightUnknown}
                      className="min-w-0 flex-1 border-0 bg-transparent text-base text-[#111] placeholder:text-[#6b7280] focus:outline-none disabled:opacity-50"
                    />
                    <span className="shrink-0 text-base font-bold text-[#111]">
                      Kg
                    </span>
                  </div>
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-[#111]">
                    <input
                      type="checkbox"
                      checked={weightUnknown}
                      onChange={(e) => {
                        setWeightUnknown(e.target.checked);
                        if (e.target.checked) setWeight("");
                      }}
                      className="size-5 rounded border border-[#dedee0] text-[#6f4425] focus:ring-[#f8620c]/40"
                    />
                    정확히 모름
                  </label>
                </div>
              </div>

              <div>
                <FieldLabel>품종</FieldLabel>
                <div className="relative">
                  <input
                    type="text"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    placeholder="예: 샴, 브리티시 숏헤어..."
                    className={`${wizardInputClass} pr-12`}
                  />
                  <button
                    type="button"
                    aria-label="품종 검색"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555]"
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
        {error ? (
          <p className="mb-2 text-center text-xs text-red-600" role="alert">
            {error}
          </p>
        ) : null}
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

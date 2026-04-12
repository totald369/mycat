"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CatalogItem } from "@/components/wireframe/CatalogSearchModal";
import { FieldLabel } from "@/components/design/FieldLabel";
import {
  PawPrimaryButton,
  PawSplitRow,
  PawWoodLink,
} from "@/components/design/PawButton";
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
import { FeedSearchModal } from "@/components/wireframe/FeedSearchModal";
import { IconClose, IconPlus, IconSearch } from "@/components/wireframe/icons";
import { CALCULATING_OVERLAY_VIDEOS } from "@/constants/calculatingOverlayVideos";
import { validateWizardBeforeResult } from "@/lib/wizardCalories";
import { patchWizardState, readWizardState } from "@/lib/wizardStorage";

const CALCULATING_OVERLAY_MS = 2800;

type Chip = { id: string; text: string; tone: "purple" | "peach" };

const SNACKS = ["하루 한번", "주 2-3회", "주1회 미만"] as const;

function isWetFeedKind(feedKind: string | undefined): boolean {
  if (!feedKind) return false;
  const x = feedKind.trim().toLowerCase();
  return x === "습식" || x === "wet";
}

function formatGramsForInput(n: number): string {
  if (!Number.isFinite(n)) return "10";
  return Number.isInteger(n) ? String(n) : String(n);
}

export default function Step3Page() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [feedModalOpen, setFeedModalOpen] = useState(false);
  const [grams, setGrams] = useState("10");
  const [times, setTimes] = useState("1");
  const [chips, setChips] = useState<Chip[]>([]);
  const [snack, setSnack] = useState<string | null>(null);
  const [nextTone, setNextTone] = useState<"purple" | "peach">("purple");
  const [hydrated, setHydrated] = useState(false);
  const [resultError, setResultError] = useState<string | null>(null);
  const [showCalculating, setShowCalculating] = useState(false);
  const [calculatingVideoSrc, setCalculatingVideoSrc] = useState<string | null>(
    null,
  );
  const overlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const s = readWizardState().step3;
    setSearch(s.search);
    setGrams(s.grams);
    setTimes(s.times);
    setChips(s.chips);
    setSnack(s.snack);
    setNextTone(s.nextTone);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    patchWizardState({
      step3: {
        search,
        grams,
        times,
        chips,
        snack,
        nextTone,
      },
    });
  }, [hydrated, search, grams, times, chips, snack, nextTone]);

  const addChip = () => {
    const name = search.trim();
    if (!name) return;
    const g = grams.trim() || "10";
    const t = times.trim() || "1";
    const text = `${name}/${g}g/${t}회`;
    setChips((c) => [
      ...c,
      { id: `${Date.now()}`, text, tone: nextTone },
    ]);
    setNextTone(nextTone === "purple" ? "peach" : "purple");
    setSearch("");
  };

  const removeChip = (id: string) => {
    setChips((c) => c.filter((x) => x.id !== id));
  };

  const onFeedSelect = useCallback((item: CatalogItem) => {
    setSearch(item.label);
    if (
      isWetFeedKind(item.feedKind) &&
      item.servingGrams != null &&
      Number.isFinite(item.servingGrams)
    ) {
      setGrams(formatGramsForInput(item.servingGrams));
    }
  }, []);

  const goResult = useCallback(() => {
    setResultError(null);
    const v = validateWizardBeforeResult({ chips, snack });
    if (!v.ok) {
      setResultError(v.error);
      return;
    }
    patchWizardState({
      step3: {
        search,
        grams,
        times,
        chips,
        snack,
        nextTone,
      },
    });
    const list = CALCULATING_OVERLAY_VIDEOS;
    if (list.length === 0) {
      router.push("/result");
      return;
    }
    const pick = list[Math.floor(Math.random() * list.length)] ?? list[0];
    setCalculatingVideoSrc(pick);
    setShowCalculating(true);
  }, [
    chips,
    snack,
    search,
    grams,
    times,
    nextTone,
    router,
  ]);

  useEffect(() => {
    if (!showCalculating) return;
    overlayTimerRef.current = setTimeout(() => {
      setShowCalculating(false);
      setCalculatingVideoSrc(null);
      router.push("/result");
    }, CALCULATING_OVERLAY_MS);
    return () => {
      if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
    };
  }, [showCalculating, router]);

  return (
    <>
      {showCalculating && calculatingVideoSrc ? (
        <div
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4 bg-white/95 px-6 backdrop-blur-sm"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <p className="font-display text-xl text-[#111]">계산하는 중…</p>
          <video
            key={calculatingVideoSrc}
            className="max-h-[50vh] w-full max-w-[320px] rounded-2xl object-contain"
            src={calculatingVideoSrc}
            autoPlay
            loop
            muted
            playsInline
          />
        </div>
      ) : null}

      <div className="relative z-10 mx-auto min-h-screen w-full max-w-[375px] overflow-x-hidden bg-transparent">
        <WizardPageBackground />
        <div className="relative flex min-h-screen w-full flex-col items-center gap-8 px-6 pb-40 pt-20">
          <WizardHeader />
          <div className="flex w-full max-w-[327px] flex-col gap-4">
            <WizardProgress step={3} />
            <div>
              <h1 className="font-display text-[32px] leading-none text-[#111]">
                Step 3 급여정보
              </h1>
              <p className="mt-2 text-base leading-[1.4] text-[#555]">
                우리 아이가 어떤 사료를 얼마나 먹는지 입력해주세요.
              </p>
            </div>
          </div>

          <div className="w-full max-w-[343px] rounded-[24px] bg-white p-8 shadow-[0px_8px_32px_0px_rgba(17,17,17,0.06)]">
            <div className="mx-auto flex max-w-[295px] flex-col gap-8">
              <div>
                <FieldLabel required>급여 종류 및 횟수</FieldLabel>
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="건식/아카나..."
                    className={`${wizardInputClass} pr-12`}
                  />
                  <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1">
                    {search.trim() ? (
                      <button
                        type="button"
                        aria-label="입력 지우기"
                        className="p-0.5 text-[#555]"
                        onClick={() => setSearch("")}
                      >
                        <IconClose />
                      </button>
                    ) : null}
                    <button
                      type="button"
                      aria-label="급여 종류 검색"
                      className="p-0.5 text-[#555]"
                      onClick={() => setFeedModalOpen(true)}
                    >
                      <IconSearch className="size-6" />
                    </button>
                  </div>
                </div>

                <div className="mt-1 flex gap-1">
                  <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-[#f5f1ed] px-4 py-3">
                    <input
                      type="text"
                      value={grams}
                      onChange={(e) => setGrams(e.target.value)}
                      placeholder="10"
                      className="min-w-0 flex-1 border-0 bg-transparent text-base text-[#111] placeholder:text-[#afb4a6] focus:outline-none"
                    />
                    <span className="shrink-0 text-base font-bold text-[#111]">
                      g
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-[#f5f1ed] px-4 py-3">
                    <input
                      type="text"
                      value={times}
                      onChange={(e) => setTimes(e.target.value)}
                      placeholder="1"
                      className="min-w-0 flex-1 border-0 bg-transparent text-base text-[#111] placeholder:text-[#afb4a6] focus:outline-none"
                    />
                    <span className="shrink-0 text-base font-bold text-[#111]">
                      회
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={addChip}
                    className="flex min-w-0 flex-1 items-center justify-center gap-1 rounded-xl bg-[#f8620c] px-3 py-3 text-base font-bold text-white shadow-sm"
                  >
                    <IconPlus className="size-5 text-white" />
                    추가
                  </button>
                </div>

                {chips.length > 0 && (
                  <div className="mt-3 flex flex-col gap-2">
                    {chips.map((c) => (
                      <div
                        key={c.id}
                        className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm ${
                          c.tone === "purple"
                            ? "bg-[#e9e3ff] text-[#111]"
                            : "bg-[#ffe8d5] text-[#111]"
                        }`}
                      >
                        <span className="pr-2">{c.text}</span>
                        <button
                          type="button"
                          aria-label="삭제"
                          className="shrink-0 text-[#555]"
                          onClick={() => removeChip(c.id)}
                        >
                          <IconClose />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <FieldLabel required>간식</FieldLabel>
                <div className="flex gap-1">
                  {SNACKS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSnack(s)}
                      className={
                        snack === s
                          ? `${wizardChoiceSelectedClass} min-w-0 flex-1 px-2 py-3 text-sm`
                          : `${wizardChoiceClass} min-w-0 flex-1 border-solid px-2 py-3 text-sm`
                      }
                    >
                      {snack === s ? <WizardSelectedChoiceLayers /> : null}
                      <span className="relative z-10">{s}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <WizardBottomBar>
        {resultError ? (
          <p className="mb-2 text-center text-xs text-red-600" role="alert">
            {resultError}
          </p>
        ) : null}
        <PawSplitRow
          left={
            <PawWoodLink href="/step2" className="text-center">
              이전 ♧
            </PawWoodLink>
          }
          right={
            <PawPrimaryButton
              type="button"
              onClick={goResult}
              className="text-center"
              disabled={showCalculating}
              pawHalf="trailing"
            >
              결과보기 ♧
            </PawPrimaryButton>
          }
        />
      </WizardBottomBar>

      <FeedSearchModal
        open={feedModalOpen}
        initialQuery={search}
        onClose={() => setFeedModalOpen(false)}
        onSelect={onFeedSelect}
      />
    </>
  );
}

"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
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
import { ValidationToast } from "@/components/design/ValidationToast";
import { designResource } from "@/components/design/designResourcePaths";
import {
  wizardBlockWidthClass,
  wizardContentWidthClass,
  wizardFormCardClass,
  wizardFormInnerClass,
  wizardModalOverlayElevatedClass,
  wizardModalPanelClass,
  wizardPageColumnClassBarTall,
  wizardShellClass,
} from "@/components/design/wizardLayoutClasses";
import {
  wizardChoiceClass,
  wizardChoiceSelectedClass,
  wizardInputInRowClass,
  wizardInputRowClass,
} from "@/components/design/wizardFieldClasses";
import { IconClose, IconPlus, IconSearch } from "@/components/wireframe/icons";
import { CALCULATING_OVERLAY_VIDEOS } from "@/constants/calculatingOverlayVideos";
import { DISPLAY_BUTTON, DISPLAY_TITLE } from "@/constants/displayTextSvg";
import { SESSION_SHOW_RESULT_COMPLETE_SPLASH } from "@/constants/resultNavigation";
import { parseChipFoodLine } from "@/lib/calculator";
import { prefetchFeedCatalogForResult } from "@/lib/feedCatalogPrefetch";
import { validateWizardBeforeResult } from "@/lib/wizardCalories";
import { useRequireWizardStep } from "@/lib/wizardFlow";
import { patchWizardState, readWizardState } from "@/lib/wizardStorage";

const CalculatingPawsPetLottie = dynamic(
  () =>
    import("@/components/design/CalculatingPawsPetLottie").then((m) => ({
      default: m.CalculatingPawsPetLottie,
    })),
  { ssr: false },
);

const FeedSearchModal = dynamic(
  () =>
    import("@/components/wireframe/FeedSearchModal").then((m) => ({
      default: m.FeedSearchModal,
    })),
  { ssr: false },
);

const CALCULATING_OVERLAY_MS = 2800;

type Chip = { id: string; text: string; tone: "purple" | "peach" };

const SNACKS = ["하루 한번", "주2-3회", "주1회 미만", "주지 않음"] as const;

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
  const [editingChipId, setEditingChipId] = useState<string | null>(null);
  const [snack, setSnack] = useState<string | null>(null);
  const [nextTone, setNextTone] = useState<"purple" | "peach">("purple");
  const [hydrated, setHydrated] = useState(false);
  const [resultError, setResultError] = useState<string | null>(null);
  const [showCalculating, setShowCalculating] = useState(false);
  const [calculatingVideoSrc, setCalculatingVideoSrc] = useState<string | null>(
    null,
  );
  const overlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const feedPrefetchRef = useRef<Promise<void> | null>(null);
  const feedSectionRef = useRef<HTMLDivElement>(null);
  const snackSectionRef = useRef<HTMLDivElement>(null);

  useRequireWizardStep(3);

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

  const scrollToSection = useCallback((ref: React.RefObject<HTMLElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const resetFeedInputs = useCallback(() => {
    setSearch("");
    setGrams("10");
    setTimes("1");
    setEditingChipId(null);
  }, []);

  const addChip = () => {
    const name = search.trim();
    if (!name) {
      setResultError("사료명을 입력하거나 검색으로 선택해 주세요.");
      scrollToSection(feedSectionRef);
      return;
    }
    const g = grams.trim() || "10";
    const t = times.trim() || "1";
    const text = `${name}/${g}g/${t}회`;
    if (editingChipId) {
      setChips((c) =>
        c.map((x) => (x.id === editingChipId ? { ...x, text } : x)),
      );
      resetFeedInputs();
      return;
    }
    setChips((c) => [
      ...c,
      { id: `${Date.now()}`, text, tone: nextTone },
    ]);
    setNextTone(nextTone === "purple" ? "peach" : "purple");
    resetFeedInputs();
  };

  const selectChipForEdit = (chip: Chip) => {
    if (editingChipId === chip.id) {
      resetFeedInputs();
      return;
    }
    const parsed = parseChipFoodLine(chip.text);
    if (!parsed) return;
    setEditingChipId(chip.id);
    setSearch(parsed.namePart);
    setGrams(formatGramsForInput(parsed.amountG));
    setTimes(formatGramsForInput(parsed.timesPerDay));
  };

  const removeChip = (id: string) => {
    setChips((c) => c.filter((x) => x.id !== id));
    if (editingChipId === id) resetFeedInputs();
  };

  const onFeedSelect = useCallback((item: CatalogItem) => {
    setSearch(item.label);
    if (isWetFeedKind(item.feedKind)) {
      setTimes("1");
      if (
        item.servingGrams != null &&
        Number.isFinite(item.servingGrams)
      ) {
        setGrams(formatGramsForInput(item.servingGrams));
      }
    }
  }, []);

  const goResult = useCallback(() => {
    setResultError(null);
    const v = validateWizardBeforeResult({ chips, snack });
    if (!v.ok) {
      setResultError(v.error);
      if (v.error.includes("간식")) {
        scrollToSection(snackSectionRef);
      } else if (
        v.error.includes("급여") ||
        v.error.includes("사료")
      ) {
        scrollToSection(feedSectionRef);
      }
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
    feedPrefetchRef.current = prefetchFeedCatalogForResult().catch(() => {
      /* 실패 시 결과 페이지에서 /api/feeds 재요청 */
    });

    const list = CALCULATING_OVERLAY_VIDEOS;
    if (list.length === 0) {
      void (async () => {
        try {
          await feedPrefetchRef.current;
        } catch {
          /* */
        }
        try {
          sessionStorage.setItem(SESSION_SHOW_RESULT_COMPLETE_SPLASH, "1");
        } catch {
          /* */
        }
        router.push("/result");
      })();
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
    scrollToSection,
  ]);

  useEffect(() => {
    if (!showCalculating) return;
    overlayTimerRef.current = setTimeout(() => {
      void (async () => {
        try {
          await feedPrefetchRef.current;
        } catch {
          /* */
        }
        try {
          sessionStorage.setItem(SESSION_SHOW_RESULT_COMPLETE_SPLASH, "1");
        } catch {
          /* */
        }
        // 오버레이를 끄지 않고 바로 이동 — 끄면 push 직전에 Step3 본문이 한 프레임 보임
        router.push("/result");
      })();
    }, CALCULATING_OVERLAY_MS);
    return () => {
      if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
    };
  }, [showCalculating, router]);

  useEffect(() => {
    if (!resultError) return;
    const timer = setTimeout(() => setResultError(null), 2200);
    return () => clearTimeout(timer);
  }, [resultError]);

  return (
    <>
      {resultError ? <ValidationToast message={resultError} /> : null}
      {showCalculating && calculatingVideoSrc ? (
        <div
          className={`${wizardModalOverlayElevatedClass} isolate overflow-hidden`}
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <div
            className={`relative ${wizardModalPanelClass} overflow-hidden bg-[#fffcf9]`}
          >
            <WizardPageBackground placement="contain" priority quality={64} />
            <CalculatingPawsPetLottie />
            <div className="relative z-10 flex h-full min-h-[100dvh] flex-col items-center justify-center px-4 pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] min-[360px]:px-6">
            <div className={`flex ${wizardBlockWidthClass} flex-col items-center gap-4`}>
              <div className="relative w-full max-w-[min(233px,calc(100%-0px))] shrink-0 overflow-hidden rounded-[40px] aspect-[233/239]">
                <video
                  key={calculatingVideoSrc}
                  className="absolute left-0 top-[-7.33%] h-[129.99%] w-full max-w-none object-cover"
                  src={calculatingVideoSrc}
                  autoPlay
                  loop
                  muted
                  playsInline
                  controlsList="nodownload"
                />
              </div>
              <div className="w-full text-center text-[1.75rem] leading-none text-[#111] min-[360px]:text-[2rem]">
                <Image
                  src={DISPLAY_TITLE.step3Calculating.src}
                  alt="칼로리를 계산하고 있습니다..."
                  width={DISPLAY_TITLE.step3Calculating.width}
                  height={DISPLAY_TITLE.step3Calculating.height}
                  className="mx-auto h-auto w-auto max-w-full object-contain"
                  unoptimized
                  sizes="(max-width: 360px) 80vw, 237px"
                />
              </div>
            </div>
          </div>
          </div>
        </div>
      ) : null}

      <div className={wizardShellClass}>
        <WizardPageBackground priority={false} quality={62} />
        <div className={wizardPageColumnClassBarTall}>
          <WizardHeader />
          <div className={wizardContentWidthClass}>
            <WizardProgress step={3} />
            <div>
              <h1>
                <Image
                  src={DISPLAY_TITLE.step3.src}
                  alt="Step 3 급여정보"
                  width={DISPLAY_TITLE.step3.width}
                  height={DISPLAY_TITLE.step3.height}
                  className="h-auto w-auto object-contain"
                  unoptimized
                  sizes="200px"
                />
              </h1>
              <p className="mt-2 text-base leading-[1.4] text-[#555]">
                우리 아이가 어떤 사료를 얼마나 먹는지 입력해주세요.
              </p>
            </div>
          </div>

          <div className={wizardFormCardClass}>
            <div className={wizardFormInnerClass}>
              <div ref={feedSectionRef} className="min-w-0 scroll-mt-28">
                <FieldLabel required>급여 종류 및 횟수</FieldLabel>
                <p className="mb-2 text-sm leading-[1.4] text-[#888]">
                  사료를 검색하신 후 급여량과 횟수를 입력하고 추가해주세요.
                </p>
                <div className={wizardInputRowClass}>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key !== "Enter") return;
                      e.preventDefault();
                      setFeedModalOpen(true);
                    }}
                    placeholder="건식/아카나..."
                    className={wizardInputInRowClass}
                  />
                  <div className="flex shrink-0 items-center gap-1">
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
                    {editingChipId ? null : (
                      <IconPlus className="size-5 text-white" />
                    )}
                    {editingChipId ? "수정" : "추가"}
                  </button>
                </div>

                {chips.length > 0 && (
                  <div className="mt-3 flex flex-col gap-1">
                    {chips.map((c) => {
                      const isEditing = editingChipId === c.id;
                      return (
                        <div
                          key={c.id}
                          className={`relative flex items-center justify-between gap-2 overflow-hidden rounded-lg py-1 pl-4 pr-2 text-sm leading-[1.4] text-white ${
                            isEditing
                              ? "ring-2 ring-[#f8620c] ring-offset-2 ring-offset-[#fffcf9]"
                              : ""
                          }`}
                        >
                          <span
                            aria-hidden
                            className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-lg"
                          >
                            <span
                              className={
                                c.tone === "purple"
                                  ? "absolute inset-0 rounded-lg bg-[#6f4425]"
                                  : "absolute inset-0 rounded-lg bg-[#884413]"
                              }
                            />
                            <Image
                              src={designResource.selectedChoiceTexture}
                              alt=""
                              fill
                              className="rounded-lg object-cover opacity-20"
                              sizes="(max-width: 400px) 92vw, 360px"
                              quality={72}
                            />
                          </span>
                          <button
                            type="button"
                            aria-pressed={isEditing}
                            aria-label={`${c.text} 급여량 수정`}
                            className="relative z-10 min-w-0 flex-1 cursor-pointer pr-1 text-left font-semibold"
                            onClick={() => selectChipForEdit(c)}
                          >
                            {c.text}
                          </button>
                          <button
                            type="button"
                            aria-label="삭제"
                            className="relative z-10 shrink-0 text-white/85 hover:text-white"
                            onClick={() => removeChip(c.id)}
                          >
                            <IconClose />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div ref={snackSectionRef} className="scroll-mt-28">
                <FieldLabel required>간식</FieldLabel>
                <div className="grid grid-cols-2 gap-1">
                  {SNACKS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={snack === s}
                      onClick={() => setSnack(s)}
                      className={`touch-manipulation ${
                        snack === s
                          ? `${wizardChoiceSelectedClass} min-w-0 px-2 py-3 text-sm`
                          : `${wizardChoiceClass} min-w-0 border-solid px-2 py-3 text-sm`
                      }`}
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
        <PawSplitRow
          left={
            <PawWoodLink
              href="/step2"
              className="text-center"
              labelSvg={DISPLAY_BUTTON.step3Prev}
            >
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
              labelSvg={DISPLAY_BUTTON.step3Next}
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

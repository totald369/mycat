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

const CalculatingPawsPetLottie = dynamic(
  () =>
    import("@/components/design/CalculatingPawsPetLottie").then((m) => ({
      default: m.CalculatingPawsPetLottie,
    })),
  { ssr: false },
);
import { ValidationToast } from "@/components/design/ValidationToast";
import { designResource } from "@/components/design/designResourcePaths";
import {
  wizardBlockWidthClass,
  wizardContentWidthClass,
  wizardFormCardClass,
  wizardFormInnerClass,
  wizardPageColumnClassBarTall,
  wizardShellClass,
} from "@/components/design/wizardLayoutClasses";
import {
  wizardChoiceClass,
  wizardChoiceSelectedClass,
  wizardInputInRowClass,
  wizardInputRowClass,
} from "@/components/design/wizardFieldClasses";
import { FeedSearchModal } from "@/components/wireframe/FeedSearchModal";
import { IconClose, IconPlus, IconSearch } from "@/components/wireframe/icons";
import { CALCULATING_OVERLAY_VIDEOS } from "@/constants/calculatingOverlayVideos";
import { DISPLAY_BUTTON, DISPLAY_TITLE } from "@/constants/displayTextSvg";
import { SESSION_SHOW_RESULT_COMPLETE_SPLASH } from "@/constants/resultNavigation";
import { prefetchFeedCatalogForResult } from "@/lib/feedCatalogPrefetch";
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
  const feedPrefetchRef = useRef<Promise<void> | null>(null);

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
    setGrams("10");
    setTimes("1");
  };

  const removeChip = (id: string) => {
    setChips((c) => c.filter((x) => x.id !== id));
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
          className="fixed inset-0 isolate z-[200] min-h-[100dvh] w-full overflow-hidden bg-[#fffcf9]"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
            <Image
              src={designResource.background}
              alt=""
              fill
              className="object-cover object-center"
              sizes="100vw"
              priority
            />
          </div>
          <CalculatingPawsPetLottie />
          <div className="relative z-10 flex h-full min-h-0 flex-col items-center justify-center px-4 pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] min-[360px]:px-6">
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
      ) : null}

      <div className={wizardShellClass}>
        <WizardPageBackground />
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
              <div className="min-w-0">
                <FieldLabel required>급여 종류 및 횟수</FieldLabel>
                <div className={wizardInputRowClass}>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
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
                    <IconPlus className="size-5 text-white" />
                    추가
                  </button>
                </div>

                {chips.length > 0 && (
                  <div className="mt-3 flex flex-col gap-1">
                    {chips.map((c) => (
                      <div
                        key={c.id}
                        className="relative flex items-center justify-between gap-2 overflow-hidden rounded-lg py-1 pl-4 pr-2 text-sm leading-[1.4] text-white"
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
                            sizes="300px"
                          />
                        </span>
                        <span className="relative z-10 min-w-0 flex-1 pr-1 font-semibold">
                          {c.text}
                        </span>
                        <button
                          type="button"
                          aria-label="삭제"
                          className="relative z-10 shrink-0 text-white/85 hover:text-white"
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

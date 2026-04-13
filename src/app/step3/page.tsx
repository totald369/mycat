"use client";

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
import { CalculatingPawsPetLottie } from "@/components/design/CalculatingPawsPetLottie";
import { WizardProgress } from "@/components/design/WizardProgress";
import { designResource } from "@/components/design/designResourcePaths";
import {
  wizardChoiceClass,
  wizardChoiceSelectedClass,
  wizardInputClass,
} from "@/components/design/wizardFieldClasses";
import { FeedSearchModal } from "@/components/wireframe/FeedSearchModal";
import { IconClose, IconPlus, IconSearch } from "@/components/wireframe/icons";
import { CALCULATING_OVERLAY_VIDEOS } from "@/constants/calculatingOverlayVideos";
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

  return (
    <>
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
          <div className="relative z-10 flex h-full min-h-0 flex-col items-center justify-center px-6 pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]">
            <div className="flex w-full max-w-[327px] flex-col items-center gap-4">
              <div className="relative h-[239px] w-[233px] shrink-0 overflow-hidden rounded-[40px]">
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
              <div className="w-full text-center font-display text-[32px] leading-none text-[#111]">
                <p className="mb-0">칼로리를 </p>
                <p className="mt-0">계산하고 있습니다...</p>
              </div>
            </div>
          </div>
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
                  <div className="mt-3 flex flex-col gap-1">
                    {chips.map((c) => (
                      <div
                        key={c.id}
                        className="relative flex items-center justify-between gap-2 overflow-hidden rounded-lg py-1 pl-4 pr-2 font-display text-sm leading-[1.4] text-white"
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
                        <span className="relative z-10 min-w-0 flex-1 pr-1">
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

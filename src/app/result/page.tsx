"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  PawPrimaryLink,
  PawSplitRow,
  PawWoodButton,
} from "@/components/design/PawButton";
import { WizardBottomBar } from "@/components/design/WizardBottomBar";
import { WizardHeader } from "@/components/design/WizardHeader";
import { WizardPageBackground } from "@/components/design/WizardPageBackground";
import { FEED_CATALOG_PREFETCH_KEY } from "@/lib/feedCatalogPrefetch";
import { requestShortShareLink } from "@/lib/requestShortShareLink";
import {
  decodeShareResultPayload,
  encodeShareResultPayload,
  sharePayloadToCalculatorSuccess,
} from "@/lib/shareResultPayload";
import {
  computeCaloriesWithWizard,
  formatKcal,
  statusHeadline,
  type FeedCatalogItem,
} from "@/lib/wizardCalories";
import type { CalculatorOutput } from "@/lib/calculator";
import type { CalculatorSuccess } from "@/lib/calculator";
import { designResource } from "@/components/design/designResourcePaths";
import {
  wizardPageColumnClass,
  wizardResultContentClass,
  wizardShellClassResult,
} from "@/components/design/wizardLayoutClasses";
import { RESULT_HERO_IMAGE } from "@/constants/resultHeroImages";
import { SESSION_SHOW_RESULT_COMPLETE_SPLASH } from "@/constants/resultNavigation";
import { DISPLAY_BUTTON, DISPLAY_TITLE } from "@/constants/displayTextSvg";

const CheckCatLottie = dynamic(
  () =>
    import("@/components/design/CheckCatLottie").then((m) => ({
      default: m.CheckCatLottie,
    })),
  { ssr: false },
);

const ShareLoaderLottie = dynamic(
  () =>
    import("@/components/design/ShareLoaderLottie").then((m) => ({
      default: m.ShareLoaderLottie,
    })),
  { ssr: false },
);

function kcalBig(value: number, accent?: boolean) {
  const n = Math.round(value);
  return (
    <div className="flex items-end justify-center gap-0.5">
      <span
        className={`text-[1.75rem] font-bold leading-none min-[360px]:text-[2rem] ${accent ? "text-[#f8620c]" : "text-black"}`}
      >
        {n}
      </span>
      <span className="pb-1 text-base font-bold leading-none text-black">
        kcal
      </span>
    </div>
  );
}

const TAGLINE: Record<
  CalculatorSuccess["status"],
  readonly [string, string]
> = {
  balanced: [
    "적절한 양의 사료를 먹고 있어요!",
    "지금 급여량을 유지해주세요.",
  ],
  slightly_high: [
    "많은 양의 사료를 먹고 있어요!",
    "급여량을 줄여주세요.",
  ],
  high: [
    "많은 양의 사료를 먹고 있어요!",
    "급여량을 줄여주세요.",
  ],
  slightly_low: [
    "적은 양의 사료를 먹고 있어요!",
    "급여량을 늘려주세요.",
  ],
  low: [
    "적은 양의 사료를 먹고 있어요!",
    "급여량을 늘려주세요.",
  ],
};

function statusHeadlineSvg(status: CalculatorSuccess["status"]) {
  if (status === "balanced") return DISPLAY_TITLE.resultBalanced;
  if (status === "slightly_high" || status === "high") return DISPLAY_TITLE.resultHigh;
  return DISPLAY_TITLE.resultLow;
}

export default function ResultPage() {
  const [loadError, setLoadError] = useState<string | null>(null);
  const [output, setOutput] = useState<CalculatorOutput | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const usedPrefetchRef = useRef(false);
  /** 위저드에서 온 경우에만 true → 계산 완료 Lottie 후 결과 본문 */
  const [showCompleteSplash, setShowCompleteSplash] = useState(false);
  const resultCaptureRef = useRef<HTMLDivElement | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [shareBusy, setShareBusy] = useState(false);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const shareInFlightRef = useRef(false);

  const finishCompleteSplash = useCallback(() => {
    try {
      sessionStorage.removeItem(SESSION_SHOW_RESULT_COMPLETE_SPLASH);
    } catch {
      /* */
    }
    setShowCompleteSplash(false);
  }, []);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const shortId = params.get("sid");
    if (shortId) {
      void (async () => {
        try {
          const res = await fetch(`/api/share/${encodeURIComponent(shortId)}`);
          if (!res.ok) return;
          const data = (await res.json()) as { encoded?: string };
          const encoded = (data.encoded ?? "").trim();
          if (!encoded) return;
          const decoded = decodeShareResultPayload(encoded);
          if (!decoded.ok) return;
          setOutput(sharePayloadToCalculatorSuccess(decoded.value));
          setWarnings([]);
          usedPrefetchRef.current = true;
        } catch {
          /* */
        }
      })();
      return;
    }

    const share = params.get("s");
    if (share) {
      const decoded = decodeShareResultPayload(share);
      if (decoded.ok) {
        setOutput(sharePayloadToCalculatorSuccess(decoded.value));
        setWarnings([]);
        usedPrefetchRef.current = true;
        return;
      }
    }

    const raw = sessionStorage.getItem(FEED_CATALOG_PREFETCH_KEY);
    if (!raw) return;
    try {
      const data = JSON.parse(raw) as { items?: FeedCatalogItem[] };
      sessionStorage.removeItem(FEED_CATALOG_PREFETCH_KEY);
      const items = data.items ?? [];
      const { output: out, warnings: w } = computeCaloriesWithWizard(items);
      setOutput(out);
      setWarnings(w);
      usedPrefetchRef.current = true;
    } catch {
      sessionStorage.removeItem(FEED_CATALOG_PREFETCH_KEY);
    }
  }, []);

  useEffect(() => {
    if (usedPrefetchRef.current) {
      return;
    }

    let cancelled = false;
    setLoadError(null);

    fetch("/api/feeds")
      .then(async (res) => {
        const data = (await res.json()) as {
          items?: FeedCatalogItem[];
          error?: string;
        };
        if (!res.ok) {
          throw new Error(data.error ?? "사료 목록을 불러오지 못했습니다.");
        }
        return data.items ?? [];
      })
      .then((items) => {
        if (cancelled) return;
        const { output: out, warnings: w } = computeCaloriesWithWizard(items);
        setOutput(out);
        setWarnings(w);
      })
      .catch((e: Error) => {
        if (!cancelled) setLoadError(e.message);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const success = output?.ok === true ? output : null;
  const errMsg =
    loadError ?? (output?.ok === false ? output.error : null);

  useLayoutEffect(() => {
    if (!success) return;
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.has("s") || params.has("sid")) {
      setShowCompleteSplash(false);
      return;
    }
    try {
      setShowCompleteSplash(
        sessionStorage.getItem(SESSION_SHOW_RESULT_COMPLETE_SPLASH) === "1",
      );
    } catch {
      setShowCompleteSplash(false);
    }
  }, [success]);

  const handleShare = useCallback(async () => {
    if (!success || typeof window === "undefined") return;
    if (shareInFlightRef.current) return;
    shareInFlightRef.current = true;
    const encoded = encodeShareResultPayload(success);
    setShareBusy(true);
    setShareMessage(null);
    let shareUrl: string | null = null;
    try {
      shareUrl = await requestShortShareLink(
        encoded,
        window.location.origin,
      );
    } finally {
      shareInFlightRef.current = false;
      setShareBusy(false);
    }

    if (!shareUrl) {
      setShareMessage(
        "단축 링크를 만들지 못했어요. 잠시 후 다시 시도해 주세요.",
      );
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          text: "우리 냥이 칼로리 계산 결과를 확인해 보세요.",
          url: shareUrl,
        });
      } catch {
        /* 사용자 취소 등 */
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareMessage("단축 링크를 복사했어요.");
    } catch {
      setShareMessage("링크 복사에 실패했어요.");
    }
  }, [success]);

  const handleSaveImage = useCallback(async () => {
    if (!resultCaptureRef.current) return;
    const captureNode = resultCaptureRef.current;
    const exportPaddingX = 30;
    try {
      const { toCanvas } = await import("html-to-image");
      const pixelRatio = 2;
      const sourceCanvas = await toCanvas(captureNode, {
        cacheBust: true,
        pixelRatio,
        backgroundColor: "#ffffff",
      });

      const paddingPx = exportPaddingX * pixelRatio;
      const outCanvas = document.createElement("canvas");
      outCanvas.width = sourceCanvas.width + paddingPx * 2;
      outCanvas.height = sourceCanvas.height;
      const ctx = outCanvas.getContext("2d");
      if (!ctx) throw new Error("canvas context unavailable");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, outCanvas.width, outCanvas.height);
      ctx.drawImage(sourceCanvas, paddingPx, 0);

      const dataUrl = outCanvas.toDataURL("image/jpeg", 0.95);
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "our-cat-calorie-result.jpg";
      link.click();
      setSaveMessage("이미지를 저장했어요.");
    } catch {
      setSaveMessage("이미지 저장에 실패했어요. 다시 시도해 주세요.");
    }
  }, []);

  useEffect(() => {
    if (!saveMessage) return;
    const timer = setTimeout(() => setSaveMessage(null), 2000);
    return () => clearTimeout(timer);
  }, [saveMessage]);

  useEffect(() => {
    if (!shareMessage) return;
    const timer = setTimeout(() => setShareMessage(null), 2800);
    return () => clearTimeout(timer);
  }, [shareMessage]);

  return (
    <div className={wizardShellClassResult}>
      <WizardPageBackground />
      <div className={wizardPageColumnClass}>
        <WizardHeader
          trailing={
            success ? (
              <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center">
                {showCompleteSplash ? null : (
                  <button
                    type="button"
                    className="flex h-[48px] w-[48px] shrink-0 items-center justify-center overflow-hidden rounded-lg p-0 transition-opacity hover:opacity-80 active:opacity-60"
                    aria-label="결과 이미지 저장"
                    onClick={handleSaveImage}
                  >
                    {/* 피그마 45:1204 — 48×48 터치, 아이콘 24×24 중앙 (download-01) */}
                    {/* eslint-disable-next-line @next/next/no-img-element -- html-to-image 캡처 호환 */}
                    <img
                      src={designResource.imageDownTouchArea}
                      alt=""
                      width={48}
                      height={48}
                      className="block h-[48px] w-[48px] max-w-none shrink-0 object-contain"
                      decoding="async"
                    />
                  </button>
                )}
              </div>
            ) : undefined
          }
        />

        {loadError && !output ? (
          <p className="text-center text-sm text-red-600" role="alert">
            {loadError}
          </p>
        ) : null}

        {errMsg && output !== null ? (
          <p className="text-center text-sm text-red-600" role="alert">
            {errMsg}
          </p>
        ) : null}

        {warnings.length > 0 ? (
          <p className="text-center text-xs leading-relaxed text-amber-800">
            {warnings.join(" ")}
          </p>
        ) : null}

        {!output && !loadError ? (
          <p
            className="mt-8 text-center text-base text-[#555]"
            role="status"
            aria-live="polite"
          >
            결과를 불러오는 중이에요…
          </p>
        ) : null}

        {success && showCompleteSplash ? (
          <div
            className="flex min-h-[min(520px,70dvh)] w-full max-w-[min(327px,100%)] flex-col items-center justify-center gap-4 px-3 text-center min-[360px]:px-4"
            aria-busy="true"
            aria-live="polite"
          >
            <CheckCatLottie
              className="h-[140px] w-[140px] shrink-0 sm:h-[160px] sm:w-[160px]"
              onComplete={finishCompleteSplash}
            />
            <p className="text-center text-[1.875rem] leading-none text-[#111] min-[360px]:text-[2.5rem]">
              <Image
                src={DISPLAY_TITLE.resultComplete.src}
                alt="계산 완료"
                width={DISPLAY_TITLE.resultComplete.width}
                height={DISPLAY_TITLE.resultComplete.height}
                className="mx-auto h-auto w-auto object-contain"
                unoptimized
                sizes="150px"
              />
            </p>
          </div>
        ) : null}

        {success && !showCompleteSplash ? (
          <div
            ref={resultCaptureRef}
            className={wizardResultContentClass}
          >
            <div className="flex w-full flex-col items-center gap-6">
              <div className="relative h-[219px] w-[176px] shrink-0 bg-transparent">
                {/* eslint-disable-next-line @next/next/no-img-element -- html-to-image 캡처 시 Next/Image 투명 WebP가 검은색으로 깨지는 이슈 방지 */}
                <img
                  src={RESULT_HERO_IMAGE[success.status]}
                  alt=""
                  width={528}
                  height={657}
                  className="h-full w-full object-contain object-bottom"
                  decoding="async"
                  fetchPriority="high"
                />
              </div>
              <div className="text-center">
                <h1 className="text-[1.875rem] leading-none text-[#111] min-[360px]:text-[2.5rem]">
                  {(() => {
                    const headlineSvg = statusHeadlineSvg(success.status);
                    return (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element -- 모바일 html-to-image 캡처 시 SVG 안정성 확보 */}
                        <img
                          src={headlineSvg.src}
                          alt=""
                          aria-hidden
                          width={headlineSvg.width}
                          height={headlineSvg.height}
                          className="mx-auto h-auto w-auto max-w-full object-contain"
                          decoding="async"
                        />
                        <span className="sr-only">{statusHeadline(success.status)}</span>
                      </>
                    );
                  })()}
                </h1>
                <p className="mt-3 text-lg leading-[1.4] text-[rgba(23,23,23,0.8)]">
                  {TAGLINE[success.status].map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </p>
              </div>

              <div className="flex w-full items-center justify-between rounded-2xl bg-white p-4 shadow-[0px_8px_32px_0px_rgba(17,17,17,0.06)]">
                <div className="flex w-[125px] flex-col items-center gap-2 text-center">
                  <p className="text-sm font-semibold leading-[1.4] text-black">
                    권장 칼로리
                  </p>
                  {kcalBig(success.recommendedCalories)}
                </div>
                <div
                  className="h-8 w-px shrink-0 bg-[rgba(23,23,23,0.1)]"
                  aria-hidden
                />
                <div className="flex w-[125px] flex-col items-center gap-2 text-center">
                  <p className="text-sm font-semibold leading-[1.4] text-black">
                    급여 칼로리
                  </p>
                  {kcalBig(success.totalCalories, true)}
                </div>
              </div>
            </div>

            <p className="w-full text-center text-[0.6875rem] text-[rgba(23,23,23,0.55)]">
              사료 {formatKcal(success.foodCalories)} + 간식 추정{" "}
              {formatKcal(success.snackCalories)} · 권장 대비{" "}
              {success.diffPercent >= 0 ? "+" : ""}
              {success.diffPercent.toFixed(1)}%
            </p>

            <div className="w-full rounded-lg bg-[#f5f1ed] p-4 text-sm">
              <p className="font-bold leading-[1.4] text-[#171717]">
                계산 결과 가이드
              </p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-[rgba(23,23,23,0.8)]">
                <li>
                  <span
                    className={
                      success.diffPercent <= -15
                        ? "font-semibold text-[#f8620c]"
                        : undefined
                    }
                  >
                    -15% 이하: 급여량을 늘려야 해요!
                  </span>
                </li>
                <li>
                  <span
                    className={
                      success.diffPercent > -15 && success.diffPercent < -5
                        ? "font-semibold text-[#f8620c]"
                        : undefined
                    }
                  >
                    -5% ~ -15%: 조금 더 늘려보세요.
                  </span>
                </li>
                <li>
                  <span
                    className={
                      success.diffPercent >= -5 && success.diffPercent <= 5
                        ? "font-semibold text-[#f8620c]"
                        : undefined
                    }
                  >
                    -5% ~ +5%: 지금 급여량이 적당해요.
                  </span>
                </li>
                <li>
                  <span
                    className={
                      success.diffPercent > 5 && success.diffPercent <= 15
                        ? "font-semibold text-[#f8620c]"
                        : undefined
                    }
                  >
                    +5% ~ +15%: 조금만 줄여보세요.
                  </span>
                </li>
                <li>
                  <span
                    className={
                      success.diffPercent > 15
                        ? "font-semibold text-[#f8620c]"
                        : undefined
                    }
                  >
                    +15% 이상: 급여량 조정이 필요해요.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        ) : null}
      </div>

      {saveMessage || shareMessage ? (
        <div
          role="status"
          className="pointer-events-none fixed bottom-[calc(7.25rem+env(safe-area-inset-bottom,0px))] left-1/2 z-[25] w-[min(100%-32px,280px)] -translate-x-1/2 rounded-xl border border-[#dedee0] bg-white px-3 py-2 text-center text-xs font-medium text-[#6f4425] shadow-[0px_8px_24px_rgba(17,17,17,0.12)]"
        >
          {saveMessage ?? shareMessage}
        </div>
      ) : null}

      {success && !showCompleteSplash ? (
        <WizardBottomBar>
          <PawSplitRow
            left={
              <PawPrimaryLink
                href="/step1"
                className="text-center"
                pawHalf="leading"
                labelSvg={DISPLAY_BUTTON.retry}
              >
                다시하기 ♧
              </PawPrimaryLink>
            }
            right={
              <PawWoodButton
                type="button"
                className="text-center"
                pawHalf="trailing"
                disabled={shareBusy}
                aria-busy={shareBusy}
                onClick={handleShare}
                labelSvg={shareBusy ? undefined : DISPLAY_BUTTON.share}
              >
                {shareBusy ? <ShareLoaderLottie size={40} /> : "공유하기 ♧"}
              </PawWoodButton>
            }
          />
        </WizardBottomBar>
      ) : null}
    </div>
  );
}

"use client";

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
import { RESULT_HERO_IMAGE } from "@/constants/resultHeroImages";

function kcalBig(value: number, accent?: boolean) {
  const n = Math.round(value);
  return (
    <div className="flex items-end justify-center gap-0.5">
      <span
        className={`text-[32px] font-bold leading-none ${accent ? "text-[#f8620c]" : "text-black"}`}
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

export default function ResultPage() {
  const [loadError, setLoadError] = useState<string | null>(null);
  const [output, setOutput] = useState<CalculatorOutput | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const usedPrefetchRef = useRef(false);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
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

  const handleShare = useCallback(async () => {
    if (!success || typeof window === "undefined") return;
    const encoded = encodeShareResultPayload(success);
    const url = new URL(`${window.location.origin}${window.location.pathname}`);
    url.searchParams.set("s", encoded);

    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          text: "우리 냥이 칼로리 계산 결과를 확인해 보세요.",
          url: url.toString(),
        });
      } catch {
        /* 사용자 취소 등 */
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url.toString());
    } catch {
      /* */
    }
  }, [success]);

  return (
    <div className="relative z-10 mx-auto min-h-screen w-full max-w-[375px] overflow-x-hidden overflow-y-visible bg-transparent">
      <WizardPageBackground />
      <div className="relative flex min-h-screen w-full flex-col items-center gap-8 px-6 pb-36 pt-20">
        <WizardHeader />

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

        {success ? (
          <>
            <div className="flex flex-col items-center gap-6">
              <div className="relative h-[219px] w-[176px] shrink-0">
                <Image
                  src={RESULT_HERO_IMAGE[success.status]}
                  alt=""
                  width={528}
                  height={657}
                  className="h-full w-full object-contain object-bottom"
                  sizes="176px"
                  priority
                />
              </div>
              <div className="text-center">
                <h1 className="font-display text-[40px] leading-none text-[#111]">
                  {statusHeadline(success.status)}
                </h1>
                <p className="mt-3 text-lg leading-[1.4] text-[rgba(23,23,23,0.8)]">
                  {TAGLINE[success.status].map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </p>
              </div>

              <div className="flex w-full max-w-[327px] items-center justify-between rounded-2xl bg-white p-4 shadow-[0px_8px_32px_0px_rgba(17,17,17,0.06)]">
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

            <p className="w-full max-w-[327px] text-center text-[11px] text-[rgba(23,23,23,0.55)]">
              사료 {formatKcal(success.foodCalories)} + 간식 추정{" "}
              {formatKcal(success.snackCalories)} · 권장 대비{" "}
              {success.diffPercent >= 0 ? "+" : ""}
              {success.diffPercent.toFixed(1)}%
            </p>

            <div className="w-full max-w-[327px] rounded-lg bg-[#f5f1ed] p-4 text-sm">
              <p className="font-bold leading-[1.4] text-[#171717]">
                계산 결과 가이드
              </p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-[rgba(23,23,23,0.8)]">
                <li>
                  <span className="font-semibold text-[#f8620c]">
                    5% 이내: 현재 급여량을 유지해 보세요.
                  </span>
                </li>
                <li>5~15% 차이: 조금씩 조정해 보세요.</li>
                <li>15% 이상 차이: 급여량 조정이 필요해 보여요.</li>
              </ul>
            </div>
          </>
        ) : null}
      </div>

      {success ? (
        <WizardBottomBar>
          <PawSplitRow
            left={
              <PawPrimaryLink
                href="/step1"
                className="text-center"
                pawHalf="leading"
              >
                다시하기 ♧
              </PawPrimaryLink>
            }
            right={
              <PawWoodButton
                type="button"
                className="text-center"
                pawHalf="trailing"
                onClick={handleShare}
              >
                공유하기 ♧
              </PawWoodButton>
            }
          />
        </WizardBottomBar>
      ) : null}
    </div>
  );
}

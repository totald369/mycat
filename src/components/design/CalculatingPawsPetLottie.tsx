"use client";

import Lottie from "lottie-react";
import { useEffect, useState } from "react";

/** `public/lottie/paws pet.json` */
const PAWS_PET_LOTTIE_SRC = "/lottie/paws%20pet.json";

/**
 * 계산 중 오버레이 배경 위에 깔리는 발바닥 Lottie (Background.png 위 레이어).
 */
export function CalculatingPawsPetLottie() {
  const [animationData, setAnimationData] = useState<object | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(PAWS_PET_LOTTIE_SRC)
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json();
      })
      .then((json: object) => {
        if (!cancelled) setAnimationData(json);
      })
      .catch(() => {
        /* 배경 PNG만 노출 */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!animationData) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
      aria-hidden
    >
      <Lottie
        animationData={animationData}
        loop
        className="h-full w-full [&_svg]:block [&_svg]:h-full [&_svg]:w-full [&_svg]:max-h-none [&_svg]:max-w-none"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}

"use client";

import Lottie from "lottie-react";

import pawsPetAnimation from "@/lottie/paws-pet.json";

/**
 * 계산 중 오버레이 배경 위에 깔리는 발바닥 Lottie (Background.png 위 레이어).
 * JSON은 번들에 포함되어 오버레이와 동시에 표시된다.
 */
export function CalculatingPawsPetLottie() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
      aria-hidden
    >
      <Lottie
        animationData={pawsPetAnimation}
        loop
        className="h-full w-full [&_svg]:block [&_svg]:h-full [&_svg]:w-full [&_svg]:max-h-none [&_svg]:max-w-none"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}

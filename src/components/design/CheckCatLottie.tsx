"use client";

import Lottie from "lottie-react";
import { useEffect, useState } from "react";

const CHECK_CAT_LOTTIE_SRC = "/lottie/Check_cat.json";

/** 계산 완료 스플래시용 체크 Lottie (`loop: false`일 때 `onComplete` 호출) */
export function CheckCatLottie({
  className,
  onComplete,
}: {
  className?: string;
  onComplete?: () => void;
}) {
  const [animationData, setAnimationData] = useState<object | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(CHECK_CAT_LOTTIE_SRC)
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json();
      })
      .then((json: object) => {
        if (!cancelled) setAnimationData(json);
      })
      .catch(() => {
        /* Lottie 없이 결과만 표시 */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!animationData) return null;

  return (
    <div className={className} aria-hidden>
      <Lottie
        animationData={animationData}
        loop={false}
        onComplete={onComplete ?? undefined}
        className="h-full w-full [&_svg]:block [&_svg]:h-full [&_svg]:w-full [&_svg]:max-h-none [&_svg]:max-w-none"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}

"use client";

import Lottie from "lottie-react";
import { useEffect, useState } from "react";

const CHECK_CAT_LOTTIE_SRC = "/lottie/Check_cat.json";

/** 계산 완료(결과 화면)용 체크 고양이 Lottie */
export function CheckCatLottie({ className }: { className?: string }) {
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
        className="h-full w-full [&_svg]:block [&_svg]:h-full [&_svg]:w-full [&_svg]:max-h-none [&_svg]:max-w-none"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}

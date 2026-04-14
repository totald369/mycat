"use client";

import Lottie from "lottie-react";
import { useEffect, useState } from "react";

const SHARE_LOADER_SRC = "/lottie/Loader%20animation.json";

export function ShareLoaderLottie({ size = 40 }: { size?: number }) {
  const [animationData, setAnimationData] = useState<object | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(SHARE_LOADER_SRC)
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json();
      })
      .then((json: object) => {
        if (!cancelled) setAnimationData(json);
      })
      .catch(() => {
        if (!cancelled) setAnimationData(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!animationData) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <Lottie
        animationData={animationData}
        loop
        autoplay
        className="h-full w-full [&_svg]:block [&_svg]:h-full [&_svg]:w-full"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}

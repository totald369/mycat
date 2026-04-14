"use client";

import { useEffect, useState } from "react";
import { wizardProgressRowClass } from "@/components/design/wizardLayoutClasses";

type Props = { step: 1 | 2 | 3 };

const PCT: Record<Props["step"], number> = { 1: 33, 2: 66, 3: 100 };
/** 해당 단계 진입 시 채움 애니메이션 시작점(이전 구간 끝) */
const SEGMENT_START: Record<Props["step"], number> = { 1: 0, 2: 33, 3: 66 };

export function WizardProgress({ step }: Props) {
  const pct = PCT[step];
  const [filled, setFilled] = useState(SEGMENT_START[step]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setFilled(pct);
    });
    return () => cancelAnimationFrame(id);
  }, [pct]);

  return (
    <div className={wizardProgressRowClass}>
      <div className="flex h-[26px] w-[60px] shrink-0 items-center justify-center rounded-full bg-[#6f4425] px-1">
        <span className="text-center text-[0.75rem] leading-none tracking-tight text-white">
          STEP {step}
        </span>
      </div>
      <div className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-[rgba(248,98,12,0.2)]">
        <div
          className="h-full rounded-full bg-[#f8620c] will-change-[width]"
          style={{
            width: `${filled}%`,
            transition: "width 0.65s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      </div>
    </div>
  );
}

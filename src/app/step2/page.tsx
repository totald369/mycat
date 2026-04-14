"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { FieldLabel } from "@/components/design/FieldLabel";
import {
  PawPrimaryLink,
  PawSplitRow,
  PawWoodLink,
} from "@/components/design/PawButton";
import { WizardBottomBar } from "@/components/design/WizardBottomBar";
import { WizardHeader } from "@/components/design/WizardHeader";
import { WizardPageBackground } from "@/components/design/WizardPageBackground";
import { WizardSelectedChoiceLayers } from "@/components/design/WizardSelectedChoiceLayers";
import { WizardProgress } from "@/components/design/WizardProgress";
import { BCS_LABEL_TO_ICON } from "@/components/design/designResourcePaths";
import {
  wizardBlockWidthClass,
  wizardContentWidthClass,
  wizardPageColumnClassBarTall,
  wizardShellClass,
} from "@/components/design/wizardLayoutClasses";
import { wizardChoiceClass } from "@/components/design/wizardFieldClasses";
import { DISPLAY_BUTTON, DISPLAY_TITLE } from "@/constants/displayTextSvg";
import { patchWizardState, readWizardState } from "@/lib/wizardStorage";

const BCS = [
  "매우 마름",
  "마름",
  "정상",
  "과체중",
  "비만",
] as const;

const ACTIVITY = [
  { title: "낮음", desc: "대부분 쉬고 놀이가 적어요." },
  { title: "보통", desc: "자주 움직이고 하루 1~2번 놀아요." },
  { title: "높음", desc: "자주 뛰고 오르내리며 놀이 반응이 커요." },
] as const;

export default function Step2Page() {
  const [bcs, setBcs] = useState<string>("정상");
  const [activity, setActivity] = useState<string>("보통");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const s = readWizardState().step2;
    setBcs(s.bcs);
    setActivity(s.activity);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    patchWizardState({ step2: { bcs, activity } });
  }, [hydrated, bcs, activity]);

  const bcsBtn = (label: string) => {
    const selected = bcs === label;
    return (
      <button
        key={label}
        type="button"
        onClick={() => setBcs(label)}
        className={`relative flex w-full flex-col items-center overflow-hidden rounded-xl ${
          selected
            ? "text-white"
            : "border border-solid border-[#dedee0] bg-white text-center text-base font-medium text-[#111] transition"
        }`}
      >
        {selected ? <WizardSelectedChoiceLayers /> : null}
        <span className="relative z-10 flex w-full flex-col items-center gap-4 px-3 pb-4 pt-5 min-[360px]:px-6 min-[360px]:pt-6">
          <Image
            src={BCS_LABEL_TO_ICON[label as keyof typeof BCS_LABEL_TO_ICON]}
            alt=""
            width={106}
            height={72}
            unoptimized
            draggable={false}
            className="h-[72px] w-[106px] shrink-0 object-contain"
            aria-hidden
          />
          <span
            className={`text-center text-base ${selected ? "font-bold" : "font-medium"}`}
          >
            {label}
          </span>
        </span>
      </button>
    );
  };

  return (
    <>
      <div className={wizardShellClass}>
        <WizardPageBackground />
        <div className={wizardPageColumnClassBarTall}>
          <WizardHeader />
          <div className={wizardContentWidthClass}>
            <WizardProgress step={2} />
            <div>
              <h1>
                <Image
                  src={DISPLAY_TITLE.step2.src}
                  alt="Step 2 활동/체형"
                  width={DISPLAY_TITLE.step2.width}
                  height={DISPLAY_TITLE.step2.height}
                  className="h-auto w-auto object-contain"
                  unoptimized
                  sizes="200px"
                />
              </h1>
              <p className="mt-2 text-base leading-[1.4] text-[#555]">
                우리 아이의 체형과 활동량을 입력해주세요.
              </p>
            </div>
          </div>

          <div className={wizardBlockWidthClass}>
            <FieldLabel required>체형(BCS)</FieldLabel>
            <div className="grid grid-cols-2 gap-1">
              {BCS.slice(0, 4).map((label) => bcsBtn(label))}
            </div>
            <div className="mt-1 flex justify-start">
              <div className="w-full max-w-[161px]">{bcsBtn(BCS[4])}</div>
            </div>
          </div>

          <div className={`${wizardBlockWidthClass} pb-4`}>
            <FieldLabel required>활동량</FieldLabel>
            <div className="flex gap-1">
              {ACTIVITY.map(({ title }) => {
                const selected = activity === title;
                return (
                  <button
                    key={title}
                    type="button"
                    onClick={() => setActivity(title)}
                    className={`relative flex h-[136px] min-w-0 flex-1 flex-col justify-center overflow-hidden rounded-xl px-2 py-3 text-center ${
                      selected
                        ? "text-white"
                        : `${wizardChoiceClass} border-solid`
                    }`}
                  >
                    {selected ? <WizardSelectedChoiceLayers /> : null}
                    <span className="relative z-10 flex flex-col justify-center gap-3">
                      <span
                        className={`text-base font-bold ${selected ? "text-white" : "text-[#111]"}`}
                      >
                        {title}
                      </span>
                      <span
                        className={`text-sm leading-5 ${selected ? "text-white/95" : "text-[#333]"}`}
                      >
                        {title === "낮음" ? (
                          <>
                            대부분 쉬고
                            <br />
                            놀이가
                            <br />
                            적어요
                          </>
                        ) : title === "보통" ? (
                          <>
                            자주 움직이고 하루 1~2번
                            <br />
                            놀아요
                          </>
                        ) : (
                          <>
                            자주 뛰고
                            <br />
                            오르내리며
                            <br />
                            놀이 반응이
                            <br />
                            커요
                          </>
                        )}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <WizardBottomBar>
        <PawSplitRow
          left={
            <PawWoodLink href="/step1" className="text-center" labelSvg={DISPLAY_BUTTON.prev}>
              이전 ♧
            </PawWoodLink>
          }
          right={
            <PawPrimaryLink
              href="/step3"
              className="text-center"
              pawHalf="trailing"
              labelSvg={DISPLAY_BUTTON.next}
            >
              다음 ♧
            </PawPrimaryLink>
          }
        />
      </WizardBottomBar>
    </>
  );
}

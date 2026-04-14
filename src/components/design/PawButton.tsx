import Image from "next/image";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { designResource } from "@/components/design/designResourcePaths";
import type { DisplaySvgText } from "@/constants/displayTextSvg";

/** `none`: 가로 전체(주황 PP100 / 보조는 SP 좌·우 합성). `leading`|`trailing`: 분할 행 한 칸. */
export type PawHalf = "none" | "leading" | "trailing";

const pawLabelBase =
  "pointer-events-none absolute inset-0 z-10 flex flex-row items-center gap-1 text-[1.0625rem] leading-[1.625rem] text-white min-[360px]:gap-2 min-[360px]:text-[1.25rem] min-[360px]:leading-[1.96875rem]";

/**
 * 피그마 반쪽 발 에셋(50L/50R viewBox) 기준: 왼쪽 버튼은 색 면이 오른쪽 ~72%, 오른쪽 버튼은 왼쪽 ~72%.
 * `justify-center`만 쓰면 발 패드와 겹쳐 보이므로, 색 영역 안에서만 가운데 오도록 비대칭 패딩.
 */
function pawLabelClass(half: PawHalf): string {
  if (half === "leading") {
    return `${pawLabelBase} justify-center pl-[28%] pr-3`;
  }
  if (half === "trailing") {
    return `${pawLabelBase} justify-center pr-[28%] pl-3`;
  }
  return `${pawLabelBase} justify-center`;
}

function PawLabel({
  half,
  children,
  labelSvg,
}: {
  half: PawHalf;
  children: ReactNode;
  labelSvg?: DisplaySvgText;
}) {
  return (
    <span className={pawLabelClass(half)}>
      {labelSvg ? (
        <Image
          src={labelSvg.src}
          alt=""
          aria-hidden
          width={labelSvg.width}
          height={labelSvg.height}
          className="h-auto w-auto max-h-8 object-contain"
          unoptimized
          draggable={false}
          sizes={`${labelSvg.width}px`}
        />
      ) : (
        children
      )}
    </span>
  );
}

/** 발바닥 SVG가 박스 밖으로 살짝 나와도 잘리지 않게 `overflow-visible`, 높이는 피그마 73px 고정 */
const shell =
  "relative flex h-[4.5625rem] w-full items-center justify-center overflow-visible outline-none ring-offset-2 transition active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#f8620c]/40 disabled:opacity-50";

function FigmaPaw({
  scheme,
  half,
}: {
  scheme: "primary" | "secondary";
  half: PawHalf;
}) {
  const base =
    "pointer-events-none select-none [image-rendering:auto]";
  /** `next/image` `fill`이 absolute 포지셔닝 — object-contain으로 발·패드 잘림 방지 */
  const fit = `${base} object-contain object-center`;

  const pawSizes = "(max-width: 480px) 50vw, 200px";

  if (scheme === "primary" && half === "none") {
    return (
      <Image
        src={designResource.pawPrimaryFull}
        alt=""
        aria-hidden
        fill
        unoptimized
        draggable={false}
        sizes={pawSizes}
        className={fit}
      />
    );
  }

  if (scheme === "primary" && half === "leading") {
    return (
      <Image
        src={designResource.pawPrimaryLeading}
        alt=""
        aria-hidden
        fill
        unoptimized
        draggable={false}
        sizes={pawSizes}
        className={fit}
      />
    );
  }

  if (scheme === "primary" && half === "trailing") {
    return (
      <Image
        src={designResource.pawPrimaryTrailing}
        alt=""
        aria-hidden
        fill
        unoptimized
        draggable={false}
        sizes={pawSizes}
        className={fit}
      />
    );
  }

  if (scheme === "secondary" && half === "leading") {
    return (
      <Image
        src={designResource.pawSecondaryLeading}
        alt=""
        aria-hidden
        fill
        unoptimized
        draggable={false}
        sizes={pawSizes}
        className={fit}
      />
    );
  }

  if (scheme === "secondary" && half === "trailing") {
    return (
      <Image
        src={designResource.pawSecondaryTrailing}
        alt=""
        aria-hidden
        fill
        unoptimized
        draggable={false}
        sizes={pawSizes}
        className={fit}
      />
    );
  }

  /* secondary + full: SP 좌·우를 이어 전체 폭 발바닥 */
  return (
    <div className="absolute inset-0 flex w-full overflow-visible">
      <div className="relative h-full min-h-0 w-1/2">
        <Image
          src={designResource.pawSecondaryLeading}
          alt=""
          aria-hidden
          fill
          unoptimized
          draggable={false}
          sizes={pawSizes}
          className={`${base} object-contain object-right`}
        />
      </div>
      <div className="relative h-full min-h-0 w-1/2">
        <Image
          src={designResource.pawSecondaryTrailing}
          alt=""
          aria-hidden
          fill
          unoptimized
          draggable={false}
          sizes={pawSizes}
          className={`${base} object-contain object-left`}
        />
      </div>
    </div>
  );
}

export function PawPrimaryButton(
  props: ComponentProps<"button"> & { pawHalf?: PawHalf; labelSvg?: DisplaySvgText },
) {
  const { className, children, pawHalf = "none", labelSvg, ...rest } = props;
  return (
    <button type="button" className={`${shell} ${className ?? ""}`} {...rest}>
      <FigmaPaw scheme="primary" half={pawHalf} />
      <PawLabel half={pawHalf} labelSvg={labelSvg}>
        {children}
      </PawLabel>
    </button>
  );
}

export function PawWoodButton(
  props: ComponentProps<"button"> & { pawHalf?: PawHalf; labelSvg?: DisplaySvgText },
) {
  const { className, children, pawHalf = "none", labelSvg, ...rest } = props;
  return (
    <button type="button" className={`${shell} ${className ?? ""}`} {...rest}>
      <FigmaPaw scheme="secondary" half={pawHalf} />
      <PawLabel half={pawHalf} labelSvg={labelSvg}>
        {children}
      </PawLabel>
    </button>
  );
}

export function PawPrimaryLink(
  props: ComponentProps<typeof Link> & { pawHalf?: PawHalf; labelSvg?: DisplaySvgText },
) {
  const { className, children, pawHalf = "none", labelSvg, ...rest } = props;
  return (
    <Link className={`${shell} ${className ?? ""}`} {...rest}>
      <FigmaPaw scheme="primary" half={pawHalf} />
      <PawLabel half={pawHalf} labelSvg={labelSvg}>
        {children}
      </PawLabel>
    </Link>
  );
}

export function PawWoodLink(
  props: ComponentProps<typeof Link> & { pawHalf?: PawHalf; labelSvg?: DisplaySvgText },
) {
  const { className, children, pawHalf = "leading", labelSvg, ...rest } = props;
  return (
    <Link className={`${shell} ${className ?? ""}`} {...rest}>
      <FigmaPaw scheme="secondary" half={pawHalf} />
      <PawLabel half={pawHalf} labelSvg={labelSvg}>
        {children}
      </PawLabel>
    </Link>
  );
}

export function PawSplitRow({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <div className="flex gap-[4px] overflow-visible">
      <div className="min-w-0 flex-1 overflow-visible">{left}</div>
      <div className="min-w-0 flex-1 overflow-visible">{right}</div>
    </div>
  );
}

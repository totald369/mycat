import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { homeFigma } from "@/components/design/homeFigmaPaths";

/** `none`: 가로 전체(주황 PP100 / 보조는 SP 좌·우 합성). `leading`|`trailing`: 분할 행 한 칸. */
export type PawHalf = "none" | "leading" | "trailing";

const pawLabelBase =
  "pointer-events-none absolute inset-0 z-10 flex flex-row items-center gap-2 font-display text-[20px] leading-[31.5px] text-white";

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

/** 발바닥 SVG가 박스 밖으로 살짝 나와도 잘리지 않게 `overflow-visible`, 높이는 피그마 73px 고정 */
const shell =
  "relative flex h-[73px] w-full items-center justify-center overflow-visible outline-none ring-offset-2 transition active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#f8620c]/40 disabled:opacity-50";

function FigmaPaw({
  scheme,
  half,
}: {
  scheme: "primary" | "secondary";
  half: PawHalf;
}) {
  const base =
    "pointer-events-none select-none [image-rendering:auto]";
  /** 전체 그래픽이 보이도록 contain — cover/fill은 발·패드가 잘림 */
  const fit = `${base} absolute inset-0 m-auto h-full w-full max-h-[73px] object-contain object-center`;

  if (scheme === "primary" && half === "none") {
    return (
      <img
        src={homeFigma.pawBtn100}
        alt=""
        aria-hidden
        draggable={false}
        className={fit}
      />
    );
  }

  if (scheme === "primary" && half === "leading") {
    return (
      <img
        src={homeFigma.pawBtn50L_PP}
        alt=""
        aria-hidden
        draggable={false}
        className={fit}
      />
    );
  }

  if (scheme === "primary" && half === "trailing") {
    return (
      <img
        src={homeFigma.pawBtn50R_PP}
        alt=""
        aria-hidden
        draggable={false}
        className={fit}
      />
    );
  }

  if (scheme === "secondary" && half === "leading") {
    return (
      <img
        src={homeFigma.pawBtn50L_SP}
        alt=""
        aria-hidden
        draggable={false}
        className={fit}
      />
    );
  }

  if (scheme === "secondary" && half === "trailing") {
    return (
      <img
        src={homeFigma.pawBtn50R_SP}
        alt=""
        aria-hidden
        draggable={false}
        className={fit}
      />
    );
  }

  /* secondary + full: SP 좌·우를 이어 전체 폭 발바닥 */
  return (
    <div className="absolute inset-0 flex w-full overflow-visible">
      <img
        src={homeFigma.pawBtn50L_SP}
        alt=""
        aria-hidden
        draggable={false}
        className={`${base} h-full min-h-0 w-1/2 object-contain object-right`}
      />
      <img
        src={homeFigma.pawBtn50R_SP}
        alt=""
        aria-hidden
        draggable={false}
        className={`${base} h-full min-h-0 w-1/2 object-contain object-left`}
      />
    </div>
  );
}

export function PawPrimaryButton(
  props: ComponentProps<"button"> & { pawHalf?: PawHalf },
) {
  const { className, children, pawHalf = "none", ...rest } = props;
  return (
    <button type="button" className={`${shell} ${className ?? ""}`} {...rest}>
      <FigmaPaw scheme="primary" half={pawHalf} />
      <span className={pawLabelClass(pawHalf)}>{children}</span>
    </button>
  );
}

export function PawWoodButton(
  props: ComponentProps<"button"> & { pawHalf?: PawHalf },
) {
  const { className, children, pawHalf = "none", ...rest } = props;
  return (
    <button type="button" className={`${shell} ${className ?? ""}`} {...rest}>
      <FigmaPaw scheme="secondary" half={pawHalf} />
      <span className={pawLabelClass(pawHalf)}>{children}</span>
    </button>
  );
}

export function PawPrimaryLink(
  props: ComponentProps<typeof Link> & { pawHalf?: PawHalf },
) {
  const { className, children, pawHalf = "none", ...rest } = props;
  return (
    <Link className={`${shell} ${className ?? ""}`} {...rest}>
      <FigmaPaw scheme="primary" half={pawHalf} />
      <span className={pawLabelClass(pawHalf)}>{children}</span>
    </Link>
  );
}

export function PawWoodLink(
  props: ComponentProps<typeof Link> & { pawHalf?: PawHalf },
) {
  const { className, children, pawHalf = "leading", ...rest } = props;
  return (
    <Link className={`${shell} ${className ?? ""}`} {...rest}>
      <FigmaPaw scheme="secondary" half={pawHalf} />
      <span className={pawLabelClass(pawHalf)}>{children}</span>
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

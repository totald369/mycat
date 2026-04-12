"use client";

import {
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

export type MarqueeItemBase = { id: string };

export type InfiniteMarqueeProps<T extends MarqueeItemBase> = {
  items: readonly T[];
  renderItem: (item: T, indexInOriginal: number) => ReactNode;
  /** Fixed card width in px */
  cardWidth?: number;
  /** Gap between cards (and between the two sets) in px */
  gap?: number;
  /** Seconds for one full loop (scroll by exactly one set width) */
  durationSec?: number;
  className?: string;
};

/**
 * Seamless horizontal marquee: two identical flex rows, CSS linear animation
 * by measured distance (first set width including trailing gap).
 */
export function InfiniteMarquee<T extends MarqueeItemBase>({
  items,
  renderItem,
  cardWidth = 220,
  gap = 16,
  durationSec = 15,
  className = "",
}: InfiniteMarqueeProps<T>) {
  const reactId = useId().replace(/:/g, "");
  const setMeasureRef = useRef<HTMLDivElement>(null);
  const [loopPx, setLoopPx] = useState(0);

  const n = items.length;
  const fallbackLoop =
    n > 0 ? n * cardWidth + n * gap : 0;

  const measure = () => {
    const el = setMeasureRef.current;
    if (!el) return;
    const w = el.getBoundingClientRect().width;
    if (w > 0) setLoopPx(Math.round(w * 1000) / 1000);
  };

  useLayoutEffect(() => {
    measure();
    const el = setMeasureRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    return () => ro.disconnect();
  }, [items, n, cardWidth, gap]);

  const distance = loopPx > 0 ? loopPx : fallbackLoop;
  const keyframeName = `marquee-x-${reactId}`;

  const keyframesBlock = useMemo(() => {
    if (distance <= 0) return "";
    return `@keyframes ${keyframeName} {
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(-${distance}px, 0, 0); }
}`;
  }, [distance, keyframeName]);

  const trackStyle: CSSProperties = {
    animation:
      distance > 0
        ? `${keyframeName} ${durationSec}s linear infinite`
        : undefined,
    willChange: "transform",
  };

  if (n === 0) return null;

  return (
    <>
      {keyframesBlock ? (
        <style dangerouslySetInnerHTML={{ __html: keyframesBlock }} />
      ) : null}
      <div
        className={`infinite-marquee-root overflow-hidden ${className}`}
        data-marquee
      >
        <div
          className="infinite-marquee-track flex w-max"
          style={trackStyle}
        >
          <div
            ref={setMeasureRef}
            className="flex shrink-0"
            style={{
              gap,
              paddingRight: gap,
            }}
          >
            {items.map((item, i) => (
              <div
                key={item.id}
                className="shrink-0"
                style={{ width: cardWidth, minWidth: cardWidth }}
              >
                {renderItem(item, i)}
              </div>
            ))}
          </div>
          <div
            className="flex shrink-0"
            style={{ gap }}
            aria-hidden
          >
            {items.map((item, i) => (
              <div
                key={`${item.id}-dup`}
                className="shrink-0"
                style={{ width: cardWidth, minWidth: cardWidth }}
              >
                {renderItem(item, i)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export const MARQUEE_DUMMY_ITEMS: readonly MarqueeItemBase[] = [
  { id: "dummy-1" },
  { id: "dummy-2" },
  { id: "dummy-3" },
];

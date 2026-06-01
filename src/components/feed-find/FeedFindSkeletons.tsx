const SKELETON_CARD_COUNT = 4;

export function FeedFindCardSkeleton() {
  return (
    <div
      className="animate-pulse rounded-xl border border-[#eee] bg-white p-4"
      aria-hidden
    >
      <div className="h-3 w-16 rounded bg-[#f0ebe6]" />
      <div className="mt-2 h-4 w-3/4 rounded bg-[#f0ebe6]" />
      <div className="mt-3 flex gap-1.5">
        <div className="h-5 w-12 rounded-md bg-[#f0ebe6]" />
        <div className="h-5 w-14 rounded-md bg-[#f0ebe6]" />
      </div>
      <div className="mt-3 h-4 w-28 rounded bg-[#f0ebe6]" />
      <div className="mt-3 h-10 w-full rounded-lg bg-[#f0ebe6]" />
    </div>
  );
}

export function FeedFindPopularSkeleton() {
  return (
    <section className="mt-4 px-4" aria-hidden>
      <div className="h-4 w-24 animate-pulse rounded bg-[#f0ebe6]" />
      <div className="mt-2 flex gap-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-[52px] w-[140px] shrink-0 animate-pulse rounded-xl bg-[#f0ebe6]"
          />
        ))}
      </div>
    </section>
  );
}

export function FeedFindListSkeleton() {
  return (
    <ul className="mt-4 flex flex-col gap-3 px-4 pb-28" aria-hidden>
      {Array.from({ length: SKELETON_CARD_COUNT }, (_, i) => (
        <li key={i}>
          <FeedFindCardSkeleton />
        </li>
      ))}
    </ul>
  );
}

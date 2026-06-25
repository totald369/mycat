const SKELETON_CARD_COUNT = 4;

export function FeedFindCardSkeleton() {
  return (
    <div
      className="w-full max-w-[343px] animate-pulse rounded-2xl bg-white px-6 py-8 shadow-[0px_8px_16px_rgba(17,17,17,0.06)]"
      aria-hidden
    >
      <div className="flex gap-1">
        <div className="h-6 w-14 rounded-md bg-[#f0ebe6]" />
        <div className="h-6 w-12 rounded-md bg-[#f0ebe6]" />
      </div>
      <div className="mt-3 h-5 w-3/4 rounded bg-[#f0ebe6]" />
      <div className="mt-2 h-4 w-40 rounded bg-[#f0ebe6]" />
    </div>
  );
}

export function FeedFindListSkeleton() {
  return (
    <ul className="flex w-full flex-col items-center gap-3 pb-8" aria-hidden>
      {Array.from({ length: SKELETON_CARD_COUNT }, (_, i) => (
        <li key={i}>
          <FeedFindCardSkeleton />
        </li>
      ))}
    </ul>
  );
}

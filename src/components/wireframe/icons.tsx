export function IconCalendar({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
    </svg>
  );
}

/** 피그마 `back_32` — 급여 검색 시트 상단 뒤로가기 */
export function IconBack({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
    >
      <path
        d="M19 8L11 16l8 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconSearch({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4-4" strokeLinecap="round" />
    </svg>
  );
}

export function IconClose({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}

export function IconPlus({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

export function IconCheckCircle({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="64"
      height="64"
      viewBox="0 0 64 64"
      aria-hidden
    >
      <circle cx="32" cy="32" r="32" fill="#000" />
      <path
        d="M18 33l10 10 18-22"
        fill="none"
        stroke="#fff"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconRefresh({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path
        d="M4 12a8 8 0 0114.9-4M20 12a8 8 0 01-14.9 4"
        strokeLinecap="round"
      />
      <path d="M18 2v6h-6M6 22v-6h6" strokeLinecap="round" />
    </svg>
  );
}

export function IconShare({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path d="M12 3v10M8 7l4-4 4 4" strokeLinecap="round" />
      <rect x="4" y="13" width="16" height="8" rx="1" />
    </svg>
  );
}

/** SEO 부스트 — OpenAI 생성 콘텐츠 */
export function IconSparkles({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 2l1.2 4.2L17.5 7.5 13.2 8.7 12 13l-1.2-4.3L6.5 7.5l4.3-1.3L12 2zM5 14l.8 2.8L8.5 17.5 5.8 18.3 5 21l-.8-2.7L1.5 17.5l2.7-.7L5 14zm14 0l.8 2.8 2.7.7-2.7.8L19 21l-.8-2.7-2.7-.8 2.7-.7L19 14z" />
    </svg>
  );
}

/** SEO 부스트 — 규칙 기반 자동 작성 */
export function IconAutoText({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path d="M7 7h10M7 12h6M7 17h8" strokeLinecap="round" />
      <rect x="4" y="4" width="16" height="16" rx="2" />
    </svg>
  );
}

export function CatSilhouette({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 88 56"
      fill="currentColor"
      aria-hidden
    >
      <path d="M8 44c0-8 6-22 18-26 2-8 8-12 14-10 4-6 12-8 18-4 2 2 3 6 2 10l4 2c6 4 8 14 6 22-1 4-4 6-8 6H10c-2 0-4-2-4-4h2z" />
    </svg>
  );
}

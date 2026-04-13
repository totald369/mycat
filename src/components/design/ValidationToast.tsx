"use client";

type ValidationToastProps = {
  message: string;
};

export function ValidationToast({ message }: ValidationToastProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="pointer-events-none fixed bottom-[calc(6.5rem+env(safe-area-inset-bottom,0px))] left-1/2 z-[220] w-[calc(100%-32px)] max-w-[343px] -translate-x-1/2 overflow-hidden rounded-2xl border border-[#f8620c]/30 bg-[#fffaf6] px-4 py-3 text-center shadow-[0px_12px_28px_rgba(17,17,17,0.16)]"
    >
      <p className="font-display text-base leading-none text-[#f8620c]">
        입력 확인 필요
      </p>
      <p className="mt-1 text-sm font-semibold leading-5 text-[#171717]">{message}</p>
    </div>
  );
}

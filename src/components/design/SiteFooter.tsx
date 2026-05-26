export function SiteFooter({ className = "" }: { className?: string }) {
  return (
    <footer
      className={`mx-auto w-full max-w-[min(327px,100%)] border-t border-[#e8e4df] pt-8 text-center text-sm leading-relaxed text-[#888] ${className}`.trim()}
    >
      <p>2026 우리냥이맘마. All rights reserved.</p>
    </footer>
  );
}

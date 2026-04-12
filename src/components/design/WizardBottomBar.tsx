import type { ReactNode } from "react";

export function WizardBottomBar({ children }: { children: ReactNode }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 overflow-x-clip overflow-y-visible bg-gradient-to-t from-white from-40% via-white/95 to-transparent pb-4 pt-10">
      <div className="mx-auto box-border w-full max-w-[375px] overflow-x-clip overflow-y-visible px-4">
        {children}
      </div>
    </div>
  );
}

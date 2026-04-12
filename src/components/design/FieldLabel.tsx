import type { ReactNode } from "react";

export function FieldLabel({
  children,
  required,
}: {
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <div className="mb-2 flex items-start gap-0.5 text-sm font-semibold text-[#555]">
      {children}
      {required ? <span className="text-[#fd5c5c]">*</span> : null}
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId } from "react";

import { AppLogo } from "@/components/design/AppLogo";
import { WizardSelectedChoiceLayers } from "@/components/design/WizardSelectedChoiceLayers";
import { wizardModalOverlayClass, wizardModalPanelClass } from "@/components/design/wizardLayoutClasses";
import {
  isSiteMenuItemActive,
  SITE_MENU_ITEMS,
  type SiteMenuItem,
} from "@/lib/siteMenu";
import { IconClose } from "@/components/wireframe/icons";

type SiteMenuLayerProps = {
  id: string;
  open: boolean;
  onClose: () => void;
};

function SiteMenuLink({
  item,
  active,
  onClose,
}: {
  item: SiteMenuItem;
  active: boolean;
  onClose: () => void;
}) {
  return (
    <Link
      href={item.href}
      prefetch={false}
      aria-current={active ? "page" : undefined}
      className={
        active
          ? "relative block overflow-hidden rounded-xl px-4 py-3.5 text-sm font-semibold text-white"
          : "block rounded-xl px-4 py-3.5 text-sm font-normal text-[#111] active:bg-[#f5f1ed]"
      }
      onClick={onClose}
    >
      {active ? <WizardSelectedChoiceLayers /> : null}
      <span className="relative z-10">{item.label}</span>
    </Link>
  );
}

/** 피그마 Menu Layer(315:54) — 전역 메뉴 오버레이 */
export function SiteMenuLayer({ id, open, onClose }: SiteMenuLayerProps) {
  const titleId = useId();
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={wizardModalOverlayClass}>
      <div
        id={id}
        className={`${wizardModalPanelClass} bg-white`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
      <h2 id={titleId} className="sr-only">
        메뉴
      </h2>

      <header className="flex w-full shrink-0 items-center bg-white px-6 pb-4 pt-[calc(env(safe-area-inset-top,0px)+16px)]">
        <div className="grid w-full grid-cols-[24px_1fr_24px] items-center gap-2">
          <button
            type="button"
            aria-label="메뉴 닫기"
            className="flex size-6 shrink-0 items-center justify-center rounded-sm text-[#171717] outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-[#f8620c]/40"
            onClick={onClose}
          >
            <IconClose className="size-[18px]" />
          </button>
          <div className="flex justify-center">
            <AppLogo />
          </div>
          <span className="size-6 shrink-0" aria-hidden />
        </div>
      </header>

      <nav className="min-h-0 flex-1 overflow-y-auto px-6 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <ul className="flex flex-col gap-1">
          {SITE_MENU_ITEMS.map((item) => (
            <li key={item.href}>
              <SiteMenuLink
                item={item}
                active={isSiteMenuItemActive(pathname, item)}
                onClose={onClose}
              />
            </li>
          ))}
        </ul>
      </nav>
      </div>
    </div>
  );
}

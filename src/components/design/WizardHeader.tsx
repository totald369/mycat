"use client";

import type { ReactNode } from "react";
import { useCallback, useId, useState } from "react";
import Image from "next/image";

import { AppLogo } from "@/components/design/AppLogo";
import { designResource } from "@/components/design/designResourcePaths";
import { SiteMenuLayer } from "@/components/design/SiteMenuLayer";

type WizardHeaderProps = {
  /** 결과 화면 등: 우측 액션(예: 이미지 저장). 없으면 24px 균형 스페이서 */
  trailing?: ReactNode;
};

const headerShellClass =
  "absolute left-0 top-0 z-10 w-full bg-transparent px-6 pb-4 pt-[calc(env(safe-area-inset-top,0px)+16px)]";

const headerRowClass =
  "grid w-full grid-cols-[24px_1fr_auto] items-center gap-2";

function HeaderMenuButton({
  menuId,
  expanded,
  onOpen,
}: {
  menuId: string;
  expanded: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      className="flex size-6 shrink-0 items-center justify-center rounded-sm outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-[#f8620c]/40"
      aria-label="메뉴"
      aria-expanded={expanded}
      aria-controls={menuId}
      onClick={onOpen}
    >
      <Image
        src={designResource.iconMenu}
        alt=""
        width={24}
        height={24}
        className="size-6 object-contain"
        unoptimized
        draggable={false}
      />
    </button>
  );
}

/** 전 페이지 공통 — 좌 메뉴 · 중앙 로고 · 우측 액션(또는 균형 스페이서) */
export function WizardHeader({ trailing }: WizardHeaderProps) {
  const menuId = useId();
  const [menuOpen, setMenuOpen] = useState(false);
  const openMenu = useCallback(() => setMenuOpen(true), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <>
      <header className={headerShellClass}>
        <div className={headerRowClass}>
          <HeaderMenuButton
            menuId={menuId}
            expanded={menuOpen}
            onOpen={openMenu}
          />
          <div className="flex justify-center">
            <AppLogo />
          </div>
          {trailing ?? <span className="size-6 shrink-0" aria-hidden />}
        </div>
      </header>
      <SiteMenuLayer id={menuId} open={menuOpen} onClose={closeMenu} />
    </>
  );
}

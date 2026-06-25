"use client";

import Image from "next/image";
import { useCallback, useId, useState } from "react";

import { AppLogo } from "@/components/design/AppLogo";
import { SiteMenuLayer } from "@/components/design/SiteMenuLayer";
import { IMAGE_ALT } from "@/constants/imageAlt";

/** 사료 찾기 전용 헤더 — Figma 306:12222 (로고 좌 · 메뉴 우 · backdrop blur) */
export function FeedFindHeader() {
  const menuId = useId();
  const [menuOpen, setMenuOpen] = useState(false);
  const openMenu = useCallback(() => setMenuOpen(true), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <>
      <header className="absolute left-0 top-0 z-10 flex w-full items-center justify-between bg-white/80 px-6 pb-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] backdrop-blur-[12px]">
        <AppLogo />
        <button
          type="button"
          className="flex size-6 shrink-0 items-center justify-center rounded-sm outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-[#f8620c]/40"
          aria-label="메뉴"
          aria-expanded={menuOpen}
          aria-controls={menuId}
          onClick={openMenu}
        >
          <Image
            src="/icons/feed-find/menu.svg"
            alt={IMAGE_ALT.menu}
            width={24}
            height={24}
            className="size-6 object-contain"
            unoptimized
            draggable={false}
          />
        </button>
      </header>
      <SiteMenuLayer id={menuId} open={menuOpen} onClose={closeMenu} />
    </>
  );
}

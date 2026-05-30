"use client";

import {
  FeedSearchView,
  type FeedSearchViewProps,
} from "@/components/wireframe/FeedSearchView";
import type { CatalogItem } from "@/components/wireframe/CatalogSearchModal";

type Props = {
  open: boolean;
  initialQuery: string;
  onClose: () => void;
  onSelect: (item: CatalogItem) => void;
};

export function FeedSearchModal({
  open,
  initialQuery,
  onClose,
  onSelect,
}: Props) {
  if (!open) return null;

  const viewProps: FeedSearchViewProps = {
    layout: "modal",
    initialQuery,
    onClose,
    onSelect,
    title: "급여 종류",
    titleId: "feed-modal-title",
  };

  return <FeedSearchView {...viewProps} />;
}

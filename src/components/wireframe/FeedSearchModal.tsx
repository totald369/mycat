"use client";

import {
  CatalogSearchModal,
  type CatalogItem,
} from "@/components/wireframe/CatalogSearchModal";
import { FEED_REQUEST_HREF } from "@/constants/feedRequest";

type Props = {
  open: boolean;
  initialQuery: string;
  onClose: () => void;
  onSelect: (item: CatalogItem) => void;
};

export function FeedSearchModal(props: Props) {
  return (
    <CatalogSearchModal
      {...props}
      title="급여 종류"
      titleId="feed-modal-title"
      placeholder="예: 아카나"
      fetchUrl="/api/feeds"
      loadErrorMessage="급여(사료) 목록을 불러오지 못했습니다."
      emptyDbHint={
        <>
          CSV 사료 목록이 없습니다.{" "}
          <code className="rounded bg-neutral-100 px-1 text-xs">
            prisma/cat_food.csv
          </code>{" "}
          를 채운 뒤 터미널에서{" "}
          <code className="rounded bg-neutral-100 px-1 text-xs">
            npm run db:seed:csv
          </code>
          를 실행해 주세요.
        </>
      }
      feedRequestHref={FEED_REQUEST_HREF}
      variant="feed"
    />
  );
}

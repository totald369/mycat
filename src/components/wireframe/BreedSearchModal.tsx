"use client";

import { CatalogSearchModal } from "@/components/wireframe/CatalogSearchModal";

type Props = {
  open: boolean;
  initialQuery: string;
  onClose: () => void;
  onSelect: (label: string) => void;
};

export function BreedSearchModal(props: Props) {
  return (
    <CatalogSearchModal
      {...props}
      onSelect={(item) => props.onSelect(item.label)}
      title="품종"
      titleId="breed-modal-title"
      placeholder="샴, 브리티시 숏헤어..."
      fetchUrl="/api/breeds"
      loadErrorMessage="품종 목록을 불러오지 못했습니다."
      emptyDbHint={
        <>
          품종 DB가 비어 있습니다. 터미널에서{" "}
          <code className="rounded bg-neutral-100 px-1 text-xs">
            npm run db:push
          </code>{" "}
          후{" "}
          <code className="rounded bg-neutral-100 px-1 text-xs">
            npm run db:seed
          </code>
          를 실행해 주세요.
        </>
      }
    />
  );
}

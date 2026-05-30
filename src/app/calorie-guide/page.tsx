import type { Metadata } from "next";

import { InfoGuidePage } from "@/components/info-guide/InfoGuidePage";
import {
  buildInfoGuideMetadata,
  getInfoGuidePage,
} from "@/lib/infoGuidePages";

const PAGE_PATH = "/calorie-guide";

export const metadata: Metadata = buildInfoGuideMetadata(PAGE_PATH);

export default function CalorieGuidePage() {
  const page = getInfoGuidePage(PAGE_PATH);
  if (!page) return null;

  return <InfoGuidePage page={page} />;
}

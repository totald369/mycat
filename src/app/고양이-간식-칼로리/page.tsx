import type { Metadata } from "next";
import { SeoLandingPage } from "@/components/seo/SeoLandingPage";
import { buildSeoMetadata, getSeoLandingPage } from "@/lib/seoLandingPages";

const PAGE_PATH = "/고양이-간식-칼로리";

export const metadata: Metadata = buildSeoMetadata(PAGE_PATH);

export default function CatSnackCalorieKoPage() {
  return <SeoLandingPage page={getSeoLandingPage(PAGE_PATH)} />;
}

import { redirect } from "next/navigation";
import { getUrlByShortId } from "@/lib/urlShortenerStore";

export const runtime = "nodejs";

/**
 * If id exists in the JSON shortener store → redirect to the stored full URL.
 * Otherwise → legacy Prisma share flow via `?sid=`.
 */
export default async function ShortLinkRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const mapped = await getUrlByShortId(id);
  if (mapped) {
    redirect(mapped);
  }

  redirect(`/result?sid=${encodeURIComponent(id)}`);
}

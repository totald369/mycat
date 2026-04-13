import { redirect } from "next/navigation";

export default async function SharedResultRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/result?sid=${encodeURIComponent(id)}`);
}

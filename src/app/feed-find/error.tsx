"use client";

import { FeedRouteErrorFallback } from "@/components/feed/FeedRouteErrorFallback";

export default function FeedFindError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <FeedRouteErrorFallback {...props} />;
}

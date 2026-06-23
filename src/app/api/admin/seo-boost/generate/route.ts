import { NextResponse } from "next/server";

import { adminUnauthorizedResponse, verifyAdminSecret } from "@/lib/adminAuth";
import { generateSeoBoostForPilot } from "@/lib/feedSeoBoostService";

export const maxDuration = 300;

export async function POST(request: Request) {
  if (!verifyAdminSecret(request)) return adminUnauthorizedResponse();

  if (!process.env.OPENAI_API_KEY?.trim()) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY가 설정되지 않았습니다." },
      { status: 503 },
    );
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      force?: boolean;
      feedApiIds?: string[];
    };
    const result = await generateSeoBoostForPilot({
      force: Boolean(body.force),
      feedApiIds: Array.isArray(body.feedApiIds) ? body.feedApiIds : undefined,
    });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}

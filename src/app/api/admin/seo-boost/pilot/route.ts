import { NextResponse } from "next/server";

import { adminUnauthorizedResponse, verifyAdminSecret } from "@/lib/adminAuth";
import {
  getAdminSeoBoostStatus,
  savePilotFeedApiIds,
} from "@/lib/feedSeoBoostService";
import { SEO_BOOST_PILOT_MAX } from "@/lib/feedSeoBoostTypes";

export async function GET(request: Request) {
  if (!verifyAdminSecret(request)) return adminUnauthorizedResponse();

  try {
    const status = await getAdminSeoBoostStatus();
    return NextResponse.json({
      ...status,
      max: SEO_BOOST_PILOT_MAX,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  if (!verifyAdminSecret(request)) return adminUnauthorizedResponse();

  try {
    const body = (await request.json()) as {
      feedApiIds?: string[];
      notes?: Record<string, string>;
    };
    const feedApiIds = Array.isArray(body.feedApiIds) ? body.feedApiIds : [];
    const saved = await savePilotFeedApiIds(feedApiIds, body.notes);
    return NextResponse.json({ feedApiIds: saved });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 400 },
    );
  }
}

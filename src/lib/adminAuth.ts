import { NextResponse } from "next/server";

export function verifyAdminSecret(request: Request): boolean {
  const secret = process.env.ADMIN_SECRET?.trim();
  if (!secret) return false;
  const header = request.headers.get("x-admin-secret")?.trim();
  const auth = request.headers.get("authorization");
  const bearer = auth?.startsWith("Bearer ")
    ? auth.slice("Bearer ".length).trim()
    : null;
  return header === secret || bearer === secret;
}

export function adminUnauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

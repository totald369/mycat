/** Matches Prisma shortId + file-store ids used in /api/share/[id] */
const SHARE_ID_RE = /^[A-Za-z0-9_-]{6,32}$/;

/**
 * Resolves a short share id from a raw `sid` query value (possibly double-URL-encoded
 * or suffixed with garbage after a valid id).
 */
export function resolveShareShortId(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  let s = String(raw).trim();
  if (!s) return null;

  for (let i = 0; i < 3; i++) {
    try {
      const d = decodeURIComponent(s);
      if (d === s) break;
      s = d;
    } catch {
      break;
    }
  }

  if (SHARE_ID_RE.test(s)) return s;

  const leading = s.match(/^([A-Za-z0-9_-]{6,32})/);
  if (leading?.[1] && SHARE_ID_RE.test(leading[1])) return leading[1];

  const stripped = s.replace(/^(%[0-9A-Fa-f]{2})+/i, "");
  const leading2 = stripped.match(/^([A-Za-z0-9_-]{6,32})/);
  if (leading2?.[1] && SHARE_ID_RE.test(leading2[1])) return leading2[1];

  return null;
}

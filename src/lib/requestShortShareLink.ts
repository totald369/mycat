/**
 * POST /api/share 로 단축 ID를 받아 `origin/r/{id}` 형태의 URL을 만듭니다.
 * 일시적 네트워크·DB 오류에 대비해 몇 번 재시도합니다.
 */
const ID_RE = /^[A-Za-z0-9_-]{6,32}$/;
const ATTEMPTS = 3;

export async function requestShortShareLink(
  encoded: string,
  origin: string,
): Promise<string | null> {
  for (let i = 0; i < ATTEMPTS; i++) {
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ encoded }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        id?: string;
        error?: string;
      };
      if (res.ok) {
        const id = (data.id ?? "").trim();
        if (id && ID_RE.test(id)) {
          return new URL(`/r/${encodeURIComponent(id)}`, origin).toString();
        }
      }
    } catch {
      /* 네트워크 오류 — 재시도 */
    }
    if (i < ATTEMPTS - 1) {
      await new Promise((r) => setTimeout(r, 280 * (i + 1)));
    }
  }
  return null;
}

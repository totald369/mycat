/** 우리냥이 사료 추가 요청 (Google Forms 공개 폼) */
const DEFAULT_FEED_REQUEST_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSd7VHcPHzbv_Yco4xvmUW9mzK8Tn1UxQwoQ6z1FJP0ueKKDmA/viewform?usp=sharing";

/**
 * TODO: Google Form prefill — 폼 편집 화면에서 해당 질문의 entry ID 확인 후 아래 주석 해제.
 * 예: `entry.1234567890`
 */
// const FEED_REQUEST_SEARCH_ENTRY_ID = "entry.REPLACE_ME";

function optionalEnvUrl(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_FEED_REQUEST_URL;
  if (raw == null) return undefined;
  const t = raw.trim();
  return t === "" ? undefined : t;
}

/**
 * 사료 추가 요청(구글 폼 등).
 * `NEXT_PUBLIC_FEED_REQUEST_URL`이 비어 있으면 위 기본 폼으로 연결합니다.
 */
export const FEED_REQUEST_HREF =
  optionalEnvUrl() ?? DEFAULT_FEED_REQUEST_FORM_URL;

/** no-result 등에서 검색어를 요청 폼으로 전달 (prefill entry ID 확정 전까지는 기본 URL) */
export function buildFeedRequestHref(searchKeyword?: string): string {
  const keyword = searchKeyword?.trim();
  if (!keyword) return FEED_REQUEST_HREF;

  // TODO: entry ID 확정 시 prefill 활성화
  // const base = FEED_REQUEST_HREF.split("?")[0];
  // return `${base}?usp=pp_url&entry.${FEED_REQUEST_SEARCH_ENTRY_ID}=${encodeURIComponent(keyword)}`;

  return FEED_REQUEST_HREF;
}

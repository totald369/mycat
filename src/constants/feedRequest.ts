/** 우리냥이 사료 추가 요청 (Google Forms 공개 폼) */
const DEFAULT_FEED_REQUEST_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSd7VHcPHzbv_Yco4xvmUW9mzK8Tn1UxQwoQ6z1FJP0ueKKDmA/viewform?usp=sharing";

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

/**
 * Step3 「결과보기」 직후 오버레이에서 재생할 영상.
 * `public/videos/step2-calculating/` 내 파일명과 맞추세요.
 */
const FILES = ["step2-calculating-1.mp4", "step2-calculating-2.mp4"] as const;

const BASE = "/videos/step2-calculating";

export const CALCULATING_OVERLAY_VIDEOS = FILES.map(
  (name) => `${BASE}/${name}`,
);

/**
 * `public/videos/step2-calculating/` 안의 실제 파일명과 맞추세요.
 * (이름만 바꾸면 됩니다. 경로 접두사는 고정입니다.)
 */
const STEP2_CALCULATING_FILES = [
  "step2-calculating-1.mp4",
  "step2-calculating-2.mp4",
] as const;

const BASE = "/videos/step2-calculating";

export const STEP2_CALCULATING_VIDEOS = STEP2_CALCULATING_FILES.map(
  (name) => `${BASE}/${name}`,
);

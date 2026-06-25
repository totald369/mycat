const HANGUL_SYLLABLE_BASE = 0xac00;
const JONGSEONG_COUNT = 28;

function lastHangulSyllable(text: string): string | null {
  for (let i = text.length - 1; i >= 0; i--) {
    const code = text.codePointAt(i);
    if (code !== undefined && code >= 0xac00 && code <= 0xd7a3) {
      return text[i]!;
    }
  }
  return null;
}

function latinTailHasBatchim(text: string): boolean | null {
  const match = text.trim().match(/[A-Za-z][A-Za-z0-9+./-]*$/);
  if (!match) return null;

  const word = match[0].toLowerCase();
  if (/[mnlrkpstgdfh]$/.test(word)) return true;
  if (/(?:ome|ine|one|ane|ium)$/.test(word)) return true;
  if (/[aeiouy]$/.test(word)) return false;
  return false;
}

/** 한글 음절의 받침(종성) 유무 */
export function hasJongseong(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;

  const latinBatchim = latinTailHasBatchim(trimmed);
  if (latinBatchim != null) return latinBatchim;

  const lastHangul = lastHangulSyllable(trimmed);
  if (lastHangul) {
    const code = lastHangul.codePointAt(0)!;
    return (code - HANGUL_SYLLABLE_BASE) % JONGSEONG_COUNT !== 0;
  }

  const last = trimmed[trimmed.length - 1]!;
  const code = last.codePointAt(0);
  if (code === undefined) return false;

  if (code >= 0xac00 && code <= 0xd7a3) {
    return (code - HANGUL_SYLLABLE_BASE) % JONGSEONG_COUNT !== 0;
  }

  if (/[0-9]$/.test(last)) return true;
  if (/[lmnrLMNR]$/.test(last)) return true;

  return false;
}

export function particleEunNeun(noun: string): "은" | "는" {
  return hasJongseong(noun) ? "은" : "는";
}

export function particleIGa(noun: string): "이" | "가" {
  return hasJongseong(noun) ? "이" : "가";
}

export function particleEulReul(noun: string): "을" | "를" {
  return hasJongseong(noun) ? "을" : "를";
}

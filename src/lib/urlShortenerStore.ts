import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

/** Ambiguous characters omitted (0/O, 1/l, etc.) */
const ID_ALPHABET =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
export const SHORT_ID_LENGTH = 6;

type Persisted = {
  byId: Record<string, string>;
  byUrl: Record<string, string>;
};

const DATA_FILE = path.join(process.cwd(), "data", "url-shortener.json");

let memory: Persisted = { byId: {}, byUrl: {} };
let loaded = false;

async function ensureLoaded(): Promise<void> {
  if (loaded) return;
  try {
    const raw = await readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as Persisted;
    memory = {
      byId: typeof parsed.byId === "object" && parsed.byId ? parsed.byId : {},
      byUrl:
        typeof parsed.byUrl === "object" && parsed.byUrl ? parsed.byUrl : {},
    };
  } catch {
    memory = { byId: {}, byUrl: {} };
  }
  loaded = true;
}

async function persist(): Promise<void> {
  await mkdir(path.dirname(DATA_FILE), { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(memory), "utf8");
}

function randomShortId(): string {
  let out = "";
  for (let i = 0; i < SHORT_ID_LENGTH; i++) {
    out += ID_ALPHABET[Math.floor(Math.random() * ID_ALPHABET.length)]!;
  }
  return out;
}

/** Look up full URL by short id; null if unknown */
export async function getUrlByShortId(id: string): Promise<string | null> {
  await ensureLoaded();
  const url = memory.byId[id];
  return typeof url === "string" && url.length > 0 ? url : null;
}

/**
 * Register a full URL and return its short id.
 * Reuses the same id if the URL was already shortened.
 */
export async function registerShortUrl(originalUrl: string): Promise<string> {
  await ensureLoaded();
  const normalized = normalizeUrlKey(originalUrl);
  const existing = memory.byUrl[normalized];
  if (existing) return existing;

  for (let i = 0; i < 12; i++) {
    const id = randomShortId();
    if (memory.byId[id]) continue;
    memory.byId[id] = originalUrl;
    memory.byUrl[normalized] = id;
    try {
      await persist();
    } catch {
      /* e.g. read-only FS on some hosts — in-memory map still works per instance */
    }
    return id;
  }
  throw new Error("short id collision — retry");
}

export function normalizeUrlKey(url: string): string {
  const u = new URL(url.trim());
  return u.toString();
}

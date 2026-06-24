import { prisma } from "@/lib/prisma";
import {
  getRelatedFeedsByBrand,
  getRelatedFeedsByPurpose,
} from "@/lib/feedDetail";
import type { FeedDetailItemWithSlug } from "@/lib/feedDetail";
import {
  buildSeoBoostPrompt,
  normalizeSeoBoostContent,
  parseSeoBoostJson,
  type SimilarFeedSummary,
} from "@/lib/feedSeoBoostPrompt";
import {
  buildRuleBasedSeoBoostContent,
  RULE_BASED_MODEL,
} from "@/lib/feedSeoBoostRules";
import {
  writeFeedSeoBoostCache,
  loadFeedSeoBoostCache,
} from "@/lib/feedSeoBoostStore";
import type { FeedSeoBoostContentData } from "@/lib/feedSeoBoostTypes";
import { SEO_BOOST_PILOT_MAX, SEO_BOOST_PROMPT_VERSION } from "@/lib/feedSeoBoostTypes";

const DEFAULT_MODEL = "gpt-4o-mini";
const OPENAI_CALL_DELAY_MS = 7000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseRetryAfterMs(message: string): number {
  const minMatch = message.match(/try again in (\d+)m(\d+)s/i);
  if (minMatch) {
    return (Number(minMatch[1]) * 60 + Number(minMatch[2]) + 5) * 1000;
  }
  const secMatch = message.match(/try again in (\d+)s/i);
  if (secMatch) return (Number(secMatch[1]) + 2) * 1000;
  return 60_000;
}

function toSimilarSummaries(
  feed: FeedDetailItemWithSlug,
): SimilarFeedSummary[] {
  const brand = getRelatedFeedsByBrand(feed, 3);
  const purpose = getRelatedFeedsByPurpose(feed, 2);
  const seen = new Set<string>();
  const out: SimilarFeedSummary[] = [];

  for (const link of [...brand, ...purpose]) {
    if (seen.has(link.href)) continue;
    seen.add(link.href);
    out.push({
      label: link.label,
      kcalPer100g: link.kcalPer100g,
      lifeStage: null,
    });
  }
  return out.slice(0, 5);
}

async function upsertSeoBoostContent(
  feedApiId: string,
  data: FeedSeoBoostContentData,
  model: string,
): Promise<void> {
  await prisma.feedSeoBoostContent.upsert({
    where: { feedApiId },
    create: {
      feedApiId,
      recommendedFor: JSON.stringify(data.recommendedFor),
      feedingNotes: data.feedingNotes,
      comparisonPoints: JSON.stringify(data.comparisonPoints),
      openaiModel: model,
      promptVersion: SEO_BOOST_PROMPT_VERSION,
    },
    update: {
      recommendedFor: JSON.stringify(data.recommendedFor),
      feedingNotes: data.feedingNotes,
      comparisonPoints: JSON.stringify(data.comparisonPoints),
      openaiModel: model,
      promptVersion: SEO_BOOST_PROMPT_VERSION,
    },
  });
}

export async function listPilotFeedApiIds(): Promise<string[]> {
  try {
    const rows = await prisma.seoBoostPilotFeed.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return rows.map((r) => r.feedApiId);
  } catch {
    return loadFeedSeoBoostCache().pilotFeedApiIds;
  }
}

export async function savePilotFeedApiIds(
  feedApiIds: string[],
  notes?: Record<string, string>,
): Promise<string[]> {
  const unique = [...new Set(feedApiIds.map((id) => id.trim()).filter(Boolean))];
  if (unique.length > SEO_BOOST_PILOT_MAX) {
    throw new Error(`파일럿 대상은 최대 ${SEO_BOOST_PILOT_MAX}개입니다.`);
  }

  await prisma.$transaction([
    prisma.seoBoostPilotFeed.deleteMany(),
    ...unique.map((feedApiId, index) =>
      prisma.seoBoostPilotFeed.create({
        data: {
          feedApiId,
          sortOrder: index,
          gscNote: notes?.[feedApiId] ?? null,
        },
      }),
    ),
  ]);

  await syncCacheFromDb();
  return unique;
}

export async function syncCacheFromDb(): Promise<void> {
  const [pilotRows, contentRows] = await Promise.all([
    prisma.seoBoostPilotFeed.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.feedSeoBoostContent.findMany(),
  ]);

  const contents: Record<string, FeedSeoBoostContentData> = {};
  for (const row of contentRows) {
    contents[row.feedApiId] = {
      recommendedFor: JSON.parse(row.recommendedFor) as string[],
      feedingNotes: row.feedingNotes,
      comparisonPoints: JSON.parse(row.comparisonPoints) as string[],
    };
  }

  writeFeedSeoBoostCache({
    version: 1,
    exportedAt: new Date().toISOString(),
    pilotFeedApiIds: pilotRows.map((r) => r.feedApiId),
    contents,
  });
}

async function callOpenAi(prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY가 설정되지 않았습니다.");
  }
  const model = process.env.OPENAI_MODEL?.trim() || DEFAULT_MODEL;

  for (let attempt = 0; attempt < 6; attempt++) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.6,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "반려묘 사료 SEO 콘텐츠를 JSON만으로 출력합니다. 의료·치료·예방 단정 표현은 사용하지 않습니다.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (res.ok) {
      const json = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const content = json.choices?.[0]?.message?.content;
      if (!content?.trim()) throw new Error("OpenAI 응답이 비어 있습니다.");
      return content;
    }

    const errText = await res.text();
    if (res.status === 429 && attempt < 5) {
      await sleep(parseRetryAfterMs(errText));
      continue;
    }
    throw new Error(`OpenAI API ${res.status}: ${errText.slice(0, 300)}`);
  }

  throw new Error("OpenAI API 재시도 초과");
}

export async function generateSeoBoostForFeed(
  feed: FeedDetailItemWithSlug,
  options?: { force?: boolean },
): Promise<FeedSeoBoostContentData> {
  if (!options?.force) {
    const existing = await prisma.feedSeoBoostContent.findUnique({
      where: { feedApiId: feed.apiId },
    });
    if (
      existing?.openaiModel &&
      existing.openaiModel !== RULE_BASED_MODEL
    ) {
      return {
        recommendedFor: JSON.parse(existing.recommendedFor) as string[],
        feedingNotes: existing.feedingNotes,
        comparisonPoints: JSON.parse(existing.comparisonPoints) as string[],
      };
    }
  }

  const similar = toSimilarSummaries(feed);

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    const normalized = buildRuleBasedSeoBoostContent(feed, similar);
    await upsertSeoBoostContent(feed.apiId, normalized, RULE_BASED_MODEL);
    return normalized;
  }

  const prompt = buildSeoBoostPrompt(feed, similar);
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const raw = await callOpenAi(
        attempt === 0
          ? prompt
          : `${prompt}\n\n이전 응답에 금지 표현이 있었습니다. 치료·완치·예방·효과가 있다 를 절대 쓰지 마세요.`,
      );
      const parsed = parseSeoBoostJson(raw);
      const normalized = normalizeSeoBoostContent(parsed);
      const model = process.env.OPENAI_MODEL?.trim() || DEFAULT_MODEL;

      await upsertSeoBoostContent(feed.apiId, normalized, model);
      return normalized;
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
    }
  }

  throw lastError ?? new Error("생성 실패");
}

export async function generateSeoBoostForPilot(options?: {
  force?: boolean;
  feedApiIds?: string[];
}): Promise<{ ok: string[]; failed: { feedApiId: string; error: string }[] }> {
  const { getFeedDetailFromCsvById, getAllFeedDetails } = await import(
    "@/lib/feedDetail"
  );

  const targetIds =
    options?.feedApiIds?.length
      ? options.feedApiIds
      : await listPilotFeedApiIds();

  if (targetIds.length === 0) {
    throw new Error("파일럿 대상 사료가 없습니다. 관리자에서 먼저 지정하세요.");
  }

  const ok: string[] = [];
  const failed: { feedApiId: string; error: string }[] = [];

  for (const apiId of targetIds) {
    const feed =
      getFeedDetailFromCsvById(apiId) ??
      getAllFeedDetails().find((f) => f.apiId === apiId);
    if (!feed) {
      failed.push({ feedApiId: apiId, error: "CSV에서 사료를 찾을 수 없음" });
      continue;
    }
    try {
      await generateSeoBoostForFeed(feed, { force: options?.force });
      ok.push(apiId);
      if (process.env.OPENAI_API_KEY?.trim()) {
        await sleep(OPENAI_CALL_DELAY_MS);
      }
    } catch (e) {
      failed.push({
        feedApiId: apiId,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  await syncCacheFromDb();
  return { ok, failed };
}

export async function getAdminSeoBoostStatus(): Promise<{
  pilotFeedApiIds: string[];
  contents: Record<
    string,
    { generatedAt: string; openaiModel: string | null } | null
  >;
}> {
  const pilotFeedApiIds = await listPilotFeedApiIds();
  const rows = await prisma.feedSeoBoostContent.findMany();
  const contents: Record<
    string,
    { generatedAt: string; openaiModel: string | null } | null
  > = {};

  for (const id of pilotFeedApiIds) {
    const row = rows.find((r) => r.feedApiId === id);
    contents[id] = row
      ? {
          generatedAt: row.generatedAt.toISOString(),
          openaiModel: row.openaiModel,
        }
      : null;
  }

  return { pilotFeedApiIds, contents };
}

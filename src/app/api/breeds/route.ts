import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function displayLabel(nameKo: string | null, nameEn: string) {
  return nameKo ? `${nameKo} (${nameEn})` : nameEn;
}

type CatApiBreedRow = { id: string; name: string };

let nameKoByApiIdCache: Record<string, string> | null = null;

function getNameKoByApiId(): Record<string, string> {
  if (!nameKoByApiIdCache) {
    const path = join(process.cwd(), "prisma", "breedKoByApiId.json");
    nameKoByApiIdCache = JSON.parse(readFileSync(path, "utf-8")) as Record<
      string,
      string
    >;
  }
  return nameKoByApiIdCache;
}

async function breedsFromCatApi(): Promise<
  Array<{
    id: string;
    apiId: string;
    nameEn: string;
    nameKo: string | null;
    label: string;
  }>
> {
  const headers: HeadersInit = {};
  const key = process.env.CAT_API_KEY;
  if (key) headers["x-api-key"] = key;

  const res = await fetch("https://api.thecatapi.com/v1/breeds", {
    headers,
    next: { revalidate: 86_400 },
  });

  if (!res.ok) {
    throw new Error(
      `The Cat API 품종 목록을 가져오지 못했습니다. (${res.status})`,
    );
  }

  const breeds = (await res.json()) as CatApiBreedRow[];
  if (!Array.isArray(breeds) || breeds.length === 0) {
    throw new Error("The Cat API에서 품종 데이터가 비어 있습니다.");
  }

  const koMap = getNameKoByApiId();

  return [...breeds]
    .sort((a, b) => a.name.localeCompare(b.name, "en"))
    .map((b) => {
      const nameKo = koMap[b.id] ?? null;
      return {
        id: b.id,
        apiId: b.id,
        nameEn: b.name,
        nameKo,
        label: displayLabel(nameKo, b.name),
      };
    });
}

async function breedsFromDb() {
  const rows = await prisma.breed.findMany({
    orderBy: { nameEn: "asc" },
    select: {
      id: true,
      apiId: true,
      nameEn: true,
      nameKo: true,
    },
  });
  return rows.map((r) => ({
    id: r.id,
    apiId: r.apiId,
    nameEn: r.nameEn,
    nameKo: r.nameKo,
    label: displayLabel(r.nameKo, r.nameEn),
  }));
}

export async function GET() {
  if (process.env.DATABASE_URL) {
    try {
      const items = await breedsFromDb();
      if (items.length > 0) {
        return NextResponse.json({ items });
      }
    } catch (e) {
      console.warn("[api/breeds] DB 품종 로드 실패, The Cat API로 대체:", e);
    }
  }

  try {
    const items = await breedsFromCatApi();
    return NextResponse.json({ items });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "품종 목록을 불러오지 못했습니다.";
    return NextResponse.json(
      {
        items: [],
        error: `${message} (로컬은 DATABASE_URL·db:seed, 배포는 The Cat API를 사용합니다.)`,
      },
      { status: 503 },
    );
  }
}

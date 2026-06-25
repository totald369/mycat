/** 브랜드 급여 가이드 HTML → (기준 체중 kg, 하루 g) */

export type FeedingGuideRow = {
  weightKg: number;
  dailyGrams: number;
};

export type ParsedFeedingGuide = {
  rows: FeedingGuideRow[];
  tableKind: "weight" | "kitten_age" | "unknown";
  sourceNote?: string;
};

function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parsePlainGrams(cell: string): number | null {
  const cleaned = stripTags(cell).replace(",", ".").trim();
  if (!cleaned || !/^\d+(?:\.\d+)?$/.test(cleaned)) return null;
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? Math.round(n) : null;
}

function parseGramsCell(cell: string): number | null {
  return parseGramsFromCell(cell) ?? parsePlainGrams(cell);
}

function parseGramsFromCell(cell: string): number | null {
  const cleaned = stripTags(cell);
  const rangeG = cleaned.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*g\b/i);
  if (rangeG) {
    return Math.round((Number(rangeG[1]) + Number(rangeG[2])) / 2);
  }
  const dryOnly = cleaned.match(/^(\d+(?:\.\d+)?)\s*g\b/i);
  if (dryOnly) return Math.round(Number(dryOnly[1]));
  const dryAddon = cleaned.match(/\+\s*(\d+(?:\.\d+)?)(?:\s*-\s*(\d+(?:\.\d+)?))?\s*g/i);
  if (dryAddon) {
    const a = Number(dryAddon[1]);
    const b = dryAddon[2] ? Number(dryAddon[2]) : a;
    return Math.round((a + b) / 2);
  }
  const anyG = cleaned.match(/(\d+(?:\.\d+)?)\s*g/i);
  return anyG ? Math.round(Number(anyG[1])) : null;
}

function parseWeightKg(cell: string): number | null {
  const cleaned = stripTags(cell);
  const range = cleaned.match(
    /(\d+(?:[.,]\d+)?)\s*[-–]\s*(\d+(?:[.,]\d+)?)\s*kg/i,
  );
  if (range) {
    const a = Number.parseFloat(range[1].replace(",", "."));
    const b = Number.parseFloat(range[2].replace(",", "."));
    return (a + b) / 2;
  }
  const m = cleaned.match(/(\d+(?:[.,]\d+)?)\s*kg/i);
  if (m) return Number.parseFloat(m[1].replace(",", "."));
  const n = Number.parseFloat(cleaned.replace(",", "."));
  return Number.isFinite(n) && n > 0 && n <= 15 ? n : null;
}

function isMixedFeedingTable(tableHtml: string): boolean {
  const t = stripTags(tableHtml).toLowerCase();
  if (/건사료만|dry food only|dry only/i.test(t)) return false;
  // 벵갈 등: pouch 언급 있어도 건식 g 추출 가능 → 제외하지 않음
  if (/\+\s*\d+\s*g/i.test(t) && /pouch|파우치/i.test(t)) return false;
  return (
    /파우치|pouch|wet|습식|혼합|mixed|morsel|gravy|sauce|loaf/i.test(t) &&
    !/ideal weight|정상체중/i.test(t)
  );
}

function extractTableRows(tableHtml: string): string[][] {
  return [...tableHtml.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map((m) => {
    const cells: string[] = [];
    for (const c of m[1].matchAll(
      /<t[dh][^>]*\/>|<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi,
    )) {
      cells.push(c[1] ?? "");
    }
    return cells;
  });
}

function isIdealWeightHeader(label: string): boolean {
  const l = label.toLowerCase().trim();
  if (l.includes("정상체중")) return true;
  if (!l.includes("ideal")) return false;
  if (/weight\s*\(\s*kg|cat.*ideal.*weight|\(kg\)/i.test(l)) return false;
  return l.includes("ideal weight") || l === "ideal";
}

function pickIdealColumnIndex(headerCells: string[]): number {
  const labels = headerCells.map((c) => stripTags(c).toLowerCase());
  const idealIdx = labels.findIndex(
    (l) =>
      isIdealWeightHeader(l) ||
      l.includes("normal energy") ||
      l.includes("moderate energy") ||
      l.includes("moderate / active") ||
      (l.includes("normal") && l.includes("g")),
  );
  if (idealIdx >= 0) return idealIdx;

  for (let i = 1; i < labels.length; i++) {
    const l = labels[i];
    if (
      l.includes("과체중") ||
      l.includes("overweight") ||
      l.includes("inactive") ||
      l.includes("low energy") ||
      l.includes("slightly under") ||
      l.includes("thin")
    ) {
      continue;
    }
    if (l && !l.includes("체중") && !l.includes("weight") && !l.includes("age")) {
      return i;
    }
  }
  return labels.length > 1 ? 1 : 0;
}

function findHeaderRowIndex(trs: string[][]): number {
  const thIdx = trs.findIndex((cells) =>
    cells.some((c) => /<th/i.test(c)),
  );
  if (thIdx >= 0) return thIdx;
  const weightIdx = trs.findIndex((cells) =>
    /weight|체중|month|개월|월령/i.test(stripTags(cells[0] ?? "")),
  );
  return weightIdx >= 0 ? weightIdx : 0;
}

function isLabelRow(cells: string[]): boolean {
  const first = stripTags(cells[0] ?? "").toLowerCase().trim();
  if (!first) {
    return cells.some((c) => /^grams?$/i.test(stripTags(c).trim()));
  }
  return (
    /^(thin|normal|overweight|grams?|cups?)$/i.test(first) ||
    (/weight|체중/i.test(first) && !/\d/.test(first))
  );
}

function findVetNormalColumn(trs: string[][]): { normalCol: number; dataStart: number } {
  for (let i = 0; i < Math.min(trs.length, 6); i++) {
    const cells = trs[i].map((c) => stripTags(c).toLowerCase().trim());
    const normIdx = cells.findIndex((c) =>
      /^normal(\s*\(?g?\)?)?$|^정상(체중)?$/i.test(c),
    );
    if (normIdx >= 0) {
      let dataStart = i + 1;
      while (dataStart < trs.length && isLabelRow(trs[dataStart].map((c) => stripTags(c)))) {
        dataStart++;
      }
      return { normalCol: normIdx, dataStart };
    }
  }
  return { normalCol: 2, dataStart: 0 };
}

function parseWeightTable(tableHtml: string): FeedingGuideRow[] {
  const trs = extractTableRows(tableHtml);
  if (trs.length < 2) return [];

  const headerIdx = findHeaderRowIndex(trs);
  const idealCol = pickIdealColumnIndex(trs[headerIdx] ?? []);

  const rows: FeedingGuideRow[] = [];
  for (let i = headerIdx + 1; i < trs.length; i++) {
    const cells = trs[i];
    if (cells.length < 2) continue;

    const weightKg = parseWeightKg(cells[0] ?? "");
    if (weightKg == null) {
      const label = stripTags(cells[0] ?? "").toLowerCase();
      if (/thin|normal|overweight|grams|체중|weight/i.test(label) && !/\d/.test(label)) {
        continue;
      }
      continue;
    }

    const grams = parseGramsCell(cells[idealCol] ?? cells[1] ?? "");
    if (grams != null && grams >= 10) rows.push({ weightKg, dailyGrams: grams });
  }
  return rows;
}

/** 키튼 월령표 — Rationing 행 또는 체중×월령 행 */
function parseKittenAgeTable(tableHtml: string): FeedingGuideRow[] {
  const trs = extractTableRows(tableHtml);
  if (trs.length < 2) return [];

  const headerCells = trs[0].map((c) => stripTags(c));
  const monthCols: { month: number; col: number }[] = [];
  for (let i = 1; i < headerCells.length; i++) {
    const m = headerCells[i].match(/(\d+)/);
    if (m) monthCols.push({ month: Number(m[1]), col: i });
  }
  if (!monthCols.length) return [];

  const rows: FeedingGuideRow[] = [];
  for (let r = 1; r < trs.length; r++) {
    const cells = trs[r];
    const label = stripTags(cells[0] ?? "").toLowerCase();
    const isRationRow =
      /ration|grams\/day|급여|g\/day/i.test(label) &&
      !/weight|체중/i.test(label);
    const isWeightRow = /weight|체중|kg/i.test(label);

    if (!isRationRow && !isWeightRow) continue;

    for (const { month, col } of monthCols) {
      const grams = parseGramsCell(cells[col] ?? "");
      if (grams != null && grams >= 10) {
        rows.push({ weightKg: month, dailyGrams: grams });
      }
    }
  }
  return rows;
}

/** 체중이 열 헤더(3 kg, 4 kg…)인 표 — 인도어 7+, 스테럴라이즈드 등 */
function parseTransposedWeightTable(tableHtml: string): FeedingGuideRow[] {
  const trs = extractTableRows(tableHtml);
  if (trs.length < 2) return [];

  const headerIdx = findHeaderRowIndex(trs);
  const headerCells = trs[headerIdx].map((c) => stripTags(c));
  const weightCols: { col: number; weightKg: number }[] = [];
  for (let i = 1; i < headerCells.length; i++) {
    const w = parseWeightKg(headerCells[i] ?? "");
    if (w != null && w > 0) weightCols.push({ col: i, weightKg: w });
  }
  if (weightCols.length < 2) return [];

  let dataRow = -1;
  for (let r = headerIdx + 1; r < trs.length; r++) {
    const label = stripTags(trs[r][0] ?? "").toLowerCase();
    if (/pouch|파우치|wet|습식|mixed|혼합/i.test(label)) continue;
    if (
      /ideal weight.*kibbles only|kibbles only/i.test(label) ||
      /^ideal weight$|^정상체중$/i.test(label.trim()) ||
      (/ideal weight|정상체중/i.test(label) && !/\+|pouch|파우치/i.test(label))
    ) {
      dataRow = r;
      break;
    }
    if (/moderate.*energy|moderate.*active|normal energy/i.test(label)) {
      dataRow = r;
      break;
    }
  }
  if (dataRow < 0) return [];

  const rows: FeedingGuideRow[] = [];
  for (const { col, weightKg } of weightCols) {
    const grams = parseGramsCell(trs[dataRow][col] ?? "");
    if (grams != null && grams >= 10) rows.push({ weightKg, dailyGrams: grams });
  }
  return rows;
}

function isTransposedWeightTable(tableHtml: string): boolean {
  const trs = extractTableRows(tableHtml);
  const headerIdx = findHeaderRowIndex(trs);
  const headerCells = trs[headerIdx]?.map((c) => stripTags(c)) ?? [];
  const kgCols = headerCells.slice(1).filter((c) => /\d+\s*kg|\d+\s*[-–]\s*\d+\s*kg/i.test(c));
  return kgCols.length >= 2;
}

/** 키튼 월령 범위표 — "2 to 3 months" + "40 - 69 g" */
function parseKittenMonthRangeTable(tableHtml: string): FeedingGuideRow[] {
  const trs = extractTableRows(tableHtml);
  if (trs.length < 2) return [];

  const headerCells = trs[0].map((c) => stripTags(c));
  const monthCols: { month: number; col: number }[] = [];
  for (let i = 1; i < headerCells.length; i++) {
    const m = headerCells[i].match(/(\d+)\s*(?:to|[-–~])\s*(\d+)\s*month/i);
    if (m) monthCols.push({ month: Number(m[1]), col: i });
  }
  if (!monthCols.length) return [];

  const rows: FeedingGuideRow[] = [];
  for (let r = 1; r < trs.length; r++) {
    const label = stripTags(trs[r][0] ?? "").toLowerCase();
    if (!/daily|ration|quantit|kibbles|급여|grams/i.test(label)) continue;
    if (/pouch|파우치|wet|\+/i.test(label)) continue;

    for (const { month, col } of monthCols) {
      const grams = parseGramsCell(trs[r][col] ?? "");
      if (grams != null && grams >= 10) {
        rows.push({ weightKg: month, dailyGrams: grams });
      }
    }
  }
  return rows;
}

function parseSatietyWeightTable(tableHtml: string): FeedingGuideRow[] {
  const trs = extractTableRows(tableHtml);
  const flat = stripTags(tableHtml).toLowerCase();
  if (!/maintenance|유지|weight loss|체중 감량|stage/i.test(flat)) return [];

  let maintCol = -1;
  let dataStart = 0;

  for (let i = 0; i < Math.min(trs.length, 5); i++) {
    const cells = trs[i].map((c) => stripTags(c).toLowerCase());
    const idx = cells.findIndex((c) =>
      /maintenance|유지|after weight|체중 감량 후/i.test(c),
    );
    if (idx >= 0) {
      maintCol = idx;
      dataStart = i + 1;
      break;
    }
  }

  if (maintCol < 0) {
    maintCol = Math.max(1, (trs[0]?.length ?? 1) - 1);
    dataStart = 1;
  }

  while (dataStart < trs.length && isLabelRow(trs[dataStart].map((c) => stripTags(c)))) {
    dataStart++;
  }

  const rows: FeedingGuideRow[] = [];
  for (let i = dataStart; i < trs.length; i++) {
    const cells = trs[i].map((c) => stripTags(c));
    const weightKg =
      parseWeightKg(cells[0] ?? "") ?? parsePlainGrams(cells[0] ?? "");
    const grams = parseGramsCell(cells[maintCol] ?? "");
    if (weightKg != null && weightKg > 0 && grams != null && grams >= 10) {
      rows.push({ weightKg, dailyGrams: grams });
    }
  }
  return rows;
}

function parseVetNumericTable(tableHtml: string): FeedingGuideRow[] {
  const trs = extractTableRows(tableHtml);
  const { normalCol, dataStart } = findVetNormalColumn(trs);

  const rows: FeedingGuideRow[] = [];
  for (let i = dataStart; i < trs.length; i++) {
    const cells = trs[i].map((c) => stripTags(c));
    if (cells.length <= normalCol) continue;
    if (isLabelRow(cells)) continue;

    const weightRaw = cells[0]?.trim() ?? "";
    if (!weightRaw) continue;
    if (/^thin$|^normal$|^overweight$|^grams$/i.test(weightRaw)) continue;

    const weightKg =
      parseWeightKg(weightRaw.includes("kg") ? weightRaw : `${weightRaw} kg`) ??
      parsePlainGrams(weightRaw);
    const grams = parseGramsCell(cells[normalCol] ?? "");

    if (
      weightKg != null &&
      weightKg > 0 &&
      grams != null &&
      grams >= 10
    ) {
      rows.push({ weightKg, dailyGrams: grams });
    }
  }
  return rows;
}

export function parseRoyalCaninFeedingHtml(html: string): ParsedFeedingGuide | null {
  if (!html?.trim()) return null;

  const tables = [...html.matchAll(/<table[\s\S]*?<\/table>/gi)].map((m) => m[0]);
  if (!tables.length) return null;

  const dryTables = tables.filter((t) => !isMixedFeedingTable(t));
  const candidates = dryTables.length > 0 ? dryTables : [tables[0]];

  for (const table of candidates) {
    const flat = stripTags(table).toLowerCase();
    if (isTransposedWeightTable(table)) {
      const rows = parseTransposedWeightTable(table);
      if (rows.length) {
        return { rows, tableKind: "weight", sourceNote: "transposed_weight" };
      }
    }
    if (/maintenance|유지|weight loss|체중 감량|stage/i.test(flat)) {
      const rows = parseSatietyWeightTable(table);
      if (rows.length) {
        return { rows, tableKind: "weight", sourceNote: "satiety_maintenance" };
      }
    }
    if (/thin|normal|overweight|정상체중|과체중/i.test(flat) && /\d/.test(flat)) {
      const rows = parseVetNumericTable(table);
      if (rows.length) {
        return { rows, tableKind: "weight", sourceNote: "vet_numeric" };
      }
    }
    if (/(\d+\s*to\s*\d+\s*month|개월)/i.test(flat) && /daily|ration|quantit|kibbles/i.test(flat)) {
      const rows = parseKittenMonthRangeTable(table);
      if (rows.length) {
        return { rows, tableKind: "kitten_age", sourceNote: "kitten_month_range" };
      }
    }
    if (/age.*month|개월|월령|rationing/i.test(flat)) {
      const rows = parseKittenAgeTable(table);
      if (rows.length) {
        return { rows, tableKind: "kitten_age" };
      }
    }
    const rows = parseWeightTable(table);
    if (rows.length) {
      return { rows, tableKind: "weight" };
    }
  }

  return null;
}

export function parseHillsFeedingHtml(html: string): ParsedFeedingGuide | null {
  const idx = html.search(/급여\s*가이드|feeding\s*guide/i);
  if (idx < 0) return null;

  const chunk = html.slice(idx, idx + 12_000);
  const text = chunk
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, " ");

  const rows: FeedingGuideRow[] = [];
  for (const m of text.matchAll(
    /(\d+)\s*\(\s*([\d,.]+)\s*\)[^(]*?\(\s*(\d+)\s*\)/g,
  )) {
    const kg = Number.parseFloat(m[2].replace(",", "."));
    const grams = Number.parseInt(m[3], 10);
    if (Number.isFinite(kg) && Number.isFinite(grams)) {
      rows.push({ weightKg: kg, dailyGrams: grams });
    }
  }

  if (!rows.length) return null;
  return { rows, tableKind: "weight" };
}

export function defaultGuideWeightKg(lifeStage: string | null | undefined): number {
  const key = (lifeStage ?? "").trim().toLowerCase();
  if (!key) return 4;
  if (key.includes("kitten_0_4") || key === "kitten_0_12m") return 2;
  if (key.includes("kitten")) return 4;
  if (key.includes("senior_15")) return 5;
  if (key.includes("senior")) return 4;
  return 4;
}

export function pickGuideGrams(
  parsed: ParsedFeedingGuide,
  targetWeightKg: number,
): { dailyGrams: number; matchedWeightKg: number } | null {
  const { rows, tableKind } = parsed;
  if (!rows.length) return null;

  if (tableKind === "kitten_age") {
    const targetMonth = targetWeightKg <= 2.5 ? 2 : 4;
    const byMonth = rows.filter((r) => Number.isInteger(r.weightKg));
    let best = byMonth.find((r) => r.weightKg === targetMonth);
    if (!best) {
      best = byMonth.reduce((a, b) =>
        Math.abs(a.weightKg - targetMonth) <= Math.abs(b.weightKg - targetMonth)
          ? a
          : b,
      );
    }
    return best
      ? { dailyGrams: best.dailyGrams, matchedWeightKg: targetWeightKg }
      : null;
  }

  let best = rows[0];
  let bestDist = Math.abs(rows[0].weightKg - targetWeightKg);
  for (const row of rows.slice(1)) {
    const dist = Math.abs(row.weightKg - targetWeightKg);
    if (dist < bestDist) {
      best = row;
      bestDist = dist;
    }
  }
  return { dailyGrams: best.dailyGrams, matchedWeightKg: best.weightKg };
}

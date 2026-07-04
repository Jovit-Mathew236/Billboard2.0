export interface BatchEntry {
  id: string;
  batchYear: string;
  studentCount: string;
  placements: string;
  higherStudy: string;
  row?: string[];
}

export interface TableBlockLike {
  id: string;
  type: string;
  title?: string;
  headers?: string[];
  rows?: string | string[][];
}

export interface BatchColumns {
  yearIdx: number;
  studentIdx: number;
  placementIdx: number;
  higherIdx: number;
}

export const DEFAULT_BATCH_HEADERS = [
  "Year",
  "Approved Intake",
  "Current Students",
  "Placement Offers",
  "Higher Studies",
];

const findByPriority = (headers: string[], keywords: string[]): number => {
  for (const keyword of keywords) {
    const idx = headers.findIndex((h) => (h ?? "").toLowerCase().includes(keyword));
    if (idx >= 0) return idx;
  }
  return -1;
};

export const getBatchColumns = (headers: string[]): BatchColumns => ({
  yearIdx: findByPriority(headers, ["year", "batch"]),
  studentIdx: findByPriority(headers, ["current student", "student", "intake"]),
  placementIdx: findByPriority(headers, ["placement", "placed"]),
  higherIdx: findByPriority(headers, ["higher"]),
});

const parseRows = (rows: TableBlockLike["rows"]): string[][] => {
  if (Array.isArray(rows)) return rows as string[][];
  if (typeof rows === "string") {
    try {
      const parsed = JSON.parse(rows);
      if (Array.isArray(parsed) && parsed.every(Array.isArray)) return parsed;
    } catch {
      return [];
    }
  }
  return [];
};

export const findBatchTable = <T extends TableBlockLike>(blocks: T[]): T | undefined =>
  blocks.find(
    (b) =>
      b.type === "table" &&
      Array.isArray(b.headers) &&
      b.headers.some((h) => (h ?? "").toLowerCase().includes("year")) &&
      b.headers.some((h) => {
        const l = (h ?? "").toLowerCase();
        return l.includes("placement") || l.includes("higher") || l.includes("student");
      })
  );

export const parseBatchTable = (block: TableBlockLike): BatchEntry[] => {
  const headers = block.headers ?? [];
  const cols = getBatchColumns(headers);
  const rows = parseRows(block.rows);

  return rows
    .filter((row) => Array.isArray(row) && row.some((cell) => (cell ?? "").toString().trim() !== ""))
    .map((row, index) => ({
      id: String(index),
      batchYear: (cols.yearIdx >= 0 ? row[cols.yearIdx] : row[0]) ?? "",
      studentCount: (cols.studentIdx >= 0 ? row[cols.studentIdx] : "") ?? "",
      placements: (cols.placementIdx >= 0 ? row[cols.placementIdx] : "") ?? "",
      higherStudy: (cols.higherIdx >= 0 ? row[cols.higherIdx] : "") ?? "",
      row: [...row],
    }));
};

export const applyEntryToRow = (
  headers: string[],
  entry: Omit<BatchEntry, "id" | "row">,
  baseRow?: string[]
): string[] => {
  const cols = getBatchColumns(headers);
  const row = headers.map((_, i) => baseRow?.[i] ?? "");
  if (cols.yearIdx >= 0) row[cols.yearIdx] = entry.batchYear;
  if (cols.studentIdx >= 0) row[cols.studentIdx] = entry.studentCount;
  if (cols.placementIdx >= 0) row[cols.placementIdx] = entry.placements;
  if (cols.higherIdx >= 0) row[cols.higherIdx] = entry.higherStudy;
  return row;
};

export const serializeBatchRows = (
  headers: string[],
  entries: Array<Omit<BatchEntry, "id">>
): string => JSON.stringify(entries.map((entry) => applyEntryToRow(headers, entry, entry.row)));

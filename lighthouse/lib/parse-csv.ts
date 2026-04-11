import Papa from "papaparse";
import type { RawLogRow } from "./types";

function sanitizePythonDict(raw: string): Record<string, unknown> {
  if (!raw || raw.trim() === "") return {};
  try {
    let s = raw.trim();
    s = s.replace(/'/g, '"');
    s = s.replace(/\bTrue\b/g, "true");
    s = s.replace(/\bFalse\b/g, "false");
    s = s.replace(/\bNone\b/g, "null");
    return JSON.parse(s);
  } catch {
    return { _raw: raw };
  }
}

interface CsvRow {
  [key: string]: string;
}

export async function parseInhibitorCsv(csvText: string): Promise<RawLogRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<CsvRow>(csvText, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        const rows: RawLogRow[] = [];
        for (const row of results.data) {
          const firstKey = Object.keys(row)[0];
          const indexVal = firstKey === "" ? row[""] : undefined;
          const idx = indexVal ? parseInt(indexVal, 10) : rows.length;

          rows.push({
            index: isNaN(idx) ? rows.length : idx,
            timestamp: row["timestamp"] ?? "",
            apiKey: row["apiKey"] ?? "",
            event: row["event"] ?? "",
            meta: sanitizePythonDict(row["meta"] ?? ""),
          });
        }
        resolve(rows);
      },
      error(err: Error) {
        reject(err);
      },
    });
  });
}

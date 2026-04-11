import type { InterventionEvent } from "./types";

export function parseInhibitorEvents(jsonlText: string): InterventionEvent[] {
  return jsonlText
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as InterventionEvent);
}

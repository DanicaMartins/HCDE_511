/** Normalize sector search queries (e.g. "media and communications" → "media & communications"). */
export function normalizeSectorQuery(q: string): string {
  return q
    .toLowerCase()
    .trim()
    .replace(/\s+and\s+/g, " & ")
    .replace(/\s+/g, " ");
}

export function sectorMatchesQuery(sectorName: string, rawQuery: string): boolean {
  const q = normalizeSectorQuery(rawQuery);
  if (!q) return false;
  const name = normalizeSectorQuery(sectorName);
  if (name.includes(q)) return true;
  const tokens = q.split(" ").filter(Boolean);
  return tokens.every((t) => name.includes(t));
}

export function searchSectors(
  sectorNames: string[],
  rawQuery: string,
  exclude?: string,
  limit = 10
): string[] {
  const q = rawQuery.trim();
  if (!q) return [];
  return sectorNames
    .filter((s) => s !== exclude && sectorMatchesQuery(s, q))
    .sort((a, b) => a.localeCompare(b))
    .slice(0, limit);
}

import type { ItemCategory, TimeOfDay } from "./types";

const STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "of",
  "and",
  "or",
  "in",
  "on",
  "at",
  "near",
  "with",
  "for",
  "to",
  "by",
]);

export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(value: string): string[] {
  const normalized = normalizeText(value);
  if (!normalized) return [];
  return normalized.split(" ").filter((word) => word.length > 0 && !STOPWORDS.has(word));
}

/** Word-overlap similarity: shared distinct words / total distinct words. */
export function jaccardSimilarity(a: string, b: string): number {
  const tokensA = new Set(tokenize(a));
  const tokensB = new Set(tokenize(b));

  if (tokensA.size === 0 && tokensB.size === 0) return 1;
  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let intersection = 0;
  for (const token of tokensA) {
    if (tokensB.has(token)) intersection += 1;
  }

  const union = tokensA.size + tokensB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/** Classic edit-distance (insert/delete/substitute), iterative two-row implementation. */
export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let previousRow = Array.from({ length: b.length + 1 }, (_, j) => j);
  let currentRow = new Array<number>(b.length + 1).fill(0);

  for (let i = 1; i <= a.length; i += 1) {
    currentRow[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      currentRow[j] = Math.min(
        currentRow[j - 1] + 1,
        previousRow[j] + 1,
        previousRow[j - 1] + cost
      );
    }
    [previousRow, currentRow] = [currentRow, previousRow];
  }

  return previousRow[b.length];
}

/** Character-level similarity, normalized to 0-1 by the longer string's length. */
export function stringSimilarity(a: string, b: string): number {
  const normA = normalizeText(a);
  const normB = normalizeText(b);

  if (normA.length === 0 && normB.length === 0) return 1;
  if (normA.length === 0 || normB.length === 0) return 0;

  const distance = levenshteinDistance(normA, normB);
  const maxLen = Math.max(normA.length, normB.length);
  return 1 - distance / maxLen;
}

/**
 * Hybrid similarity for short fields (item name, location, brand): takes the
 * better of word-overlap and character-level similarity, since a synonym-ish
 * rewording ("AirPods case" vs "earbud case") and a typo/variant ("Samsung"
 * vs "Samsun") fail different metrics.
 */
export function textSimilarity(a: string, b: string): number {
  return Math.max(jaccardSimilarity(a, b), stringSimilarity(a, b));
}

const CATEGORY_AFFINITY_PAIRS: Array<[ItemCategory, ItemCategory]> = [
  ["ELECTRONICS", "CLOTHING_AND_ACCESSORIES"],
  ["ELECTRONICS", "JEWELRY_AND_WATCHES"],
  ["BAGS_AND_BACKPACKS", "CLOTHING_AND_ACCESSORIES"],
  ["JEWELRY_AND_WATCHES", "CLOTHING_AND_ACCESSORIES"],
  ["WALLETS_AND_CARDS", "DOCUMENTS_AND_IDS"],
  ["BOOKS_AND_STATIONERY", "DOCUMENTS_AND_IDS"],
];

function pairKey(a: string, b: string): string {
  return [a, b].sort().join("|");
}

const CATEGORY_AFFINITY = new Set(
  CATEGORY_AFFINITY_PAIRS.map(([a, b]) => pairKey(a, b))
);

/**
 * Category is a strong signal but never a hard gate: students categorize the
 * same item differently, so a mismatch gets a low (not zero) floor, and a
 * small hardcoded affinity table gives partial credit to plausibly-confused
 * category pairs. `OTHER` is a catch-all, so it's treated as "related" to
 * everything rather than penalized.
 */
export function categorySimilarity(a: ItemCategory, b: ItemCategory): number {
  if (a === b) return 1;
  if (a === "OTHER" || b === "OTHER") return 0.5;
  if (CATEGORY_AFFINITY.has(pairKey(a, b))) return 0.5;
  return 0.1;
}

const DATE_HALF_LIFE_DAYS = 7;

/**
 * Smooth decay by absolute days apart. Never reaches exactly 0, so a large
 * gap alone can't eliminate a match — its (small, weighted) contribution
 * just approaches zero.
 */
export function dateSimilarity(a: Date, b: Date): number {
  const diffDays = Math.abs(a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24);
  return 1 / (1 + diffDays / DATE_HALF_LIFE_DAYS);
}

const TIME_OF_DAY_ORDER: TimeOfDay[] = ["MORNING", "AFTERNOON", "EVENING", "NIGHT"];

/** Ordinal distance across the day, linearly decayed (adjacent slots are more similar than opposite ones). */
export function timeOfDaySimilarity(a: TimeOfDay, b: TimeOfDay): number {
  const distance = Math.abs(TIME_OF_DAY_ORDER.indexOf(a) - TIME_OF_DAY_ORDER.indexOf(b));
  const maxDistance = TIME_OF_DAY_ORDER.length - 1;
  return 1 - distance / maxDistance;
}

const COLOR_SYNONYMS: Record<string, string> = {
  navy: "blue",
  maroon: "red",
  burgundy: "red",
  grey: "gray",
  silver: "gray",
  charcoal: "black",
  cream: "white",
  ivory: "white",
  beige: "tan",
  gold: "yellow",
};

function canonicalColor(value: string): string {
  const normalized = value.trim().toLowerCase();
  return COLOR_SYNONYMS[normalized] ?? normalized;
}

/** Colors are short, closed-ish vocabulary: exact match after synonym normalization, otherwise no credit. */
export function colorSimilarity(a: string, b: string): number {
  return canonicalColor(a) === canonicalColor(b) ? 1 : 0;
}

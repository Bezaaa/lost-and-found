// This module is intentionally decoupled from Prisma/Next.js so it can be
// unit tested in isolation. These literal unions mirror the ItemCategory and
// TimeOfDay enums in prisma/schema.prisma and must be kept in sync manually.

export type ItemCategory =
  | "ELECTRONICS"
  | "BAGS_AND_BACKPACKS"
  | "KEYS"
  | "WALLETS_AND_CARDS"
  | "CLOTHING_AND_ACCESSORIES"
  | "JEWELRY_AND_WATCHES"
  | "DOCUMENTS_AND_IDS"
  | "BOOKS_AND_STATIONERY"
  | "OTHER";

export type TimeOfDay = "MORNING" | "AFTERNOON" | "EVENING" | "NIGHT";

/**
 * The subset of a report's fields relevant to matching. Deliberately excludes
 * imageUrl (supporting evidence only, never part of the numeric score) and
 * anything identity/status/ownership related.
 */
export type MatchableReport = {
  category: ItemCategory;
  itemName: string;
  description: string;
  location: string;
  locationDetail?: string | null;
  date: Date;
  timeOfDay?: TimeOfDay | null;
  color?: string | null;
  brand?: string | null;
};

export type SignalKey =
  | "category"
  | "itemName"
  | "description"
  | "location"
  | "date"
  | "timeOfDay"
  | "color"
  | "brand";

export type SignalReason = {
  signal: SignalKey;
  /** Whether this signal contributed to the score (false if data was missing on either side). */
  applicable: boolean;
  /** Raw similarity for this signal, 0-1. */
  similarity: number;
  /** Points this signal was worth out of 100, after redistributing skipped signals' weight. */
  weight: number;
  /** Points this signal actually contributed to the final score (similarity * weight). */
  contribution: number;
  /** Short human-readable explanation, for the "why this score" UI. */
  note: string;
};

export type MatchResult = {
  /** 0-100, rounded. A similarity score, not a calibrated probability. */
  score: number;
  reasons: SignalReason[];
};

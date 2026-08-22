import type { SignalKey } from "./types";

/** Base weights out of 100. Signals skipped for missing data redistribute their share proportionally. */
export const SIGNAL_WEIGHTS: Record<SignalKey, number> = {
  itemName: 22,
  description: 20,
  category: 18,
  location: 15,
  date: 10,
  color: 6,
  timeOfDay: 5,
  brand: 4,
};

/** Minimum score to surface a pair as a "potential match". Not yet finalized against real data. */
export const MATCH_THRESHOLD = 50;

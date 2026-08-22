import { SIGNAL_WEIGHTS } from "./weights";
import {
  categorySimilarity,
  colorSimilarity,
  dateSimilarity,
  jaccardSimilarity,
  textSimilarity,
  timeOfDaySimilarity,
} from "./similarity";
import type { MatchableReport, MatchResult, SignalKey } from "./types";

type RawSignal = {
  signal: SignalKey;
  applicable: boolean;
  similarity: number;
  note: string;
};

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function combineLocation(report: MatchableReport): string {
  return [report.location, report.locationDetail].filter(Boolean).join(" ");
}

function daysApart(a: Date, b: Date): number {
  return Math.round(Math.abs(a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Compares a LOST report against a FOUND report and produces a deterministic,
 * explainable similarity score (0-100) plus a per-signal breakdown. This is a
 * similarity score, not a calibrated probability, and never claims certainty.
 *
 * Pure function: no I/O, no randomness, no external services.
 */
export function computeMatchScore(lost: MatchableReport, found: MatchableReport): MatchResult {
  const raw: RawSignal[] = [];

  raw.push({
    signal: "category",
    applicable: true,
    similarity: categorySimilarity(lost.category, found.category),
    note:
      lost.category === found.category
        ? "Same category."
        : "Different categories (partial credit only; category is never a hard gate).",
  });

  raw.push({
    signal: "itemName",
    applicable: true,
    similarity: textSimilarity(lost.itemName, found.itemName),
    note: "Compared item names for shared words and overall similarity.",
  });

  raw.push({
    signal: "description",
    applicable: true,
    similarity: jaccardSimilarity(lost.description, found.description),
    note: "Compared shared words across both descriptions.",
  });

  raw.push({
    signal: "location",
    applicable: true,
    similarity: textSimilarity(combineLocation(lost), combineLocation(found)),
    note: "Compared location (and detail, if provided).",
  });

  raw.push({
    signal: "date",
    applicable: true,
    similarity: dateSimilarity(lost.date, found.date),
    note: `Dates are ${daysApart(lost.date, found.date)} day(s) apart.`,
  });

  if (lost.timeOfDay && found.timeOfDay) {
    raw.push({
      signal: "timeOfDay",
      applicable: true,
      similarity: timeOfDaySimilarity(lost.timeOfDay, found.timeOfDay),
      note: "Compared approximate time of day.",
    });
  } else {
    raw.push({
      signal: "timeOfDay",
      applicable: false,
      similarity: 0,
      note: "Time of day not provided on one or both reports; not held against this match.",
    });
  }

  if (lost.color && found.color) {
    raw.push({
      signal: "color",
      applicable: true,
      similarity: colorSimilarity(lost.color, found.color),
      note: "Compared reported colors.",
    });
  } else {
    raw.push({
      signal: "color",
      applicable: false,
      similarity: 0,
      note: "Color not provided on one or both reports; not held against this match.",
    });
  }

  if (lost.brand && found.brand) {
    raw.push({
      signal: "brand",
      applicable: true,
      similarity: textSimilarity(lost.brand, found.brand),
      note: "Compared reported brands.",
    });
  } else {
    raw.push({
      signal: "brand",
      applicable: false,
      similarity: 0,
      note: "Brand not provided on one or both reports; not held against this match.",
    });
  }

  const applicableWeightTotal = raw
    .filter((entry) => entry.applicable)
    .reduce((sum, entry) => sum + SIGNAL_WEIGHTS[entry.signal], 0);

  const reasons = raw.map((entry) => {
    const weight =
      entry.applicable && applicableWeightTotal > 0
        ? (SIGNAL_WEIGHTS[entry.signal] / applicableWeightTotal) * 100
        : 0;
    const contribution = entry.applicable ? entry.similarity * weight : 0;

    return {
      ...entry,
      weight: round2(weight),
      contribution: round2(contribution),
    };
  });

  const score = Math.min(
    100,
    Math.max(0, Math.round(reasons.reduce((sum, entry) => sum + entry.contribution, 0)))
  );

  return { score, reasons };
}

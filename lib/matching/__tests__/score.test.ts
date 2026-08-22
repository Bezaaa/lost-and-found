import { computeMatchScore } from "../score";
import { MATCH_THRESHOLD, SIGNAL_WEIGHTS } from "../weights";
import type { MatchableReport } from "../types";

function report(overrides: Partial<MatchableReport>): MatchableReport {
  return {
    category: "ELECTRONICS",
    itemName: "Item",
    description: "A generic lost or found item description with enough words.",
    location: "Main Building",
    date: new Date("2026-08-15"),
    ...overrides,
  };
}

describe("computeMatchScore", () => {
  it("weights sum to 100", () => {
    const total = Object.values(SIGNAL_WEIGHTS).reduce((sum, w) => sum + w, 0);
    expect(total).toBe(100);
  });

  it("always returns a score between 0 and 100", () => {
    const lost = report({});
    const found = report({});
    const { score } = computeMatchScore(lost, found);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("returns one reason per signal", () => {
    const { reasons } = computeMatchScore(report({}), report({}));
    const signals = reasons.map((r) => r.signal).sort();
    expect(signals).toEqual(
      ["brand", "category", "color", "date", "description", "itemName", "location", "timeOfDay"].sort()
    );
  });

  // Example 1: near-identical reports, one day apart, matching optional fields.
  it("scores a near-identical pair very high (85-100)", () => {
    const lost = report({
      category: "ELECTRONICS",
      itemName: "AirPods Pro Case",
      description: "White AirPods Pro charging case, lost near the library entrance.",
      location: "Main Library",
      locationDetail: "Near the front entrance",
      date: new Date("2026-08-15"),
      timeOfDay: "AFTERNOON",
      color: "White",
      brand: "Apple",
    });
    const found = report({
      category: "ELECTRONICS",
      itemName: "AirPods Pro charging case",
      description: "White AirPods Pro charging case, found near the library entrance.",
      location: "Main Library",
      locationDetail: "Near the front entrance",
      date: new Date("2026-08-16"),
      timeOfDay: "AFTERNOON",
      color: "White",
      brand: "Apple",
    });

    const { score } = computeMatchScore(lost, found);
    expect(score).toBeGreaterThanOrEqual(85);
    expect(score).toBeLessThanOrEqual(100);
  });

  // Example 2: same real item, miscategorized by the finder, still strong on other signals.
  it("scores a miscategorized-but-same-item pair moderately-high (60-85)", () => {
    const lost = report({
      category: "ELECTRONICS",
      itemName: "AirPods case",
      description: "Black wireless earbud case, small, has a keychain loop.",
      location: "Gym",
      date: new Date("2026-08-10"),
    });
    const found = report({
      category: "CLOTHING_AND_ACCESSORIES",
      itemName: "wireless earbud case",
      description: "Small black earbud case found at the gym with a keychain attachment.",
      location: "Gym",
      date: new Date("2026-08-11"),
      color: "Black",
    });

    const { score } = computeMatchScore(lost, found);
    expect(score).toBeGreaterThanOrEqual(60);
    expect(score).toBeLessThanOrEqual(85);
  });

  // Example 3: genuinely unrelated items, different locations, weeks apart.
  it("scores unrelated items very low (0-20)", () => {
    const lost = report({
      category: "KEYS",
      itemName: "House keys with red keychain",
      description: "Set of three keys on a red carabiner keychain.",
      location: "Parking Lot B",
      date: new Date("2026-08-01"),
    });
    const found = report({
      category: "ELECTRONICS",
      itemName: "iPhone charger",
      description: "White Apple charging cable, lightly used.",
      location: "Cafeteria",
      date: new Date("2026-08-18"),
    });

    const { score } = computeMatchScore(lost, found);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(20);
    expect(score).toBeLessThan(MATCH_THRESHOLD);
  });

  // Example 4: strong match on everything except date (80 days apart) - time never eliminates a match.
  it("keeps a strong match strong despite a large date gap (80-95)", () => {
    const lost = report({
      category: "BAGS_AND_BACKPACKS",
      itemName: "Blue Jansport backpack",
      description: "Navy blue backpack with a small tear on the front pocket.",
      location: "Science Building",
      date: new Date("2026-06-01"),
      color: "Blue",
      brand: "Jansport",
    });
    const found = report({
      category: "BAGS_AND_BACKPACKS",
      itemName: "Blue Jansport backpack",
      description: "Blue backpack, front pocket has a small rip.",
      location: "Science Building",
      date: new Date("2026-08-20"),
      color: "Blue",
      brand: "Jansport",
    });

    const { score, reasons } = computeMatchScore(lost, found);
    expect(score).toBeGreaterThanOrEqual(80);
    expect(score).toBeLessThanOrEqual(95);

    const dateReason = reasons.find((r) => r.signal === "date");
    expect(dateReason?.similarity).toBeLessThan(0.15);
  });

  // Example 5: all optional fields (color/brand/timeOfDay) missing on both sides.
  it("does not penalize missing optional fields (80-95)", () => {
    const lost = report({
      category: "DOCUMENTS_AND_IDS",
      itemName: "Student ID card",
      description: "Blue student ID card, lost near the library front desk.",
      location: "Library",
      date: new Date("2026-08-05"),
    });
    const found = report({
      category: "DOCUMENTS_AND_IDS",
      itemName: "Student ID",
      description: "Found a blue student ID card near the library front desk.",
      location: "Library",
      date: new Date("2026-08-06"),
    });

    const { score, reasons } = computeMatchScore(lost, found);
    expect(score).toBeGreaterThanOrEqual(80);
    expect(score).toBeLessThanOrEqual(95);

    for (const key of ["color", "brand", "timeOfDay"] as const) {
      const reason = reasons.find((r) => r.signal === key);
      expect(reason?.applicable).toBe(false);
      expect(reason?.contribution).toBe(0);
    }
  });

  it("redistributes skipped signals' weight so contributions still sum to the total score", () => {
    const lost = report({ itemName: "Red umbrella" });
    const found = report({ itemName: "Red umbrella" });

    const { score, reasons } = computeMatchScore(lost, found);
    const summed = Math.round(reasons.reduce((sum, r) => sum + r.contribution, 0));
    expect(summed).toBe(score);

    const applicableWeights = reasons.filter((r) => r.applicable).map((r) => r.weight);
    const totalWeight = applicableWeights.reduce((sum, w) => sum + w, 0);
    expect(Math.round(totalWeight)).toBe(100);
  });

  it("never lets category alone gate a match to zero", () => {
    const lost = report({
      category: "KEYS",
      itemName: "Matching item name here",
      description: "Exactly the same descriptive text on both sides for this test.",
      location: "Same Building",
      date: new Date("2026-08-15"),
    });
    const found = report({
      category: "ELECTRONICS",
      itemName: "Matching item name here",
      description: "Exactly the same descriptive text on both sides for this test.",
      location: "Same Building",
      date: new Date("2026-08-15"),
    });

    const { score } = computeMatchScore(lost, found);
    // Category mismatch alone shouldn't tank an otherwise-perfect match below the threshold.
    expect(score).toBeGreaterThanOrEqual(MATCH_THRESHOLD);
  });
});

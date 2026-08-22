import {
  categorySimilarity,
  colorSimilarity,
  dateSimilarity,
  jaccardSimilarity,
  levenshteinDistance,
  stringSimilarity,
  textSimilarity,
  timeOfDaySimilarity,
} from "../similarity";

describe("jaccardSimilarity", () => {
  it("is 1 for identical text", () => {
    expect(jaccardSimilarity("Blue Jansport Backpack", "blue jansport backpack")).toBe(1);
  });

  it("is 0 when there is no shared vocabulary", () => {
    expect(jaccardSimilarity("red umbrella", "black wallet")).toBe(0);
  });

  it("gives partial credit for partial word overlap", () => {
    const score = jaccardSimilarity("blue backpack with a tear", "blue backpack no damage");
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(1);
  });

  it("ignores stopwords and punctuation", () => {
    expect(jaccardSimilarity("a case of keys", "case, keys.")).toBe(1);
  });
});

describe("levenshteinDistance", () => {
  it("is 0 for identical strings", () => {
    expect(levenshteinDistance("apple", "apple")).toBe(0);
  });

  it("counts a single substitution", () => {
    expect(levenshteinDistance("samsung", "samsun")).toBe(1);
  });

  it("handles empty strings", () => {
    expect(levenshteinDistance("", "abc")).toBe(3);
    expect(levenshteinDistance("abc", "")).toBe(3);
  });
});

describe("stringSimilarity", () => {
  it("is 1 for identical (normalized) strings", () => {
    expect(stringSimilarity("Apple", "apple")).toBe(1);
  });

  it("is high for a minor typo", () => {
    expect(stringSimilarity("Samsung", "Samsun")).toBeGreaterThan(0.8);
  });

  it("is low for very different strings", () => {
    expect(stringSimilarity("Apple", "Zephyr")).toBeLessThan(0.3);
  });
});

describe("textSimilarity", () => {
  it("catches shared words even when spelled very differently overall", () => {
    // "airpods" vs "earbud" share no characters worth mentioning, but "case" is shared.
    const score = textSimilarity("AirPods case", "wireless earbud case");
    expect(score).toBeGreaterThan(0.3);
  });
});

describe("categorySimilarity", () => {
  it("is 1 for an exact match", () => {
    expect(categorySimilarity("ELECTRONICS", "ELECTRONICS")).toBe(1);
  });

  it("gives partial credit to a known related pair", () => {
    expect(categorySimilarity("ELECTRONICS", "CLOTHING_AND_ACCESSORIES")).toBe(0.5);
  });

  it("is symmetric", () => {
    expect(categorySimilarity("CLOTHING_AND_ACCESSORIES", "ELECTRONICS")).toBe(0.5);
  });

  it("treats OTHER as related to everything", () => {
    expect(categorySimilarity("OTHER", "KEYS")).toBe(0.5);
  });

  it("is never zero for an unrelated pair (soft signal, not a hard gate)", () => {
    const score = categorySimilarity("KEYS", "ELECTRONICS");
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(0.5);
  });
});

describe("dateSimilarity", () => {
  it("is 1 for the same date", () => {
    expect(dateSimilarity(new Date("2026-08-15"), new Date("2026-08-15"))).toBe(1);
  });

  it("decays as the gap grows, but never reaches 0", () => {
    const close = dateSimilarity(new Date("2026-08-15"), new Date("2026-08-16"));
    const far = dateSimilarity(new Date("2026-08-15"), new Date("2026-11-15"));
    expect(close).toBeGreaterThan(far);
    expect(far).toBeGreaterThan(0);
  });

  it("is symmetric regardless of which date is earlier", () => {
    const a = dateSimilarity(new Date("2026-08-01"), new Date("2026-08-10"));
    const b = dateSimilarity(new Date("2026-08-10"), new Date("2026-08-01"));
    expect(a).toBe(b);
  });
});

describe("timeOfDaySimilarity", () => {
  it("is 1 for an exact match", () => {
    expect(timeOfDaySimilarity("MORNING", "MORNING")).toBe(1);
  });

  it("decays with ordinal distance", () => {
    expect(timeOfDaySimilarity("MORNING", "AFTERNOON")).toBeGreaterThan(
      timeOfDaySimilarity("MORNING", "NIGHT")
    );
  });
});

describe("colorSimilarity", () => {
  it("matches identical colors", () => {
    expect(colorSimilarity("Blue", "blue")).toBe(1);
  });

  it("matches known synonyms", () => {
    expect(colorSimilarity("Navy", "blue")).toBe(1);
    expect(colorSimilarity("grey", "Gray")).toBe(1);
  });

  it("does not match unrelated colors", () => {
    expect(colorSimilarity("red", "blue")).toBe(0);
  });
});

// Presentation-only tiers layered on top of a qualifying score (>= MATCH_THRESHOLD).
// Purely visual: does not affect which pairs are computed or stored.
const STRONG_MATCH_CUTOFF = 75;

export type MatchTier = {
  label: string;
  badgeVariant: "strong" | "possible";
  ringColorClassName: string;
};

export function getMatchTier(score: number): MatchTier {
  if (score >= STRONG_MATCH_CUTOFF) {
    return { label: "Strong match", badgeVariant: "strong", ringColorClassName: "stroke-indigo-400" };
  }
  return { label: "Possible match", badgeVariant: "possible", ringColorClassName: "stroke-amber-400" };
}

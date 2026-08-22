import { getMatchTier } from "@/components/matches/match-tier";

const SIZE = 72;
const STROKE_WIDTH = 6;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function MatchScoreRing({ score }: { score: number }) {
  const tier = getMatchTier(score);
  const offset = CIRCUMFERENCE * (1 - score / 100);

  return (
    <div className="relative flex size-[72px] shrink-0 items-center justify-center">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90">
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE_WIDTH}
          className="stroke-slate-200"
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          className={tier.ringColorClassName}
        />
      </svg>
      <span className="absolute text-lg font-semibold text-foreground">{score}</span>
    </div>
  );
}

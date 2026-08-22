import type { SignalReason } from "@/lib/matching/types";
import { SIGNAL_LABELS } from "@/components/matches/signal-labels";

const MAX_KEY_REASONS = 3;

export function MatchKeyReasons({ reasons }: { reasons: SignalReason[] }) {
  const topReasons = reasons
    .filter((reason) => reason.applicable)
    .slice()
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, MAX_KEY_REASONS);

  if (topReasons.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {topReasons.map((reason) => (
        <span
          key={reason.signal}
          className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground"
        >
          {SIGNAL_LABELS[reason.signal]}
          <span className="text-accent-foreground/70">{Math.round(reason.similarity * 100)}%</span>
        </span>
      ))}
    </div>
  );
}

import type { SignalReason } from "@/lib/matching/types";
import { SIGNAL_LABELS } from "@/components/matches/signal-labels";

export function ReasonBar({ reason }: { reason: SignalReason }) {
  const percent = Math.round(reason.similarity * 100);

  return (
    <div className={reason.applicable ? "" : "opacity-50"}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-foreground">{SIGNAL_LABELS[reason.signal]}</span>
        <span className="text-muted-foreground">{reason.applicable ? `${percent}%` : "n/a"}</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-stone-800">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: reason.applicable ? `${percent}%` : "0%" }}
        />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{reason.note}</p>
    </div>
  );
}

export function LostFoundBar({ lostCount, foundCount }: { lostCount: number; foundCount: number }) {
  const total = lostCount + foundCount;
  const lostPercent = total === 0 ? 50 : Math.round((lostCount / total) * 100);

  return (
    <div>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-stone-800">
        {total === 0 ? null : (
          <>
            <div className="h-full bg-rose-400" style={{ width: `${lostPercent}%` }} />
            <div className="h-full bg-green-400" style={{ width: `${100 - lostPercent}%` }} />
          </>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-rose-400" />
          {lostCount} lost
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-green-400" />
          {foundCount} found
        </span>
      </div>
    </div>
  );
}

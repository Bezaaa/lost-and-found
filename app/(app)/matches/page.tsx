import { getActiveMatchesForUser } from "@/lib/matching/service";
import { requireUser } from "@/lib/session";
import { MatchCard } from "@/components/matches/match-card";
import { PaginationControls } from "@/components/ui/pagination-controls";
import type { SignalReason } from "@/lib/matching/types";

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await requireUser();
  const sp = await searchParams;
  const page = Number(sp.page) || 1;

  const { items, total, page: currentPage, totalPages } = await getActiveMatchesForUser(user.id, page);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Potential matches</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ranked by similarity across all of your active reports. A high score is a strong hint,
          not a guarantee — always confirm details before handing anything over.
        </p>
      </div>

      {total === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center">
          <p className="text-sm font-medium text-foreground">No potential matches yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            When an active report of yours scores well against an opposite-type report, it will
            show up here automatically.
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {total} potential {total === 1 ? "match" : "matches"}
          </p>

          <div className="flex flex-col gap-5">
            {items.map((match) => (
              <MatchCard
                key={match.id}
                id={match.id}
                score={match.score}
                reasons={match.reasons as unknown as SignalReason[]}
                lostReport={match.lostReport}
                foundReport={match.foundReport}
              />
            ))}
          </div>

          <PaginationControls
            basePath="/matches"
            params={new URLSearchParams()}
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </>
      )}
    </div>
  );
}
